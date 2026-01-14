"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRefreshToken = void 0;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyRefreshToken = verifyRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const AppError_1 = require("../utils/AppError");
function generateRefreshToken(id) {
    return jsonwebtoken_1.default.sign({ id }, env_1.JWT_REFRESH_SECRET, { expiresIn: "30d" });
}
function verifyRefreshToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, env_1.JWT_REFRESH_SECRET);
    }
    catch {
        throw new AppError_1.AppError("INVALID_TOKEN", "Refresh token is invalid or expired", 401);
    }
}
const requireRefreshToken = (req, res, next) => {
    const token = req.body.refreshToken || req.cookies.refreshToken;
    if (!token) {
        return next(new AppError_1.AppError("UNAUTHORIZED", "Refresh token required", 401));
    }
    try {
        const decoded = verifyRefreshToken(token);
        req.user = typeof decoded === 'string' ? JSON.parse(decoded) : decoded;
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.requireRefreshToken = requireRefreshToken;
