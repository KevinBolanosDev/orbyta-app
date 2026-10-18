import type { CurrencyCode, DecimalString } from '@repo/contracts';
import {
  UNIT_SCALE,
  applyBuy,
  toDecimal,
  toDecimalString,
  type PositionState,
} from '@repo/finance';

export interface PositionSnapshot {
  readonly currency: CurrencyCode;
  readonly quantity: DecimalString;
  readonly averageCost: DecimalString;
}

export interface BuyOrder {
  readonly quantity: DecimalString;
  readonly price: DecimalString;
  readonly fee: DecimalString;
}

/**
 * Agregado de ejemplo de F0: dominio puro, sin Nest, sin I/O. La matemática viene de @repo/finance.
 * Lo consume: el caso de uso PreviewBuyUseCase.
 * TODO(B5): reemplazar por el agregado Position real del módulo portfolio.
 */
export class Position {
  private constructor(
    readonly currency: CurrencyCode,
    private readonly state: PositionState,
  ) {}

  static restore(snapshot: PositionSnapshot): Position {
    return new Position(snapshot.currency, {
      quantity: toDecimal(snapshot.quantity),
      averageCost: toDecimal(snapshot.averageCost),
    });
  }

  /** Devuelve una Position nueva; los agregados son inmutables. Una entrada inválida lanza FinanceError. */
  buy(order: BuyOrder): Position {
    const next = applyBuy(this.state, {
      quantity: toDecimal(order.quantity),
      price: toDecimal(order.price),
      fee: toDecimal(order.fee),
    });
    return new Position(this.currency, next);
  }

  toSnapshot(): PositionSnapshot {
    return {
      currency: this.currency,
      quantity: toDecimalString(this.state.quantity, UNIT_SCALE),
      averageCost: toDecimalString(this.state.averageCost, UNIT_SCALE),
    };
  }
}
