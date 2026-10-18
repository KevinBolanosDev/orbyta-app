import { useState } from 'react';

import {
  BuyPreviewRequestSchema,
  type BuyPreviewResponse,
  type CurrencyCode,
  type ErrorCode,
} from '@repo/contracts';
import { FinanceError, previewBuy } from '@repo/finance';

export interface BuyPreviewForm {
  positionQuantity: string;
  positionAverageCost: string;
  buyQuantity: string;
  buyPrice: string;
  buyFee: string;
}

export type BuyPreviewOutcome =
  | { readonly kind: 'idle' }
  | { readonly kind: 'ok'; readonly result: BuyPreviewResponse }
  | { readonly kind: 'error'; readonly code: ErrorCode };

const INITIAL_FORM: BuyPreviewForm = {
  positionQuantity: '0',
  positionAverageCost: '0',
  buyQuantity: '',
  buyPrice: '',
  buyFee: '0',
};

/** Función pura: valida con el contrato compartido y corre la misma matemática que usa el API. */
export function computeBuyPreview(form: BuyPreviewForm, currency: CurrencyCode): BuyPreviewOutcome {
  const parsed = BuyPreviewRequestSchema.safeParse({
    currency,
    position: { quantity: form.positionQuantity, averageCost: form.positionAverageCost },
    buy: { quantity: form.buyQuantity, price: form.buyPrice, fee: form.buyFee },
  });
  if (!parsed.success) {
    return { kind: 'error', code: 'VALIDATION_FAILED' };
  }
  try {
    return { kind: 'ok', result: previewBuy(parsed.data) };
  } catch (error) {
    if (error instanceof FinanceError) {
      return { kind: 'error', code: error.code };
    }
    throw error;
  }
}

/** Estado del formulario y resultado del cálculo. Lo consume PreviewBuyForm. */
export function useBuyPreview(currency: CurrencyCode) {
  const [form, setForm] = useState<BuyPreviewForm>(INITIAL_FORM);
  const [outcome, setOutcome] = useState<BuyPreviewOutcome>({ kind: 'idle' });

  const setField = (field: keyof BuyPreviewForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const calculate = () => {
    setOutcome(computeBuyPreview(form, currency));
  };

  return { form, outcome, setField, calculate };
}
