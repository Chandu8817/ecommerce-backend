# Email OTP Setup Guide

## Overview
The OTP system now supports both **Email** and **SMS (Twilio)** based OTP delivery. You can switch between them using the `OTP_VIA_PHONE` environment variable.

## Current Configuration
- **Default Mode**: Email OTP (due to budget constraints)
- **SMS Mode**: Available but disabled (Twilio code is preserved for future use)

## Environment Variables

Add these variables to your `.env` file:

```env
# OTP Configuration
# Set to 'false' for Email OTP (default), 'true' for SMS OTP
OTP_VIA_PHONE=false

# Email Service Configuration (required when OTP_VIA_PHONE=false)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@rawbharat.shop

# Twilio SMS Configuration (required when OTP_VIA_PHONE=true)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=+1234567890
```

## Setting Up Email Service

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account Settings → Security
   - Enable 2-Step Verification
   - Go to App Passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the generated 16-character password
3. **Update .env**:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```

### Option 2: Other Email Providers

#### SendGrid (Free tier: 100 emails/day)
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

#### Mailtrap (For Testing)
```env
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-mailtrap-username
EMAIL_PASSWORD=your-mailtrap-password
```

#### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

## API Changes

### Request OTP Endpoint
**POST** `/api/auth/request-otp`

#### When using Email OTP (`OTP_VIA_PHONE=false`):
```json
{
  "phone": "9876543210",
  "email": "user@example.com"
}
```

#### When using SMS OTP (`OTP_VIA_PHONE=true`):
```json
{
  "phone": "9876543210"
}
```

#### Response:
```json
{
  "success": true,
  "message": "OTP sent successfully via email",
  "phone": "9876543210",
  "email": "user@example.com",
  "expiresIn": 600
}
```

### Verify OTP Endpoint
**POST** `/api/auth/verify-otp`

Request (unchanged):
```json
{
  "phone": "9876543210",
  "otp": "123456"
}
```

## Switching Between Email and SMS

To switch from Email OTP to SMS OTP in the future:

1. Update `.env`:
   ```env
   OTP_VIA_PHONE=true
   ```

2. Ensure Twilio credentials are configured:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_FROM_NUMBER=+1234567890
   ```

3. Restart the server

No code changes required! The system automatically switches based on the environment variable.

## Testing

### Test Email OTP:
1. Set `OTP_VIA_PHONE=false`
2. Configure email credentials
3. Make request to `/api/auth/request-otp` with phone and email
4. Check the email inbox for OTP
5. Verify OTP using `/api/auth/verify-otp`

### Console Fallback:
If email credentials are not configured, the OTP will be logged to the console for development:
```
Email service env vars missing; logging OTP instead.
OTP for user@example.com: 123456
```

## Email Template

The OTP email includes:
- Professional HTML template
- Large, centered OTP code
- 10-minute expiry notice
- Security reminder

## Troubleshooting

### Email not sending:
1. Check email credentials in `.env`
2. Verify EMAIL_HOST and EMAIL_PORT are correct
3. For Gmail: Ensure App Password is used (not regular password)
4. Check console for error messages
5. Check spam/junk folder

### OTP not received:
1. Check email address is valid
2. Verify `OTP_VIA_PHONE=false` in `.env`
3. Look for OTP in console logs (fallback mode)
4. Check email service provider limits

### Switching to SMS not working:
1. Verify `OTP_VIA_PHONE=true` in `.env`
2. Ensure Twilio credentials are valid
3. Check phone number format: `+91XXXXXXXXXX`
4. Verify Twilio account has credit

## Cost Comparison

| Service | Free Tier | Cost |
|---------|-----------|------|
| Gmail | 500 emails/day | Free |
| SendGrid | 100 emails/day | Free |
| Mailtrap | Unlimited (testing only) | Free |
| Twilio SMS | Trial credits | $0.0075/SMS (India) |

## Security Notes

- OTPs expire after 10 minutes
- Each OTP request generates a new code
- OTPs are cleared from database after verification
- Email passwords should use App Passwords (not account passwords)
- Never commit `.env` file to version control

## Future Improvements

1. Add SMS fallback if email fails
2. Implement rate limiting for OTP requests
3. Add OTP resend functionality
4. Support multiple OTP delivery channels per user
5. Add analytics for OTP delivery success rates
