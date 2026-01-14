"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.status = void 0;
exports.successResponse = successResponse;
exports.errorResponse = errorResponse;
function successResponse(data = null, message = 'Success', requestId) {
    return {
        data,
        status: 'success',
        message,
        requestId,
    };
}
function errorResponse(code, message, details = [], requestId = '') {
    return {
        data: null,
        status: 'error',
        message: `${code}: ${message}`,
        requestId,
    };
}
exports.status = {
    SUCCESS: 'success',
    ERROR: 'error',
    FAIL: 'fail'
};
