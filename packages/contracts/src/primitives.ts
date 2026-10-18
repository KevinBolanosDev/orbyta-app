import { z } from 'zod';

/** Monedas soportadas en v1 (plan §6.1). */
export const CurrencyCodeSchema = z.enum(['COP', 'USD']);
export type CurrencyCode = z.infer<typeof CurrencyCodeSchema>;

/**
 * Los decimales viajan como texto para que el dinero nunca pase por un float (plan §7.1).
 * Ejemplos: "1234.5600", "-3", "0.00000001".
 */
export const DecimalStringSchema = z
  .string()
  .regex(/^-?\d+(\.\d+)?$/, { message: 'INVALID_DECIMAL' })
  .brand<'DecimalString'>();
export type DecimalString = z.infer<typeof DecimalStringSchema>;

export const MoneySchema = z.object({
  amount: DecimalStringSchema,
  currency: CurrencyCodeSchema,
});
export type Money = z.infer<typeof MoneySchema>;
