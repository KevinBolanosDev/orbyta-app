import { describe, expect, it } from 'vitest';

import type { DecimalString } from '@repo/contracts';

import { Position } from './position.js';

const dec = (value: string) => value as DecimalString;

describe('Position (domain)', () => {
  it('averages the cost after a buy without mutating the original', () => {
    const original = Position.restore({
      currency: 'USD',
      quantity: dec('10'),
      averageCost: dec('100'),
    });

    const next = original.buy({ quantity: dec('5'), price: dec('130'), fee: dec('0') });

    expect(next.toSnapshot()).toEqual({
      currency: 'USD',
      quantity: '15.0000000000',
      averageCost: '110.0000000000',
    });
    expect(original.toSnapshot().quantity).toBe('10.0000000000');
  });

  it('enforces the finance invariants', () => {
    const position = Position.restore({
      currency: 'COP',
      quantity: dec('0'),
      averageCost: dec('0'),
    });
    expect(() => position.buy({ quantity: dec('0'), price: dec('1'), fee: dec('0') })).toThrow(
      expect.objectContaining({ code: 'INVALID_QUANTITY' }),
    );
  });
});
