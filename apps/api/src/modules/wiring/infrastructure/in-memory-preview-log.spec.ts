import { describe, expect, it } from 'vitest';

import type { DecimalString } from '@repo/contracts';
import { createId } from '@repo/utils';

import { InMemoryPreviewLog } from './in-memory-preview-log.js';

const entry = (n: number) => ({
  id: createId(),
  result: {
    currency: 'USD' as const,
    quantity: String(n) as DecimalString,
    averageCost: '1' as DecimalString,
  },
  calculatedAt: new Date(0),
});

describe('InMemoryPreviewLog', () => {
  it('keeps only the latest 100 entries', async () => {
    const log = new InMemoryPreviewLog();
    for (let n = 1; n <= 105; n += 1) {
      await log.record(entry(n));
    }
    expect(await log.count()).toBe(100);
    expect(log.entries[0]?.result.quantity).toBe('6');
  });
});
