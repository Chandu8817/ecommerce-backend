// refreshToken.ts
// Middleware and helpers for refresh token handling
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_REFRESH_SECRET } from "../config/env";
import { AppError } from "../utils/AppError";

export function generateRefreshToken(id: string) {
  return jwt.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: "30d" });
}

export function verifyRefreshToken(token: string) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch {
    throw new AppError("INVALID_TOKEN", "Refresh token is invalid or expired", 401);
  }
}

export const requireRefreshToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.body.refreshToken || req.cookies.refreshToken;
  if (!token) {
    return next(new AppError("UNAUTHORIZED", "Refresh token required", 401));
  }
  try {
    req.user = verifyRefreshToken(token);
    next();
  } catch (err) {
    next(err);
  }
};
