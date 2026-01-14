

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middlewares/auth";
import { AppError } from "../utils/AppError";
import { UserService } from "../services/user.service";
import { JWT_SECRET } from "../config/env";

const userService = new UserService();

const generateToken = (id: string) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });
};

/**
 * Request OTP - Step 1 of OTP flow
 * User enters phone number (and email if using email OTP) to receive OTP
 */
export const requestOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { phone, email ,role} = req.body;
        
        if (!phone) {
            throw new AppError(
                "MISSING_PHONE",
                "Phone number is required",
                400,
                [{ field: "phone", issue: "Phone number cannot be empty" }]
            );
        }

        const result = await userService.requestOTP(phone, email, role);
        
        res.status(200).json({
            success: true,
            message: result.message,
            phone: result.phone,
            email: result.email,
            expiresIn: result.expiresIn,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Verify OTP & Login - Step 2 of OTP flow
 * User enters OTP to verify and get authenticated
 */
export const verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { phone, otp } = req.body;
        
        if (!phone || !otp) {
            throw new AppError(
                "MISSING_FIELDS",
                "Phone and OTP are required",
                400,
                [{ field: "phone/otp", issue: "Both phone and OTP must be provided" }]
            );
        }

        const user = await userService.verifyOTP(phone, otp);
        
        res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
            accessToken: generateToken(user._id),
            refreshToken: generateToken(user._id), // Can implement separate refresh token logic
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Update user profile - Optional step after OTP login
 * User can update name, email after first-time login
 */
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
        
        const { name, email } = req.body;
        
        const user = await userService.updateUserDetails(req.user.id, { name, email });
        
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const getAuthUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
        const user = await userService.getAuthUser(req.user.id);
        if (!user) throw new AppError('USER_NOT_FOUND', 'User not found', 404);
        res.json(user);
    } catch (err) {
        next(err);
    }
};

export const addShippingAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
        const { name, street, city, state, zipCode, phone, isDefault } = req.body;
        const user = await userService.addShippingAddress(req.user.id, { name, street, city, state, zipCode, phone, isDefault });
        if (!user) throw new AppError('USER_NOT_FOUND', 'User not found', 404);
        res.json(user);
    } catch (err) {
        next(err);
    }
};

export const removeShippingAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
        const { id } = req.query;
        if (!id) throw new AppError('MISSING_PARAMETER', 'Address ID is required', 400);
        const user = await userService.removeShippingAddress(req.user.id, Number(id));
        if (!user) throw new AppError('USER_NOT_FOUND', 'User not found', 404);
        res.json(user);
    } catch (err) {
        next(err);
    }
};

export const getShippingAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
        const user = await userService.getAuthUser(req.user.id);
        if (!user) throw new AppError('USER_NOT_FOUND', 'User not found', 404);
        res.json(user.shippingAddress);
    } catch (err) {
        next(err);
    }
};
