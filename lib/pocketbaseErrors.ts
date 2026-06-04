export type PocketBaseValidationErrors = Record<string, { message?: string }>;

export type PocketBaseError = {
  status?: number;
  message?: string;
  response?: {
    message?: string;
    data?: PocketBaseValidationErrors;
  };
};

export function asPocketBaseError(error: unknown): PocketBaseError {
  return error as PocketBaseError;
}

export function getErrorMessage(error: unknown, fallback: string) {
  return asPocketBaseError(error)?.response?.message || (error instanceof Error ? error.message : fallback);
}
