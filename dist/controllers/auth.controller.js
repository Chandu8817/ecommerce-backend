"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShippingAddress = exports.removeShippingAddress = exports.addShippingAddress = exports.getAuthUser = exports.updateProfile = exports.verifyOTP = exports.requestOTP = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("../utils/AppError");
const user_service_1 = require("../services/user.service");
const env_1 = require("../config/env");
const userService = new user_service_1.UserService();
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, env_1.JWT_SECRET, { expiresIn: "7d" });
};
/**
 * Request OTP - Step 1 of OTP flow
 * User enters phone number (and email if using email OTP) to receive OTP
 */
const requestOTP = async (req, res, next) => {
    try {
        const { phone, email, role } = req.body;
        if (!phone) {
            throw new AppError_1.AppError("MISSING_PHONE", "Phone number is required", 400, [{ field: "phone", issue: "Phone number cannot be empty" }]);
        }
        const result = await userService.requestOTP(phone, email, role);
        res.status(200).json({
            success: true,
            message: result.message,
            phone: result.phone,
            email: result.email,
            expiresIn: result.expiresIn,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.requestOTP = requestOTP;
/**
 * Verify OTP & Login - Step 2 of OTP flow
 * User enters OTP to verify and get authenticated
 */
const verifyOTP = async (req, res, next) => {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) {
            throw new AppError_1.AppError("MISSING_FIELDS", "Phone and OTP are required", 400, [{ field: "phone/otp", issue: "Both phone and OTP must be provided" }]);
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
    }
    catch (err) {
        next(err);
    }
};
exports.verifyOTP = verifyOTP;
/**
 * Update user profile - Optional step after OTP login
 * User can update name, email after first-time login
 */
const updateProfile = async (req, res, next) => {
    try {
        if (!req.user)
            throw new AppError_1.AppError('UNAUTHORIZED', 'Authentication required', 401);
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
    }
    catch (err) {
        next(err);
    }
};
exports.updateProfile = updateProfile;
const getAuthUser = async (req, res, next) => {
    try {
        if (!req.user)
            throw new AppError_1.AppError('UNAUTHORIZED', 'Authentication required', 401);
        const user = await userService.getAuthUser(req.user.id);
        if (!user)
            throw new AppError_1.AppError('USER_NOT_FOUND', 'User not found', 404);
        res.json(user);
    }
    catch (err) {
        next(err);
    }
};
exports.getAuthUser = getAuthUser;
const addShippingAddress = async (req, res, next) => {
    try {
        if (!req.user)
            throw new AppError_1.AppError('UNAUTHORIZED', 'Authentication required', 401);
        const { name, street, city, state, zipCode, phone, isDefault } = req.body;
        const user = await userService.addShippingAddress(req.user.id, { name, street, city, state, zipCode, phone, isDefault });
        if (!user)
            throw new AppError_1.AppError('USER_NOT_FOUND', 'User not found', 404);
        res.json(user);
    }
    catch (err) {
        next(err);
    }
};
exports.addShippingAddress = addShippingAddress;
const removeShippingAddress = async (req, res, next) => {
    try {
        if (!req.user)
            throw new AppError_1.AppError('UNAUTHORIZED', 'Authentication required', 401);
        const { id } = req.query;
        if (!id)
            throw new AppError_1.AppError('MISSING_PARAMETER', 'Address ID is required', 400);
        const user = await userService.removeShippingAddress(req.user.id, Number(id));
        if (!user)
            throw new AppError_1.AppError('USER_NOT_FOUND', 'User not found', 404);
        res.json(user);
    }
    catch (err) {
        next(err);
    }
};
exports.removeShippingAddress = removeShippingAddress;
const getShippingAddress = async (req, res, next) => {
    try {
        if (!req.user)
            throw new AppError_1.AppError('UNAUTHORIZED', 'Authentication required', 401);
        const user = await userService.getAuthUser(req.user.id);
        if (!user)
            throw new AppError_1.AppError('USER_NOT_FOUND', 'User not found', 404);
        res.json(user.shippingAddress);
    }
    catch (err) {
        next(err);
    }
};
exports.getShippingAddress = getShippingAddress;
