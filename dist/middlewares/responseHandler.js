"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseHandler = responseHandler;
const apiResponse_1 = require("../utils/apiResponse");
function responseHandler(req, res, next) {
    // Save the original json method
    const originalJson = res.json;
    // Override the json method
    res.json = function (body) {
        // If the response already has a status code of 4xx or 5xx, let the error handler handle it
        if (res.statusCode >= 400) {
            return originalJson.call(this, body);
        }
        // Get request ID if available
        const requestId = (Array.isArray(req.headers['x-request-id'])
            ? req.headers['x-request-id'][0]
            : req.headers['x-request-id']) || req?.id || '';
        // Format the response
        const formattedResponse = (0, apiResponse_1.successResponse)(body?.data || body || null, body?.message || 'Success', requestId);
        // Call the original json method with the formatted response
        return originalJson.call(this, formattedResponse);
    };
    next();
}
