// rbac.ts
// Role-based access control middleware
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return next(new AppError("FORBIDDEN", "Insufficient permissions", 403));
    }
    next();
  };
}
