import type { HealthResponse } from '@repo/contracts';

/** Lo que el cliente sabe del API en este momento. */
export type SystemStatus =
  | { readonly kind: 'checking' }
  | { readonly kind: 'online'; readonly health: HealthResponse }
  | { readonly kind: 'offline' };
