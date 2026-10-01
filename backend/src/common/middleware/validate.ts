import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';

export const validate = (schema: ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed: any = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      if (parsed) {
        if (parsed.body !== undefined) req.body = parsed.body;
        if (parsed.query !== undefined && typeof parsed.query === 'object') {
          try {
            Object.assign(req.query, parsed.query);
          } catch {}
        }
        if (parsed.params !== undefined && typeof parsed.params === 'object') {
          try {
            Object.assign(req.params, parsed.params);
          } catch {}
        }
      }
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Extract all error messages
        const zodError = error as any;
        const message = (zodError.errors || zodError.issues).map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return next(new AppError(message, 400, 'VALIDATION_ERROR'));
      }
      return next(error);
    }
  };
