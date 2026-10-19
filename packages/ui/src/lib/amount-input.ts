// Entrada de montos (MoneyInput P08 y NumberPad P09) como funciones puras. El valor "canónico" es
// texto decimal sin separadores de miles y con punto (`"1234567"`, `"12.5"`), igual que el que recibe
// AmountText; `""` es campo vacío. Nunca pasa por `number`, así no pierde dígitos.

import { NUMBER_SEPARATORS, type NumberLocale } from './format-number';

/** Teclas del NumberPad: dígitos, `000`, separador decimal y borrar. */
export type AmountKey =
  '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '000' | 'decimal' | 'backspace';

/** Tope de dígitos enteros (billones de pesos sobran). */
export const MAX_INTEGER_DIGITS = 15;

function split(value: string): { integer: string; fraction: string | undefined } {
  const [integer = '', fraction] = value.split('.');
  return { integer, fraction };
}

function join(integer: string, fraction: string | undefined): string {
  return fraction === undefined ? integer : `${integer}.${fraction}`;
}

/**
 * Aplica una tecla al valor canónico. `decimals` es el máximo de la moneda (COP 0, USD 2): con 0 la
 * tecla decimal no hace nada. No deja ceros a la izquierda ni pasa de `MAX_INTEGER_DIGITS`.
 */
export function applyAmountKey(value: string, key: AmountKey, decimals: number): string {
  const { integer, fraction } = split(value);

  if (key === 'backspace') {
    if (fraction !== undefined) {
      return fraction === '' ? integer : join(integer, fraction.slice(0, -1));
    }
    return integer.slice(0, -1);
  }

  if (key === 'decimal') {
    if (decimals === 0 || fraction !== undefined) return value;
    return `${integer === '' ? '0' : integer}.`;
  }

  if (fraction !== undefined) {
    const room = decimals - fraction.length;
    if (room <= 0) return value;
    return join(integer, fraction + key.slice(0, room));
  }

  // `000` o un cero sobre un campo vacío o en cero no agregan nada.
  if (/^0*$/.test(key) && /^0?$/.test(integer))
    return integer === '' && key === '0' ? '0' : integer;
  const next = (integer === '0' ? '' : integer) + key;
  return next.length > MAX_INTEGER_DIGITS ? value : next;
}

/**
 * Lo que se escribe en el campo (con o sin separadores, del locale) → valor canónico. Ignora todo lo
 * que no sea dígito o el separador decimal del locale y recorta a `decimals`.
 */
export function parseAmountInput(text: string, locale: NumberLocale, decimals: number): string {
  const { decimal } = NUMBER_SEPARATORS[locale];
  // Lo que va después del separador decimal nunca es parte del entero (en COP se descarta).
  const at = text.indexOf(decimal);
  const integerText = at === -1 ? text : text.slice(0, at);
  let integer = integerText.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  integer = integer.slice(0, MAX_INTEGER_DIGITS);
  if (at === -1) return integer;
  if (decimals === 0) return integer;
  const fraction = text
    .slice(at + 1)
    .replace(/\D/g, '')
    .slice(0, decimals);
  return join(integer === '' ? '0' : integer, fraction);
}

/**
 * Valor canónico → texto del campo mientras se escribe: agrupa los miles y respeta lo tecleado (un
 * separador decimal al final o decimales a medias), a diferencia de `formatAmount`.
 */
export function formatAmountInput(value: string, locale: NumberLocale): string {
  if (value === '') return '';
  const { group, decimal } = NUMBER_SEPARATORS[locale];
  const { integer, fraction } = split(value);
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, group);
  return fraction === undefined ? grouped : `${grouped}${decimal}${fraction}`;
}

/** Valor canónico listo para guardar: quita un punto final (`"12."` → `"12"`); vacío queda vacío. */
export function normalizeAmount(value: string): string {
  return value.endsWith('.') ? value.slice(0, -1) : value;
}
