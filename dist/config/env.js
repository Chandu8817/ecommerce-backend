"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTP_VIA_PHONE = exports.EMAIL_FROM = exports.EMAIL_PASSWORD = exports.EMAIL_USER = exports.EMAIL_PORT = exports.EMAIL_HOST = exports.TWILIO_FROM_NUMBER = exports.TWILIO_AUTH_TOKEN = exports.TWILIO_ACCOUNT_SID = exports.S3_BUCKET = exports.REDIS_URL = exports.DB_URI = exports.JWT_REFRESH_SECRET = exports.JWT_SECRET = exports.PORT = exports.NODE_ENV = void 0;
// env.ts
// Centralized environment variable loader
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.NODE_ENV = process.env.NODE_ENV || 'development';
exports.PORT = process.env.PORT || 3000;
exports.JWT_SECRET = process.env.JWT_SECRET || '';
exports.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '';
exports.DB_URI = process.env.MONGO_URL_test || process.env.MONGO_URL || '';
exports.REDIS_URL = process.env.REDIS_URL || '';
exports.S3_BUCKET = process.env.S3_BUCKET || '';
exports.TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
exports.TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
exports.TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER || '';
// Email service configuration
exports.EMAIL_HOST = process.env.EMAIL_HOST || '';
exports.EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
exports.EMAIL_USER = process.env.EMAIL_USER || '';
exports.EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || '';
exports.EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@rawbharat.shop';
// OTP Configuration - set to 'false' to use email, 'true' to use phone/SMS
exports.OTP_VIA_PHONE = process.env.OTP_VIA_PHONE === 'true';
// ...add other env variables as needed
if (!exports.JWT_SECRET || !exports.DB_URI) {
    throw new Error('Critical environment variables missing');
}
