import { Module } from '@nestjs/common';

import { PreviewLogPort } from './application/ports/preview-log.port.js';
import { PreviewBuyUseCase } from './application/preview-buy.use-case.js';
import { InMemoryPreviewLog } from './infrastructure/in-memory-preview-log.js';
import { WiringController } from './presentation/http/wiring.controller.js';

/**
 * Módulo de ejemplo de F0: muestra las cuatro capas y el enlace puerto → adaptador.
 * TODO(B1): borrarlo cuando exista el primer módulo real (identity).
 */
@Module({
  controllers: [WiringController],
  providers: [PreviewBuyUseCase, { provide: PreviewLogPort, useClass: InMemoryPreviewLog }],
})
export class WiringModule {}
