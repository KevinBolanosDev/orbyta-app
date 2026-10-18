import type { CurrencyCode, DecimalString } from '@repo/contracts';

import { toDecimal, toDecimalString, type Decimal, type DecimalInput } from './decimal.js';
import { FinanceError } from './errors.js';

export interface Money {
  readonly amount: Decimal;
  readonly currency: CurrencyCode;
}

/** Decimales que se muestran por moneda (plan §7.1: COP sin decimales, USD con 2). */
export const DISPLAY_DECIMALS: Readonly<Record<CurrencyCode, number>> = {
  COP: 0,
  USD: 2,
};

export function money(amount: DecimalInput, currency: CurrencyCode): Money {
  return { amount: toDecimal(amount), currency };
}

export function addMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amount: a.amount.plus(b.amount), currency: a.currency };
}

export function subtractMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amount: a.amount.minus(b.amount), currency: a.currency };
}

/** Redondea half-even a la escala de la moneda. Usar solo al presentar. */
export function roundForDisplay(value: Money): DecimalString {
  return toDecimalString(value.amount, DISPLAY_DECIMALS[value.currency]);
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new FinanceError('CURRENCY_MISMATCH', `${a.currency} vs ${b.currency}`);
  }
}
