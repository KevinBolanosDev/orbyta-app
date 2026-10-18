import { Catch, HttpStatus, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import type { ApiError } from '@repo/contracts';
import { FinanceError } from '@repo/finance';

import { DomainError } from '../../domain/index.js';

/** Convierte errores de reglas de negocio en `422` con la forma `ApiError`. No depende de Express. */
@Catch(DomainError, FinanceError)
export class DomainErrorFilter implements ExceptionFilter {
  constructor(private readonly adapterHost: HttpAdapterHost) {}

  catch(error: DomainError | FinanceError, host: ArgumentsHost): void {
    const body: ApiError = { code: error.code };
    this.adapterHost.httpAdapter.reply(
      host.switchToHttp().getResponse(),
      body,
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
