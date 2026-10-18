import { describe, expect, it } from 'vitest';

import { FinanceError } from './errors.js';
import { addMoney, money, roundForDisplay, subtractMoney } from './money.js';

describe('money', () => {
  it('adds and subtracts in the same currency', () => {
    const total = addMoney(money('10.10', 'USD'), money('0.20', 'USD'));
    expect(total.amount.toFixed()).toBe('10.3');
    expect(subtractMoney(total, money('0.3', 'USD')).amount.toFixed()).toBe('10');
  });

  it('refuses to mix currencies', () => {
    expect(() => addMoney(money('1', 'USD'), money('1', 'COP'))).toThrow(FinanceError);
    expect(() => subtractMoney(money('1', 'USD'), money('1', 'COP'))).toThrow(
      expect.objectContaining({ code: 'CURRENCY_MISMATCH' }),
    );
  });

  it('rounds for display by currency', () => {
    expect(roundForDisplay(money('1234.5', 'COP'))).toBe('1234');
    expect(roundForDisplay(money('1235.5', 'COP'))).toBe('1236');
    expect(roundForDisplay(money('10.125', 'USD'))).toBe('10.12');
  });
});
