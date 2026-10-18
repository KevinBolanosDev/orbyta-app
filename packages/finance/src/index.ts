// @repo/finance — API pública. Matemática financiera pura con decimal.js (plan §7).
// Lo consumen: apps/client (cálculos locales, feature preview-buy) y apps/api (dominio de los
// módulos, ej. wiring/domain/position.ts). Frontend y backend calculan con el mismo código.
export { Decimal, toDecimal, toDecimalString, type DecimalInput } from './decimal.js';
export { FinanceError } from './errors.js';
export {
  DISPLAY_DECIMALS,
  addMoney,
  money,
  roundForDisplay,
  subtractMoney,
  type Money,
} from './money.js';
export { UNIT_SCALE, applyBuy, previewBuy, type BuyTrade, type PositionState } from './position.js';
