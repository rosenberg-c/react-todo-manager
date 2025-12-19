// Success response wrapper interfaces
export interface SuccessDataResponse<T> {
  data: T;
}

export interface SuccessMessageResponse {
  message: string;
}

// Error response interface
export interface ErrorResponse {
  error: {
    message: string;
    statusCode: number;
  };
}
