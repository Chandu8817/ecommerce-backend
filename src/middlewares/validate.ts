// validate.ts
// Input validation middleware using Joi
import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";

import { AppError } from "../utils/AppError";

export function validateBody(schema: ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return next(new AppError("VALIDATION_ERROR", error.details.map(d => d.message).join(", "), 400));
    }
    next();
  };
}
