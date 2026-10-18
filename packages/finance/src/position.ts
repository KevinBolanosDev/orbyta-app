import type { BuyPreviewRequest, BuyPreviewResponse } from '@repo/contracts';

import { toDecimal, toDecimalString, type Decimal } from './decimal.js';
import { FinanceError } from './errors.js';

/** Escala para transportar precios unitarios y cantidades (coincide con numeric(28,10), plan §7.1). */
export const UNIT_SCALE = 10;

export interface PositionState {
  readonly quantity: Decimal;
  readonly averageCost: Decimal;
}

export interface BuyTrade {
  readonly quantity: Decimal;
  readonly price: Decimal;
  readonly fee: Decimal;
}

/**
 * Costo promedio ponderado después de una compra (plan §7.2):
 *   C̄_new = (q_prev · C̄_prev + q_buy · p_buy + f) / (q_prev + q_buy)
 *   q_new = q_prev + q_buy
 */
export function applyBuy(position: PositionState, buy: BuyTrade): PositionState {
  if (position.quantity.isNegative() || buy.quantity.lte(0)) {
    throw new FinanceError('INVALID_QUANTITY');
  }
  if (position.averageCost.isNegative() || buy.price.isNegative() || buy.fee.isNegative()) {
    throw new FinanceError('INVALID_PRICE');
  }

  const quantity = position.quantity.plus(buy.quantity);
  const totalCost = position.quantity
    .times(position.averageCost)
    .plus(buy.quantity.times(buy.price))
    .plus(buy.fee);

  return { quantity, averageCost: totalCost.div(quantity) };
}

/** Envoltorio a nivel de contrato; lo usan el cliente y el API. */
export function previewBuy(request: BuyPreviewRequest): BuyPreviewResponse {
  const next = applyBuy(
    {
      quantity: toDecimal(request.position.quantity),
      averageCost: toDecimal(request.position.averageCost),
    },
    {
      quantity: toDecimal(request.buy.quantity),
      price: toDecimal(request.buy.price),
      fee: toDecimal(request.buy.fee),
    },
  );

  return {
    currency: request.currency,
    quantity: toDecimalString(next.quantity, UNIT_SCALE),
    averageCost: toDecimalString(next.averageCost, UNIT_SCALE),
  };
}
