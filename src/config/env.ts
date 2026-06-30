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
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';
export const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'ecommerce';
// Google Sign-In (verify ID tokens issued for this OAuth client)
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

// ...add other env variables as needed

if (!JWT_SECRET || !DB_URI) {
  throw new Error('Critical environment variables missing');
}
