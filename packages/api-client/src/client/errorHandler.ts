import { AxiosError } from 'axios';

export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): never {
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;
    const errorData = error.response?.data;

    if (errorData && typeof errorData === 'object' && 'error' in errorData) {
      const serviceError = errorData.error as {
        message?: string;
        statusCode?: number;
      };
      throw new ApiError(
        serviceError.message || 'API request failed',
        serviceError.statusCode || statusCode,
        error
      );
    }

    // Generic error handling
    throw new ApiError(error.message || 'Network error', statusCode, error);
  }

  // Unknown error type
  throw new ApiError(
    error instanceof Error ? error.message : 'Unknown error',
    undefined,
    error
  );
}
