import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import { env } from "../../config/env.js";
import { ApiLoggerService } from "../services/api-logger.service.js";
import { generateRequestId } from "./request-logger.middleware.js";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const requestId = req.requestId || (res.getHeader("X-Request-Id") as string) || generateRequestId();
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  let statusCode = 500;
  let code = "INTERNAL_ERROR";
  let message = `خطای غیرمنتظره در سرور رخ داده است. لطفاً مجدداً تلاش کنید. کد پیگیری: ${requestId}`;
  let fieldErrors: Record<string, string> | undefined = undefined;
  let details: any = undefined;
  let isOperational = false;

  // 1. Handled Operational AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code || "APP_ERROR";
    message = err.message;
    fieldErrors = err.fieldErrors;
    details = err.details;
    isOperational = err.isOperational;
  }
  // 2. Mongoose Validation Error (Schema field constraint failures)
  else if (err.name === "ValidationError" && err.errors) {
    statusCode = 422;
    code = "VALIDATION_ERROR";
    message = "اطلاعات واردشده معتبر نیست. لطفاً مقادیر مشخص‌شده را بررسی نمایید.";
    fieldErrors = {};
    for (const key of Object.keys(err.errors)) {
      fieldErrors[key] = err.errors[key].message || "مقدار واردشده نامعتبر است";
    }
    isOperational = true;
  }
  // 3. Mongoose CastError (Invalid ObjectId or format)
  else if (err.name === "CastError") {
    statusCode = 400;
    code = "INVALID_ID_FORMAT";
    message = `فرمت شناسه یا مقدار فیلد «${err.path || "درخواستی"}» نامعتبر است.`;
    isOperational = true;
  }
  // 4. Mongoose Duplicate Key Error (Code 11000)
  else if (err.code === 11000) {
    statusCode = 409;
    code = "DUPLICATE_RESOURCE";
    const duplicateFields = Object.keys(err.keyPattern || err.keyValue || {}).join(", ");
    message = duplicateFields
      ? `رکورد با فیلد یکتای (${duplicateFields}) قبلاً در سیستم ثبت شده است و تکراری می‌باشد.`
      : "اطلاعات واردشده تکراری است و قبلاً در سامانه ثبت شده است.";
    isOperational = true;
  }
  // 5. JWT Authentication Errors
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    code = "AUTHENTICATION_REQUIRED";
    message = "توکن احراز هویت نامعتبر است. لطفاً دوباره وارد حساب کاربری شوید.";
    isOperational = true;
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    code = "TOKEN_EXPIRED";
    message = "نشست کاری شما منقضی شده است. لطفاً مجدداً وارد حساب کاربری شوید.";
    isOperational = true;
  }
  // 6. Express Rate Limiter or Syntax Error
  else if (err.name === "SyntaxError" && "body" in err) {
    statusCode = 400;
    code = "INVALID_JSON_BODY";
    message = "قالب بدنه درخواست ارسالی (JSON) نامعتبر است.";
    isOperational = true;
  }

  // Check if current user is super-admin or in dev mode to expose stack trace in response
  const user = (req as any).user;
  const isSuperAdmin = user?.role === "super-admin" || (Array.isArray(user?.roles) && user.roles.includes("super-admin"));
  const canViewStackTrace = isSuperAdmin || env.NODE_ENV === "development";

  // Asynchronously record technical error into the database for the Super Admin error dashboard
  ApiLoggerService.attachError(
    requestId,
    {
      code,
      message,
      name: err.name || "Error",
      stack: err.stack,
      fieldErrors,
      isOperational,
    },
    statusCode
  );

  // Log to server console with Request ID for instant terminal debugging
  if (statusCode >= 500) {
    console.error(`[CRITICAL_ERROR][${requestId}] ${req.method} ${req.originalUrl}:`, err);
  } else {
    console.warn(`[API_ERROR][${requestId}][${statusCode}] ${code}: ${message}`);
  }

  // Response payload complying with project API contract
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      requestId,
      ...(fieldErrors && Object.keys(fieldErrors).length > 0 && { fieldErrors }),
      ...(canViewStackTrace && {
        stack: err.stack,
        details: details || err.message,
        technicalType: err.name || "Error",
      }),
    },
  });
};
