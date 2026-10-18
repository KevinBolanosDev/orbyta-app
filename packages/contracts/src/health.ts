import { z } from 'zod';

export const HealthStatusSchema = z.enum(['ok', 'degraded']);
export type HealthStatus = z.infer<typeof HealthStatusSchema>;

/** Respuesta de `GET /health` del API (el servicio ML responde con la misma forma). */
export const HealthResponseSchema = z.object({
  status: HealthStatusSchema,
  service: z.string().min(1),
  version: z.string().min(1),
  uptimeSeconds: z.number().int().nonnegative(),
  checkedAt: z.iso.datetime(),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
