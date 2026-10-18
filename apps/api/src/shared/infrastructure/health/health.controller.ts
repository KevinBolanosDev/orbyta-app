import { Controller, Get } from '@nestjs/common';

import { HealthResponseSchema, type HealthResponse } from '@repo/contracts';

import { ClockPort } from '../../application/index.js';

const SERVICE_NAME = 'api';
// TODO(B1): leer la versión desde los metadatos del build cuando el API se despliegue.
const SERVICE_VERSION = '0.0.0';

/** `GET /health`: estado del API. Lo consume el widget api-status del cliente. */
@Controller('health')
export class HealthController {
  constructor(private readonly clock: ClockPort) {}

  @Get()
  check(): HealthResponse {
    // Valida nuestra propia salida contra el contrato compartido (plan §16: validar en los bordes).
    return HealthResponseSchema.parse({
      status: 'ok',
      service: SERVICE_NAME,
      version: SERVICE_VERSION,
      uptimeSeconds: Math.floor(process.uptime()),
      checkedAt: this.clock.now().toISOString(),
    });
  }
}
