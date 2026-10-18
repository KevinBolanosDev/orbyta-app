import type * as Finance from '@repo/finance';

import { computeBuyPreview } from './use-buy-preview';

jest.mock('@repo/finance', () => ({
  ...jest.requireActual<typeof Finance>('@repo/finance'),
  previewBuy: () => {
    throw new TypeError('boom');
  },
}));

describe('computeBuyPreview with an unexpected failure', () => {
  it('does not swallow errors that are not FinanceError', () => {
    const form = {
      positionQuantity: '0',
      positionAverageCost: '0',
      buyQuantity: '1',
      buyPrice: '1',
      buyFee: '0',
    };
    expect(() => computeBuyPreview(form, 'USD')).toThrow(TypeError);
  });
});
