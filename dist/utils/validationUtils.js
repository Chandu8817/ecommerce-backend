"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const AppError_1 = require("./AppError");
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const formattedErrors = [];
        for (const error of errors.array()) {
            console.log('Validation error detail:', error);
            if ('param' in error) {
                formattedErrors.push({
                    field: String(error.param),
                    issue: error.msg || 'Validation error'
                });
            }
            else {
                formattedErrors.push({
                    issue: error.msg || 'Validation error'
                });
            }
        }
        throw new AppError_1.AppError('VALIDATION_ERROR', 'Validation failed', 400, formattedErrors);
    }
    next();
};
exports.validateRequest = validateRequest;
