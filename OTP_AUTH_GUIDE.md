# Mobile OTP Authentication Guide

## Overview
The authentication system has been updated to use **mobile OTP** instead of password-based login. This is a two-step process:

1. **Request OTP** - User enters phone number
2. **Verify OTP** - User enters received OTP to login

## Key Changes

### 1. Database Model Updates
**File:** `src/models/User.ts`

- **phone**: Required, unique (primary identifier)
- **name**: Optional (can be updated after login)
- **email**: Optional (can be updated after login)
- **password**: Optional (removed from requirement)
- **otp**: Temporary field to store OTP
- **otpExpiresAt**: OTP expiration timestamp (10 minutes)

### 2. New API Endpoints

#### Request OTP
```
POST /api/v1/auth/request-otp
Content-Type: application/json

{
  "phone": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "phone": "+919876543210",
  "expiresIn": 600
}
```

#### Verify OTP & Login
```
POST /api/v1/auth/verify-otp
Content-Type: application/json

{
  "phone": "+919876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "user": {
    "_id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "phone": "+919876543210"
  },
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}
```

#### Update Profile (Optional)
```
POST /api/v1/auth/update-profile
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210"
  }
}
```

## Authentication Flow

### First-Time User (New Registration)
```
1. User enters phone number
   → POST /auth/request-otp
   
2. System creates new user with empty name/email
   
3. OTP sent to phone number
   
4. User enters OTP
   → POST /auth/verify-otp
   
5. User authenticated with JWT token
   
6. (Optional) User updates profile with name & email
   → POST /auth/update-profile
```

### Existing User (Login)
```
1. User enters phone number
   → POST /auth/request-otp
   
2. System finds existing user
   
3. OTP sent to phone number
   
4. User enters OTP
   → POST /auth/verify-otp
   
5. User authenticated with JWT token
```

## Frontend Integration Example

### Step 1: Request OTP
```typescript
const handleRequestOTP = async (phone: string) => {
  try {
    const response = await fetch('/api/v1/auth/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('OTP sent successfully');
      // Show OTP input screen
    }
  } catch (error) {
    console.error('Failed to request OTP:', error);
  }
};
```

### Step 2: Verify OTP
```typescript
const handleVerifyOTP = async (phone: string, otp: string) => {
  try {
    const response = await fetch('/api/v1/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });
    
    const data = await response.json();
    if (data.success) {
      // Store tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      // Redirect to home or profile completion
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Failed to verify OTP:', error);
  }
};
```

### Step 3: Update Profile (Optional)
```typescript
const handleUpdateProfile = async (name: string, email: string) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch('/api/v1/auth/update-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, email })
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('Profile updated:', data.user);
    }
  } catch (error) {
    console.error('Failed to update profile:', error);
  }
};
```

## OTP Configuration

### Current Settings
- **OTP Format:** 6-digit random number
- **OTP Validity:** 10 minutes
- **OTP Delivery:** SMS (TODO: integrate with SMS provider)

### SMS Provider Integration
To send OTP via SMS, update the `sendOTP()` function in `src/services/user.service.ts`:

**Example with Twilio:**
```typescript
import twilio from 'twilio';

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

async function sendOTP(phone: string, otp: string): Promise<void> {
  await twilioClient.messages.create({
    body: `Your OTP is: ${otp}. Valid for 10 minutes.`,
    from: TWILIO_PHONE_NUMBER,
    to: phone
  });
}
```

**Example with AWS SNS:**
```typescript
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({ region: 'us-east-1' });

async function sendOTP(phone: string, otp: string): Promise<void> {
  const command = new PublishCommand({
    Message: `Your OTP is: ${otp}. Valid for 10 minutes.`,
    PhoneNumber: phone,
  });
  
  await snsClient.send(command);
}
```

## Error Handling

The system returns proper error responses:

```json
{
  "success": false,
  "message": "Invalid OTP",
  "code": "INVALID_OTP",
  "statusCode": 400,
  "errors": [
    {
      "field": "otp",
      "issue": "OTP does not match"
    }
  ]
}
```

## Security Considerations

1. **OTP Expiry:** OTP expires after 10 minutes
2. **Phone Uniqueness:** Each phone number can only have one account
3. **OTP Storage:** OTP stored as plain text (consider hashing in production)
4. **Token Expiry:** JWT tokens expire after 7 days
5. **HTTPS Required:** Always use HTTPS in production

## Removed Features

The following authentication methods have been removed:
- Email/Password registration
- Email/Password login
- Admin-specific login endpoint

If you need these for admin users, create separate endpoints with email/password logic.

## Migration Notes

If you have existing users with passwords:
1. Backup your database
2. Add phone numbers to all existing users
3. Clear or hash the password field
4. Test the OTP flow with test users

## Testing

### Test OTP Flow Locally
```bash
# Request OTP
curl -X POST http://localhost:4000/api/v1/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'

# Check console for OTP (in development)
# Output: OTP for +919876543210: 123456

# Verify OTP
curl -X POST http://localhost:4000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "otp": "123456"}'
```

## Support

For questions or issues:
1. Check error messages returned by API
2. Review logs in the console
3. Ensure phone number format is correct
4. Verify OTP hasn't expired (10 minutes)
