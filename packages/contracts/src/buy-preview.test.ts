import { describe, expect, it } from 'vitest';

import { BuyPreviewResponseSchema } from './buy-preview.js';

describe('BuyPreviewResponseSchema', () => {
  it('parses a response into branded decimal strings', () => {
    const parsed = BuyPreviewResponseSchema.parse({
      currency: 'COP',
      quantity: '4.0000000000',
      averageCost: '10.2500000000',
    });
    expect(parsed.averageCost).toBe('10.2500000000');
  });
});
