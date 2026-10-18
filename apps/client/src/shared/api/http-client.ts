import type { z } from 'zod';

import { env } from '../config';

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/**
 * Hace GET a un recurso JSON del API de Gravyx Ascenda y lo valida con un esquema de `@repo/contracts`.
 * Nunca se confía en una respuesta sin validar (plan §16).
 * TODO(F3): agregar header de auth, reintentos e integración con la outbox offline.
 */
export async function getJson<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  init?: { signal?: AbortSignal },
): Promise<z.output<TSchema>> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    headers: { accept: 'application/json' },
    signal: init?.signal ?? null,
  });
  if (!response.ok) {
    throw new HttpError(response.status, `GET ${path} failed`);
  }
  return schema.parse(await response.json());
}
