// user.service.ts
// Handles business logic for user/auth with mobile OTP
import { IUser, IShippingAddress } from "../models/User";
import { AppError } from "../utils/AppError";
import { UserRepository } from "../repositories/user.repository";
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM, OTP_VIA_PHONE } from "../config/env";
import twilio from "twilio";
import nodemailer from "nodemailer";

const userRepository = new UserRepository();

/**
 * Generate a random 6-digit OTP
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via Email
 */
async function sendOTPviaEmail(email: string, otp: string): Promise<void> {
  // Fallback to console if email env vars are missing
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASSWORD) {
    console.warn("Email service env vars missing; logging OTP instead.");
    console.log(`OTP for ${email}: ${otp}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465, // true for 465, false for other ports
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: EMAIL_FROM,
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
async function sendOTPviaPhone(phone: string, otp: string): Promise<void> {
  // Fallback to console if Twilio env vars are missing
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    console.warn("Twilio env vars missing; logging OTP instead.");
    console.log(`OTP for ${phone}: ${otp}`);
    return;
  }

  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  await client.messages.create({
    body: `Your verification code is ${otp} to register or login to RawBharat.shop. It is valid for 10 minutes.`,
    from: TWILIO_FROM_NUMBER,
    to: `+91${phone}`,
  });
}

/**
 * Send OTP - dynamically chooses email or phone based on OTP_VIA_PHONE env variable
 */
async function sendOTP(contact: string, otp: string, isPhone: boolean = false): Promise<void> {
  if (OTP_VIA_PHONE && isPhone) {
    await sendOTPviaPhone(contact, otp);
  } else {
    await sendOTPviaEmail(contact, otp);
  }
}

export class UserService {
  /**
   * Request OTP - generates and sends OTP to phone number or email
   * Creates user if doesn't exist (first-time registration)
   */
  async requestOTP(phone: string, email?: string, role: string = "user") {
    // Validate phone format
    if (!phone || phone.trim().length === 0) {
      throw new AppError(
        "INVALID_PHONE",
        "Phone number is required",
        400,
        [{ field: "phone", issue: "Phone number cannot be empty" }]
      );
    }

    // If using email OTP, validate email
    if (!OTP_VIA_PHONE) {
      if (!email || email.trim().length === 0) {
        throw new AppError(
          "INVALID_EMAIL",
          "Email is required for OTP verification",
          400,
          [{ field: "email", issue: "Email cannot be empty" }]
        );
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
        role: role as "user" | "admin" | undefined,
      });
    } else if (email && !user.email) {
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
    const contact = OTP_VIA_PHONE ? phone : (email || user.email);
    await sendOTP(contact as string, otp, OTP_VIA_PHONE);

    return {
      message: `OTP sent successfully via ${OTP_VIA_PHONE ? 'SMS' : 'email'}`,
      phone,
      email: email || user.email,
      expiresIn: 600, // 10 minutes in seconds
    };
  }

  /**
   * Verify OTP and authenticate user
   */
  async verifyOTP(phone: string, otp: string) {
    // Validate inputs
    if (!phone || !otp) {
      throw new AppError(
        "INVALID_INPUT",
        "Phone and OTP are required",
        400,
        [{ field: "phone/otp", issue: "Both phone and OTP must be provided" }]
      );
    }

    // Find user by phone
    const user = await userRepository.findByPhone(phone);

    if (!user) {
      throw new AppError(
        "USER_NOT_FOUND",
        "User not found. Please request OTP first.",
        404,
        [{ field: "phone", issue: "No user found with this phone number" }]
      );
    }

    // Check if OTP exists and is not expired
    if (!user.otp || !user.otpExpiresAt) {
      throw new AppError(
        "NO_OTP",
        "No OTP found. Please request a new OTP.",
        400,
        [{ field: "otp", issue: "OTP not found or expired" }]
      );
    }

    if (new Date() > user.otpExpiresAt) {
      throw new AppError(
        "OTP_EXPIRED",
        "OTP has expired. Please request a new one.",
        400,
        [{ field: "otp", issue: "OTP has expired" }]
      );
    }

    // Verify OTP
    if (user.otp !== otp) {
      throw new AppError(
        "INVALID_OTP",
        "Invalid OTP",
        400,
        [{ field: "otp", issue: "OTP does not match" }]
      );
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
  async updateUserDetails(_id: string, userInput: Partial<IUser>) {
    const user = await userRepository.findById(_id);
    if (!user) {
      throw new AppError("USER_NOT_FOUND", "User not found", 404);
    }

    // Allow updating name and email (phone cannot be changed)
    if (userInput.name) user.name = userInput.name;
    if (userInput.email) user.email = userInput.email;

    await userRepository.save(user);
    return user;
  }

  async getAuthUser(_id: string) {
    return userRepository.findById(_id);
  }

  async addShippingAddress(_id: string, shippingAddress: IShippingAddress) {
    const user = await userRepository.findById(_id);
    if (!user) throw new AppError("USER_NOT_FOUND", "User not found", 404);
    user.shippingAddress.push(shippingAddress);
    await userRepository.save(user);
    return user;
  }

  async removeShippingAddress(_id: string, id: number) {
    const user = await userRepository.findById(_id);
    if (!user) throw new AppError("USER_NOT_FOUND", "User not found", 404);
    user.shippingAddress.splice(id, 1);
    await userRepository.save(user);
    return user;
  }
}
