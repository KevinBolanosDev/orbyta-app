import { Injectable } from '@nestjs/common';

import type { BuyPreviewRequest, BuyPreviewResponse } from '@repo/contracts';
import { createId } from '@repo/utils';

import { ClockPort } from '../../../shared/application/index.js';
import { Position } from '../domain/position.js';

import { PreviewLogPort } from './ports/preview-log.port.js';

/**
 * Un caso de uso por acción (plan §4.3). Orquesta el dominio y los puertos; aquí no hay HTTP.
 * Lo consume: WiringController.
 */
@Injectable()
export class PreviewBuyUseCase {
  constructor(
    private readonly previewLog: PreviewLogPort,
    private readonly clock: ClockPort,
  ) {}

  async execute(request: BuyPreviewRequest): Promise<BuyPreviewResponse> {
    const result = Position.restore({ currency: request.currency, ...request.position })
      .buy(request.buy)
      .toSnapshot();

    await this.previewLog.record({ id: createId(), result, calculatedAt: this.clock.now() });

    return result;
  }
}
