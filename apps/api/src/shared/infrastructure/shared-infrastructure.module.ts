import { Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { ClockPort } from '../application/index.js';

import { SystemClock } from './clock/system-clock.js';
import { HealthController } from './health/health.controller.js';
import { DomainErrorFilter } from './http/domain-error.filter.js';

/** Adaptadores transversales disponibles para todos los módulos (@Global). */
@Global()
@Module({
  controllers: [HealthController],
  providers: [
    { provide: ClockPort, useClass: SystemClock },
    { provide: APP_FILTER, useClass: DomainErrorFilter },
  ],
  exports: [ClockPort],
})
export class SharedInfrastructureModule {}
