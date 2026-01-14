"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
const AppError_1 = require("../utils/AppError");
function validateBody(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            return next(new AppError_1.AppError("VALIDATION_ERROR", error.details.map(d => d.message).join(", "), 400));
        }
        next();
    };
}
