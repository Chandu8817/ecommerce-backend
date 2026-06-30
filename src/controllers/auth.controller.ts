

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
 * Login / register with Google.
 * Frontend obtains a Google ID token via Google Sign-In and sends it as `idToken`.
 */
export const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { idToken, credential, role } = req.body;
        // Google Identity Services returns the token as `credential`; accept either name.
        const token = idToken || credential;

        if (!token) {
            throw new AppError(
                "MISSING_ID_TOKEN",
                "Google ID token is required",
                400,
                [{ field: "idToken", issue: "idToken cannot be empty" }]
            );
        }

        const user = await userService.loginWithGoogle(token, role);

        res.status(200).json({
            success: true,
            message: "Logged in with Google successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                picture: user.picture,
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
