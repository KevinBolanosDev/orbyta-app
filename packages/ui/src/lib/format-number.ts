// Formato de montos y porcentajes para mostrar (design-system.md §2.3): `$ 1.234.567` (COP),
// `US$ 1.234,56` (USD) y `▲ +2,4 %`. Trabaja sobre el texto decimal, sin pasar por `number`, así no
// pierde precisión en cifras grandes. No redondea: recibe el valor ya redondeado para mostrar
// (`roundForDisplay` de @repo/finance, en el cliente); solo completa los decimales que falten.

export type AmountCurrency = 'COP' | 'USD';

/** `es-CO` por defecto (§2.3); `en-US` para la interfaz en inglés. */
export type NumberLocale = 'es-CO' | 'en-US';

/** `auto`: solo el menos. `always`: también el más. `never`: sin signo. */
export type SignDisplay = 'auto' | 'always' | 'never';

export const CURRENCY_PREFIX: Readonly<Record<AmountCurrency, string>> = {
  COP: '$',
  USD: 'US$',
};

/** Decimales mínimos por moneda (COP sin decimales, USD con 2). */
export const CURRENCY_DECIMALS: Readonly<Record<AmountCurrency, number>> = {
  COP: 0,
  USD: 2,
};

const SEPARATORS: Readonly<Record<NumberLocale, { group: string; decimal: string }>> = {
  'es-CO': { group: '.', decimal: ',' },
  'en-US': { group: ',', decimal: '.' },
};

/** Signo menos tipográfico (U+2212), del mismo ancho que el más en cifras tabulares. */
export const MINUS = '−';

const DECIMAL = /^([+-])?(\d+)(?:\.(\d+))?$/;

interface ParsedDecimal {
  negative: boolean;
  integer: string;
  fraction: string;
}

function parseDecimal(value: string): ParsedDecimal {
  const match = DECIMAL.exec(value.trim());
  if (!match) throw new Error(`Invalid decimal string: ${value}`);
  const integer = (match[2] ?? '0').replace(/^0+(?=\d)/, '');
  const fraction = match[3] ?? '';
  const zero = /^0*$/.test(integer + fraction);
  return { negative: match[1] === '-' && !zero, integer, fraction };
}

function signOf(parsed: ParsedDecimal, display: SignDisplay): string {
  if (display === 'never') return '';
  if (parsed.negative) return MINUS;
  const zero = /^0*$/.test(parsed.integer + parsed.fraction);
  return display === 'always' && !zero ? '+' : '';
}

/** Número sin signo con separadores del locale y al menos `minDecimals` decimales. */
function digits(parsed: ParsedDecimal, locale: NumberLocale, minDecimals: number): string {
  const { group, decimal } = SEPARATORS[locale];
  const grouped = parsed.integer.replace(/\B(?=(\d{3})+(?!\d))/g, group);
  const fraction = parsed.fraction.padEnd(minDecimals, '0');
  return fraction === '' ? grouped : `${grouped}${decimal}${fraction}`;
}

export interface FormatAmountOptions {
  currency: AmountCurrency;
  locale?: NumberLocale;
  signDisplay?: SignDisplay;
}

/** `-1234.5` en USD → `−US$ 1.234,50`. */
export function formatAmount(
  value: string,
  { currency, locale = 'es-CO', signDisplay = 'auto' }: FormatAmountOptions,
): string {
  const parsed = parseDecimal(value);
  const sign = signOf(parsed, signDisplay);
  return `${sign}${CURRENCY_PREFIX[currency]} ${digits(parsed, locale, CURRENCY_DECIMALS[currency])}`;
}

/** Texto del monto oculto en modo privado: se ve la moneda, no la cifra. */
export function maskedAmount(currency: AmountCurrency): string {
  return `${CURRENCY_PREFIX[currency]} •••`;
}

export type DeltaDirection = 'up' | 'down' | 'flat';

/** Dirección de una variación a partir de su texto decimal. */
export function deltaDirection(value: string): DeltaDirection {
  const parsed = parseDecimal(value);
  if (/^0*$/.test(parsed.integer + parsed.fraction)) return 'flat';
  return parsed.negative ? 'down' : 'up';
}

export interface FormatPercentOptions {
  locale?: NumberLocale;
  /** Decimales mínimos (por defecto 1). */
  decimals?: number;
}

/** `2.4` → `▲ +2,4 %` (es-CO) o `▲ +2.4%` (en-US); `0` → `0,0 %`, sin flecha. */
export function formatPercent(
  value: string,
  { locale = 'es-CO', decimals = 1 }: FormatPercentOptions = {},
): string {
  const parsed = parseDecimal(value);
  const direction = deltaDirection(value);
  const arrow = direction === 'up' ? '▲ ' : direction === 'down' ? '▼ ' : '';
  const percent = locale === 'es-CO' ? ' %' : '%';
  return `${arrow}${signOf(parsed, 'always')}${digits(parsed, locale, decimals)}${percent}`;
}
