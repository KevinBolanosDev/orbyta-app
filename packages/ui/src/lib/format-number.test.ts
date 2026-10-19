import { deltaDirection, formatAmount, formatPercent, maskedAmount, MINUS } from './format-number';

describe('formatAmount', () => {
  it('formats COP without decimals and USD with two, in es-CO (§2.3)', () => {
    expect(formatAmount('1234567', { currency: 'COP' })).toBe('$ 1.234.567');
    expect(formatAmount('1234.56', { currency: 'USD' })).toBe('US$ 1.234,56');
    expect(formatAmount('1234.5', { currency: 'USD' })).toBe('US$ 1.234,50');
  });

  it('uses en-US separators for the English interface', () => {
    expect(formatAmount('1234567.89', { currency: 'USD', locale: 'en-US' })).toBe(
      'US$ 1,234,567.89',
    );
  });

  it('keeps every digit of large amounts (no floating point)', () => {
    expect(formatAmount('12345678901234567890', { currency: 'COP' })).toBe(
      '$ 12.345.678.901.234.567.890',
    );
  });

  it('writes the sign with a typographic minus, a plus on demand and none for zero', () => {
    expect(formatAmount('-85400', { currency: 'COP' })).toBe(`${MINUS}$ 85.400`);
    expect(formatAmount('2300000', { currency: 'COP', signDisplay: 'always' })).toBe(
      '+$ 2.300.000',
    );
    expect(formatAmount('-0.00', { currency: 'USD', signDisplay: 'always' })).toBe('US$ 0,00');
    expect(formatAmount('-12', { currency: 'COP', signDisplay: 'never' })).toBe('$ 12');
    expect(formatAmount('+007', { currency: 'COP' })).toBe('$ 7');
  });

  it('rejects text that is not a decimal', () => {
    expect(() => formatAmount('1e5', { currency: 'COP' })).toThrow('Invalid decimal string');
  });

  it('masks the figure but keeps the currency in privacy mode', () => {
    expect(maskedAmount('COP')).toBe('$ •••');
    expect(maskedAmount('USD')).toBe('US$ •••');
  });
});

describe('formatPercent and deltaDirection', () => {
  it('adds arrow, sign and the locale percent spacing', () => {
    expect(formatPercent('2.4')).toBe('▲ +2,4 %');
    expect(formatPercent('-1')).toBe(`▼ ${MINUS}1,0 %`);
    expect(formatPercent('0')).toBe('0,0 %');
    expect(formatPercent('12.345', { locale: 'en-US', decimals: 2 })).toBe('▲ +12.345%');
  });

  it('tells the direction of a change', () => {
    expect(deltaDirection('0.5')).toBe('up');
    expect(deltaDirection('-0.5')).toBe('down');
    expect(deltaDirection('-0.000')).toBe('flat');
  });
});
