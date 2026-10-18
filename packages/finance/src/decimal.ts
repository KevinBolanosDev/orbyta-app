import DecimalModule from 'decimal.js';

import type { DecimalString } from '@repo/contracts';

type DecimalConstructor = typeof DecimalModule.Decimal;

// decimal.js trae tipos estilo CommonJS junto a un build ESM. Con NodeNext, TypeScript ve el import
// por defecto como el objeto del módulo, mientras que Node/Vite/Metro entregan la clase.
// Se normaliza una sola vez aquí para que el resto del código no lidie con eso.
const DecimalJs: DecimalConstructor =
  (DecimalModule as unknown as { default?: DecimalConstructor }).default ??
  (DecimalModule as unknown as DecimalConstructor);

/**
 * Constructor Decimal que usa todo el código financiero (ADR 0003).
 * 40 dígitos significativos y redondeo half-even, así los resultados intermedios no pierden centavos.
 */
export const Decimal = DecimalJs.clone({
  precision: 40,
  rounding: DecimalJs.ROUND_HALF_EVEN,
  toExpNeg: -40,
  toExpPos: 40,
});
export type Decimal = InstanceType<typeof Decimal>;

export type DecimalInput = Decimal | DecimalString | string;

export function toDecimal(value: DecimalInput): Decimal {
  return new Decimal(value);
}

/** Convierte a texto sin notación exponencial. Con `decimals`, redondea half-even a esa escala. */
export function toDecimalString(value: Decimal, decimals?: number): DecimalString {
  return (decimals === undefined ? value.toFixed() : value.toFixed(decimals)) as DecimalString;
}
