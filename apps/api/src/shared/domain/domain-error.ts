import type { ErrorCode } from '@repo/contracts';

/**
 * Clase base para violaciones de reglas de negocio. TypeScript puro: sin Nest, sin I/O.
 * La capa HTTP la convierte en un `ApiError` con el mismo código.
 */
export class DomainError extends Error {
  constructor(
    readonly code: ErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'DomainError';
  }
}
