"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendErrorResponse = exports.sendResponse = exports.createErrorResponse = exports.createSuccessResponse = void 0;
const createSuccessResponse = (data = null, message = 'Success', statusCode = 200) => {
    return {
        data,
        status: 'success',
        message,
        statusCode
    };
};
exports.createSuccessResponse = createSuccessResponse;
const createErrorResponse = (code, message, statusCode = 400, details = []) => {
    return {
        code,
        message,
        status: statusCode >= 500 ? 'error' : 'fail',
        statusCode,
        details
    };
};
exports.createErrorResponse = createErrorResponse;
const sendResponse = (res, data = null, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json({
        data,
        status: 'success',
        message
    });
};
exports.sendResponse = sendResponse;
const sendErrorResponse = (res, code, message, statusCode = 400, details = []) => {
    res.status(statusCode).json({
        code,
        message,
        status: statusCode >= 500 ? 'error' : 'fail',
        details
    });
};
exports.sendErrorResponse = sendErrorResponse;
