import { computeBuyPreview, type BuyPreviewForm } from './use-buy-preview';

const form = (overrides: Partial<BuyPreviewForm>): BuyPreviewForm => ({
  positionQuantity: '10',
  positionAverageCost: '100',
  buyQuantity: '5',
  buyPrice: '130',
  buyFee: '0',
  ...overrides,
});

describe('computeBuyPreview', () => {
  it('returns the weighted average cost from @repo/finance', () => {
    expect(computeBuyPreview(form({}), 'USD')).toEqual({
      kind: 'ok',
      result: { currency: 'USD', quantity: '15.0000000000', averageCost: '110.0000000000' },
    });
  });

  it('reports contract violations as VALIDATION_FAILED', () => {
    expect(computeBuyPreview(form({ buyPrice: '1,30' }), 'USD')).toEqual({
      kind: 'error',
      code: 'VALIDATION_FAILED',
    });
  });

  it('reports finance rule violations with their code', () => {
    expect(computeBuyPreview(form({ buyQuantity: '0' }), 'COP')).toEqual({
      kind: 'error',
      code: 'INVALID_QUANTITY',
    });
  });
});
