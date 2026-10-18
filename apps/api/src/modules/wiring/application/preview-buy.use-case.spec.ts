import { describe, expect, it } from 'vitest';

import { BuyPreviewRequestSchema } from '@repo/contracts';
import { isUuidV7 } from '@repo/utils';

import type { ClockPort } from '../../../shared/application/index.js';
import { InMemoryPreviewLog } from '../infrastructure/in-memory-preview-log.js';

import { PreviewBuyUseCase } from './preview-buy.use-case.js';

const fixedClock: ClockPort = { now: () => new Date('2026-10-17T12:00:00.000Z') };

describe('PreviewBuyUseCase', () => {
  it('returns the new average cost and records the preview', async () => {
    const log = new InMemoryPreviewLog();
    const useCase = new PreviewBuyUseCase(log, fixedClock);

    const result = await useCase.execute(
      BuyPreviewRequestSchema.parse({
        currency: 'USD',
        position: { quantity: '3', averageCost: '10' },
        buy: { quantity: '1', price: '11', fee: '0' },
      }),
    );

    expect(result).toEqual({
      currency: 'USD',
      quantity: '4.0000000000',
      averageCost: '10.2500000000',
    });
    expect(await log.count()).toBe(1);
    expect(log.entries[0]?.calculatedAt.toISOString()).toBe('2026-10-17T12:00:00.000Z');
    expect(isUuidV7(log.entries[0]?.id ?? '')).toBe(true);
  });
});
