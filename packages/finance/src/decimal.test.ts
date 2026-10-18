import { describe, expect, it } from 'vitest';

import { Decimal, toDecimal, toDecimalString } from './decimal.js';

describe('Decimal', () => {
  it('does not suffer float errors', () => {
    expect(toDecimal('0.1').plus('0.2').equals('0.3')).toBe(true);
  });

  it('supports fractional powers needed by CDT math (plan §7.6)', () => {
    // 10.000.000 COP al 10 % E.A. por 180 días: Capital · (1 + EA)^(días/365).
    // El valor esperado se verificó con el módulo decimal de Python a 50 dígitos.
    const value = new Decimal('10000000').times(new Decimal('1.1').pow(new Decimal(180).div(365)));
    expect(toDecimalString(value, 2)).toBe('10481243.99');
  });

  it('rounds half-even', () => {
    expect(toDecimalString(toDecimal('2.5'), 0)).toBe('2');
    expect(toDecimalString(toDecimal('3.5'), 0)).toBe('4');
  });

  it('never serializes with exponent notation', () => {
    expect(toDecimalString(toDecimal('0.00000001'))).toBe('0.00000001');
    expect(toDecimalString(toDecimal('1e21'))).toBe('1000000000000000000000');
  });
});
