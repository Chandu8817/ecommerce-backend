
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { errorResponse } from "../utils/errorResponse";

declare module "express-serve-static-core" {
  interface Request {
    id?: string;
  }
}
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const code = err.code || "INTERNAL_SERVER_ERROR";
  const message = err.message || "Something went wrong";
  const details = err.details || [];
  const requestId = req.headers["x-request-id"] || req?.id || undefined;

  return res.status(statusCode).json(
    errorResponse(code, message, details, requestId as string)
  );
}
