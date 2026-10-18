// @repo/contracts — API pública. Esquemas zod: la única fuente de verdad de los datos.
// Lo consumen: apps/client (valida respuestas del API), apps/api (valida entrada y salida HTTP)
// y @repo/finance (tipos de moneda y errores).
export {
  CurrencyCodeSchema,
  DecimalStringSchema,
  MoneySchema,
  type CurrencyCode,
  type DecimalString,
  type Money,
} from './primitives.js';
export {
  HealthResponseSchema,
  HealthStatusSchema,
  type HealthResponse,
  type HealthStatus,
} from './health.js';
export { ApiErrorSchema, ErrorCodeSchema, type ApiError, type ErrorCode } from './errors.js';
export {
  BuyPreviewRequestSchema,
  BuyPreviewResponseSchema,
  type BuyPreviewRequest,
  type BuyPreviewResponse,
} from './buy-preview.js';
