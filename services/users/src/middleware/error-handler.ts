import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        message: error.message,
        statusCode: error.statusCode,
      },
    });
  }

  console.error('Unexpected error:', error);
  res.status(500).json({
    error: {
      message: 'Internal server error',
      statusCode: 500,
    },
  });
}
