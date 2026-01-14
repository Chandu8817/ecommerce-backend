export class AppError extends Error {
  code: string;
  statusCode: number;
  details: { field?: string; issue: string }[];

  constructor(
    code: string,
    message: string,
    statusCode = 400,
    details: { field?: string; issue: string }[] = []
  ) {
    super(message);


    Object.setPrototypeOf(this, new.target.prototype);

    this.name = "AppError"; 
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

   
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
