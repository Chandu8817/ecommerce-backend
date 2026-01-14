import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../utils/apiResponse';

declare module 'express-serve-static-core' {
  interface Request {
    id?: string;
  }
}

export function responseHandler(req: Request, res: Response, next: NextFunction) {
  // Save the original json method
  const originalJson = res.json;
  
  // Override the json method
  res.json = function (body?: any): Response {
    // If the response already has a status code of 4xx or 5xx, let the error handler handle it
    if (res.statusCode >= 400) {
      return originalJson.call(this, body);
    }

    // Get request ID if available
    const requestId = (Array.isArray(req.headers['x-request-id']) 
      ? req.headers['x-request-id'][0] 
      : req.headers['x-request-id']) || req?.id || '';

    // Format the response
    const formattedResponse = successResponse(
      body?.data || body || null,
      body?.message || 'Success',
      requestId
    );

    // Call the original json method with the formatted response
    return originalJson.call(this, formattedResponse);
  };

  next();
}
