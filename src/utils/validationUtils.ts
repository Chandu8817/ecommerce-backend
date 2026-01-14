import { validationResult, ValidationError } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError';

type ValidationErrorDetail = {
    field?: string;
    issue: string;
};

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors: ValidationErrorDetail[] = [];
        
        for (const error of errors.array()) {
            console.log('Validation error detail:', error);
            if ('param' in error) {
                formattedErrors.push({
                    field: String(error.param),
                    issue: error.msg || 'Validation error'
                });
            } else {
                formattedErrors.push({
                    issue: error.msg || 'Validation error'
                });
            }
        }
        
        throw new AppError(
            'VALIDATION_ERROR',
            'Validation failed',
            400,
            formattedErrors
        );
    }
    next();
};
