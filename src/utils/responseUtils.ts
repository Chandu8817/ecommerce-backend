import { Response } from 'express';

type ApiResponse<T = any> = {
    data: T | null;
    status: 'success' | 'error' | 'fail';
    message?: string;
    requestId?: string;
};

export const createSuccessResponse = <T = any>(
    data: T | null = null,
    message: string = 'Success',
    statusCode: number = 200
) => {
    return {
        data,
        status: 'success',
        message,
        statusCode
    };
};

export const createErrorResponse = (
    code: string,
    message: string,
    statusCode: number = 400,
    details: Array<{ field?: string; issue: string }> = []
) => {
    return {
        code,
        message,
        status: statusCode >= 500 ? 'error' : 'fail',
        statusCode,
        details
    };
};

export const sendResponse = <T = any>(
    res: Response,
    data: T | null = null,
    message: string = 'Success',
    statusCode: number = 200
) => {
    res.status(statusCode).json({
        data,
        status: 'success',
        message
    });
};

export const sendErrorResponse = (
    res: Response,
    code: string,
    message: string,
    statusCode: number = 400,
    details: Array<{ field?: string; issue: string }> = []
) => {
    res.status(statusCode).json({
        code,
        message,
        status: statusCode >= 500 ? 'error' : 'fail',
        details
    });
};
