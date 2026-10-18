import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import {
  BuyPreviewRequestSchema,
  BuyPreviewResponseSchema,
  type BuyPreviewRequest,
  type BuyPreviewResponse,
} from '@repo/contracts';

import { ZodValidationPipe } from '../../../../shared/infrastructure/index.js';
import { PreviewBuyUseCase } from '../../application/preview-buy.use-case.js';

/** Controlador delgado: valida con contracts, llama un caso de uso y valida la salida. */
@Controller('wiring')
export class WiringController {
  constructor(private readonly previewBuy: PreviewBuyUseCase) {}

  @Post('buy-preview')
  @HttpCode(HttpStatus.OK)
  async buyPreview(
    @Body(new ZodValidationPipe(BuyPreviewRequestSchema)) body: BuyPreviewRequest,
  ): Promise<BuyPreviewResponse> {
    return BuyPreviewResponseSchema.parse(await this.previewBuy.execute(body));
  }
}
