
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { errorResponse } from "../utils/apiResponse";



// errorHandler.ts
// Centralized error handler middleware
import logger from "../utils/logger";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error(err);
  if (err instanceof AppError) {
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
