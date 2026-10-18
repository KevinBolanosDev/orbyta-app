// Consulta GET /health y valida la respuesta con HealthResponseSchema.
import { HealthResponseSchema, type HealthResponse } from '@repo/contracts';

import { getJson } from '@/shared/api';

export function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  return getJson('/health', HealthResponseSchema, signal ? { signal } : undefined);
}
