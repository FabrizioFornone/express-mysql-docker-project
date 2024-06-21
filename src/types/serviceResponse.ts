interface ServiceResponse {
  error?: boolean;
  code: number;
}

export interface ErrorResponse extends ServiceResponse {
  errorMessage: string;
}

export interface SuccessResponse<T> extends ServiceResponse {
  data: T;
}
