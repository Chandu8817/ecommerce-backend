// response.ts
// Standard API response helper
export function success(data: any, message = "Success") {
  return {
    success: true,
    data,
    message,
  };
}

export function error(message: string, code = "ERROR", details?: any) {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}
