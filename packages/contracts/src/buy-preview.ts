import { z } from 'zod';

import { CurrencyCodeSchema, DecimalStringSchema } from './primitives.js';

/**
 * Ejemplo de cableado de F0: vista previa del costo promedio ponderado tras una compra (plan §7.2).
 * Lo usan `POST /wiring/buy-preview` y la página de cableado del cliente.
 * TODO(F5): reemplazar por los contratos reales de Trade.
 */
export const BuyPreviewRequestSchema = z.object({
  currency: CurrencyCodeSchema,
  position: z.object({
    quantity: DecimalStringSchema,
    averageCost: DecimalStringSchema,
  }),
  buy: z.object({
    quantity: DecimalStringSchema,
    price: DecimalStringSchema,
    fee: DecimalStringSchema,
  }),
});
export type BuyPreviewRequest = z.infer<typeof BuyPreviewRequestSchema>;

export const BuyPreviewResponseSchema = z.object({
  currency: CurrencyCodeSchema,
  quantity: DecimalStringSchema,
  averageCost: DecimalStringSchema,
});
export type BuyPreviewResponse = z.infer<typeof BuyPreviewResponseSchema>;
