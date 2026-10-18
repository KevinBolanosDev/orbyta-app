import type { ErrorCode } from '@repo/contracts';

/** Error de dominio que lanzan las funciones financieras. El cliente traduce `code`. */
export class FinanceError extends Error {
  constructor(
    readonly code: ErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'FinanceError';
  }
}
