// env.ts
// Centralized environment variable loader
import dotenv from 'dotenv';
dotenv.config();

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || 3000;
export const JWT_SECRET = process.env.JWT_SECRET || '';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '';
export const DB_URI = process.env.MONGO_URL_test || process.env.MONGO_URL || '';
export const REDIS_URL = process.env.REDIS_URL || '';
export const S3_BUCKET = process.env.S3_BUCKET || '';
export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
export const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER || '';

// Email service configuration
export const EMAIL_HOST = process.env.EMAIL_HOST || '';
export const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
export const EMAIL_USER = process.env.EMAIL_USER || '';
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || '';
export const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@rawbharat.shop';

// OTP Configuration - set to 'false' to use email, 'true' to use phone/SMS
export const OTP_VIA_PHONE = process.env.OTP_VIA_PHONE === 'true';

// ...add other env variables as needed

if (!JWT_SECRET || !DB_URI) {
  throw new Error('Critical environment variables missing');
}
