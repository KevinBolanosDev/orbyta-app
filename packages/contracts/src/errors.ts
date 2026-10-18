import { z } from 'zod';

/**
 * Los errores viajan como códigos; el cliente los traduce (plan §16).
 * Cada fase agrega los códigos que necesita.
 */
export const ErrorCodeSchema = z.enum([
  'VALIDATION_FAILED',
  'NOT_FOUND',
  'INTERNAL_ERROR',
  'INVALID_QUANTITY',
  'INVALID_PRICE',
  'CURRENCY_MISMATCH',
]);
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

export const ApiErrorSchema = z.object({
  code: ErrorCodeSchema,
  details: z.array(z.object({ path: z.string(), code: z.string() })).optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
