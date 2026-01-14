"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const AppError_1 = require("../utils/AppError");
const user_repository_1 = require("../repositories/user.repository");
const env_1 = require("../config/env");
const twilio_1 = __importDefault(require("twilio"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const userRepository = new user_repository_1.UserRepository();
/**
 * Generate a random 6-digit OTP
 */
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
/**
 * Send OTP via Email
 */
async function sendOTPviaEmail(email, otp) {
    // Fallback to console if email env vars are missing
    if (!env_1.EMAIL_HOST || !env_1.EMAIL_USER || !env_1.EMAIL_PASSWORD) {
        console.warn("Email service env vars missing; logging OTP instead.");
        console.log(`OTP for ${email}: ${otp}`);
        return;
    }
    const transporter = nodemailer_1.default.createTransport({
        host: env_1.EMAIL_HOST,
        port: env_1.EMAIL_PORT,
        secure: env_1.EMAIL_PORT === 465, // true for 465, false for other ports
        auth: {
            user: env_1.EMAIL_USER,
            pass: env_1.EMAIL_PASSWORD,
        },
    });
    const mailOptions = {
        from: env_1.EMAIL_FROM,
        to: email,
        subject: 'Your RawBharat.shop Verification Code',
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">RawBharat.shop Verification</h2>
        <p style="font-size: 16px;">Your verification code is:</p>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #666;">This code is valid for 10 minutes.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `,
    };
    await transporter.sendMail(mailOptions);
}
/**
 * Send OTP via SMS (Twilio)
 */
async function sendOTPviaPhone(phone, otp) {
    // Fallback to console if Twilio env vars are missing
    if (!env_1.TWILIO_ACCOUNT_SID || !env_1.TWILIO_AUTH_TOKEN || !env_1.TWILIO_FROM_NUMBER) {
        console.warn("Twilio env vars missing; logging OTP instead.");
        console.log(`OTP for ${phone}: ${otp}`);
        return;
    }
    const client = (0, twilio_1.default)(env_1.TWILIO_ACCOUNT_SID, env_1.TWILIO_AUTH_TOKEN);
    await client.messages.create({
        body: `Your verification code is ${otp} to register or login to RawBharat.shop. It is valid for 10 minutes.`,
        from: env_1.TWILIO_FROM_NUMBER,
        to: `+91${phone}`,
    });
}
/**
 * Send OTP - dynamically chooses email or phone based on OTP_VIA_PHONE env variable
 */
async function sendOTP(contact, otp, isPhone = false) {
    if (env_1.OTP_VIA_PHONE && isPhone) {
        await sendOTPviaPhone(contact, otp);
    }
    else {
        await sendOTPviaEmail(contact, otp);
    }
}
class UserService {
    /**
     * Request OTP - generates and sends OTP to phone number or email
     * Creates user if doesn't exist (first-time registration)
     */
    async requestOTP(phone, email, role = "user") {
        // Validate phone format
        if (!phone || phone.trim().length === 0) {
            throw new AppError_1.AppError("INVALID_PHONE", "Phone number is required", 400, [{ field: "phone", issue: "Phone number cannot be empty" }]);
        }
        // If using email OTP, validate email
        if (!env_1.OTP_VIA_PHONE) {
            if (!email || email.trim().length === 0) {
                throw new AppError_1.AppError("INVALID_EMAIL", "Email is required for OTP verification", 400, [{ field: "email", issue: "Email cannot be empty" }]);
            }
        }
        // Check if user exists
        let user = await userRepository.findByPhone(phone);
        // If new user, create account
        if (!user) {
            user = await userRepository.create({
                phone,
                name: "",
                email: email || "",
                role: role,
            });
        }
        else if (email && !user.email) {
            // Update email if provided and user doesn't have one
            user.email = email;
        }
        // Generate OTP
        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
        // Save OTP to user
        user.otp = otp;
        user.otpExpiresAt = otpExpiresAt;
        await userRepository.save(user);
        // Send OTP via Email or SMS based on configuration
        const contact = env_1.OTP_VIA_PHONE ? phone : (email || user.email);
        await sendOTP(contact, otp, env_1.OTP_VIA_PHONE);
        return {
            message: `OTP sent successfully via ${env_1.OTP_VIA_PHONE ? 'SMS' : 'email'}`,
            phone,
            email: email || user.email,
            expiresIn: 600, // 10 minutes in seconds
        };
    }
    /**
     * Verify OTP and authenticate user
     */
    async verifyOTP(phone, otp) {
        // Validate inputs
        if (!phone || !otp) {
            throw new AppError_1.AppError("INVALID_INPUT", "Phone and OTP are required", 400, [{ field: "phone/otp", issue: "Both phone and OTP must be provided" }]);
        }
        // Find user by phone
        const user = await userRepository.findByPhone(phone);
        if (!user) {
            throw new AppError_1.AppError("USER_NOT_FOUND", "User not found. Please request OTP first.", 404, [{ field: "phone", issue: "No user found with this phone number" }]);
        }
        // Check if OTP exists and is not expired
        if (!user.otp || !user.otpExpiresAt) {
            throw new AppError_1.AppError("NO_OTP", "No OTP found. Please request a new OTP.", 400, [{ field: "otp", issue: "OTP not found or expired" }]);
        }
        if (new Date() > user.otpExpiresAt) {
            throw new AppError_1.AppError("OTP_EXPIRED", "OTP has expired. Please request a new one.", 400, [{ field: "otp", issue: "OTP has expired" }]);
        }
        // Verify OTP
        if (user.otp !== otp) {
            throw new AppError_1.AppError("INVALID_OTP", "Invalid OTP", 400, [{ field: "otp", issue: "OTP does not match" }]);
        }
        // Clear OTP from user
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        await userRepository.save(user);
        return user;
    }
    /**
     * Update user details after OTP verification
     */
    async updateUserDetails(_id, userInput) {
        const user = await userRepository.findById(_id);
        if (!user) {
            throw new AppError_1.AppError("USER_NOT_FOUND", "User not found", 404);
        }
        // Allow updating name and email (phone cannot be changed)
        if (userInput.name)
            user.name = userInput.name;
        if (userInput.email)
            user.email = userInput.email;
        await userRepository.save(user);
        return user;
    }
    async getAuthUser(_id) {
        return userRepository.findById(_id);
    }
    async addShippingAddress(_id, shippingAddress) {
        const user = await userRepository.findById(_id);
        if (!user)
            throw new AppError_1.AppError("USER_NOT_FOUND", "User not found", 404);
        user.shippingAddress.push(shippingAddress);
        await userRepository.save(user);
        return user;
    }
    async removeShippingAddress(_id, id) {
        const user = await userRepository.findById(_id);
        if (!user)
            throw new AppError_1.AppError("USER_NOT_FOUND", "User not found", 404);
        user.shippingAddress.splice(id, 1);
        await userRepository.save(user);
        return user;
    }
}
exports.UserService = UserService;
