"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const AppError_1 = require("../utils/AppError");
// errorHandler.ts
// Centralized error handler middleware
const logger_1 = __importDefault(require("../utils/logger"));
function errorHandler(err, req, res, next) {
    logger_1.default.error(err);
    if (err instanceof AppError_1.AppError) {
        return res.status(err.statusCode || 500).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                details: err.details || undefined,
            },
        });
    }
    res.status(500).json({
        success: false,
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred.",
        },
    });
}
