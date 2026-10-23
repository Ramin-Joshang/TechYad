export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;
  public fieldErrors?: Record<string, string>;
  public requestId?: string;
  public details?: any;

  constructor(
    message: string,
    statusCode: number,
    code: string = 'INTERNAL_ERROR',
    isOperational = true,
    fieldErrors?: Record<string, string>,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.fieldErrors = fieldErrors;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}
