import logger from '../utils/logger.js';
import { AppError } from '../errors/index.js';

/**
 * Global error handler middleware for Hono
 * Maps custom errors to standardized JSON responses
 */
export function errorHandler(err, c) {
  if (err instanceof AppError) {
    logger.error(
      {
        err,
        statusCode: err.statusCode,
        errorCode: err.errorCode,
        path: c.req.path,
        method: c.req.method,
      },
      `${err.errorCode}: ${err.message}`
    );

    const response = {
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
      },
    };

    if (err.details) {
      response.error.details = err.details;
    }

    return c.json(response, err.statusCode);
  }

  if (err.name === 'ZodError') {
    logger.error({ err, path: c.req.path, method: c.req.method }, 'Zod validation error');
    return c.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: err.errors,
        },
      },
      400
    );
  }

  logger.error(
    {
      err,
      path: c.req.path,
      method: c.req.method,
      stack: err.stack,
    },
    `Unexpected error: ${err.message}`
  );

  const isDevelopment = process.env.NODE_ENV !== 'production';

  return c.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: isDevelopment ? err.message : 'An unexpected error occurred',
        ...(isDevelopment && { stack: err.stack }),
      },
    },
    500
  );
}

