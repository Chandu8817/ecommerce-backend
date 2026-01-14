interface ApiResponse<T = any> {
  data: T | null;
  status: string;
  message?: string;
  requestId?: string;
}

export function successResponse<T = any>(
  data: T | null = null,
  message: string = 'Success',
  requestId?: string
): ApiResponse<T> {
  return {
    data,
    status: 'success',
    message,
    requestId,
  };
}

export function errorResponse(
  code: string,
  message: string,
  details: any[] = [],
  requestId: string = ''
): ApiResponse<null> {
  return {
    data: null,
    status: 'error',
    message: `${code}: ${message}`,
    requestId,
  };
}

export const status = {
  SUCCESS: 'success',
  ERROR: 'error',
  FAIL: 'fail'
};
