import { describe, expect, it } from 'vitest';

import {
  BuyPreviewRequestSchema,
  DecimalStringSchema,
  HealthResponseSchema,
  MoneySchema,
} from './index.js';

describe('DecimalStringSchema', () => {
  it.each(['0', '1234.5600', '-3', '0.00000001'])('accepts %s', (value) => {
    expect(DecimalStringSchema.safeParse(value).success).toBe(true);
  });

  it.each(['', '1.', '.5', '1e5', '1,000', 'abc', ' 1'])('rejects %j', (value) => {
    expect(DecimalStringSchema.safeParse(value).success).toBe(false);
  });
});

describe('MoneySchema', () => {
  it('rejects unsupported currencies', () => {
    expect(MoneySchema.safeParse({ amount: '10', currency: 'EUR' }).success).toBe(false);
  });
});

describe('HealthResponseSchema', () => {
  it('accepts a valid health payload', () => {
    const result = HealthResponseSchema.safeParse({
      status: 'ok',
      service: 'api',
      version: '0.0.0',
      uptimeSeconds: 12,
      checkedAt: '2026-10-17T15:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });
});

describe('BuyPreviewRequestSchema', () => {
  it('rejects numbers where decimal strings are expected', () => {
    const result = BuyPreviewRequestSchema.safeParse({
      currency: 'USD',
      position: { quantity: 1, averageCost: '10' },
      buy: { quantity: '1', price: '10', fee: '0' },
    });
    expect(result.success).toBe(false);
  });
});
