import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { BuyPreviewRequestSchema } from '@repo/contracts';

import { Decimal, toDecimal } from './decimal.js';
import { applyBuy, previewBuy } from './position.js';

const d = (value: string) => toDecimal(value);
const empty = { quantity: d('0'), averageCost: d('0') };

describe('applyBuy', () => {
  it('opens a position including the fee in the cost', () => {
    const next = applyBuy(empty, { quantity: d('10'), price: d('100'), fee: d('5') });
    expect(next.quantity.toFixed()).toBe('10');
    expect(next.averageCost.toFixed()).toBe('100.5');
  });

  it('averages a second buy (plan §7.2)', () => {
    const next = applyBuy(
      { quantity: d('10'), averageCost: d('100') },
      { quantity: d('5'), price: d('130'), fee: d('0') },
    );
    expect(next.quantity.toFixed()).toBe('15');
    expect(next.averageCost.toFixed()).toBe('110');
  });

  it('supports fractional crypto quantities', () => {
    const next = applyBuy(empty, { quantity: d('0.00012345'), price: d('67000'), fee: d('0') });
    expect(next.averageCost.toFixed()).toBe('67000');
  });

  it('rejects zero or negative quantities', () => {
    expect(() => applyBuy(empty, { quantity: d('0'), price: d('1'), fee: d('0') })).toThrow(
      expect.objectContaining({ code: 'INVALID_QUANTITY' }),
    );
    expect(() =>
      applyBuy(
        { quantity: d('-1'), averageCost: d('1') },
        { quantity: d('1'), price: d('1'), fee: d('0') },
      ),
    ).toThrow(expect.objectContaining({ code: 'INVALID_QUANTITY' }));
  });

  it('rejects negative prices, costs or fees', () => {
    const buy = { quantity: d('1'), price: d('1'), fee: d('0') };
    expect(() => applyBuy(empty, { ...buy, price: d('-1') })).toThrow(
      expect.objectContaining({ code: 'INVALID_PRICE' }),
    );
    expect(() => applyBuy(empty, { ...buy, fee: d('-0.01') })).toThrow(
      expect.objectContaining({ code: 'INVALID_PRICE' }),
    );
    expect(() => applyBuy({ quantity: d('1'), averageCost: d('-1') }, buy)).toThrow(
      expect.objectContaining({ code: 'INVALID_PRICE' }),
    );
  });

  it('property: without fees the new average lies between the old average and the buy price', () => {
    const positive = fc.integer({ min: 1, max: 1_000_000 }).map((n) => new Decimal(n).div(100));
    fc.assert(
      fc.property(positive, positive, positive, positive, (q0, c0, q1, p1) => {
        const next = applyBuy(
          { quantity: q0, averageCost: c0 },
          { quantity: q1, price: p1, fee: d('0') },
        );
        const low = Decimal.min(c0, p1);
        const high = Decimal.max(c0, p1);
        return (
          next.averageCost.gte(low) &&
          next.averageCost.lte(high) &&
          next.quantity.equals(q0.plus(q1))
        );
      }),
    );
  });
});

describe('previewBuy', () => {
  it('maps contract strings in and out with a fixed scale', () => {
    const request = BuyPreviewRequestSchema.parse({
      currency: 'USD',
      position: { quantity: '3', averageCost: '10' },
      buy: { quantity: '1', price: '11', fee: '0' },
    });
    const result = previewBuy(request);
    expect(result).toEqual({
      currency: 'USD',
      quantity: '4.0000000000',
      averageCost: '10.2500000000',
    });
  });
});
