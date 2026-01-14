"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.success = success;
exports.error = error;
// response.ts
// Standard API response helper
function success(data, message = "Success") {
    return {
        success: true,
        data,
        message,
    };
}
function error(message, code = "ERROR", details) {
    return {
        success: false,
        error: {
            code,
            message,
            details,
        },
    };
}
