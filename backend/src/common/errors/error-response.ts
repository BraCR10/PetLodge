export type ErrorResponse = {
  code: string;
  message: string;
  details?: string[];
};

export const errorResponse = (
  code: string,
  message: string,
  details?: string[],
): ErrorResponse => ({
  code,
  message,
  ...(details && details.length > 0 ? { details } : {}),
});
