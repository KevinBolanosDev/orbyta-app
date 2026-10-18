import type { ArgumentsHost } from '@nestjs/common';
import type { HttpAdapterHost } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';

import { FinanceError } from '@repo/finance';

import { DomainError } from '../../domain/index.js';

import { DomainErrorFilter } from './domain-error.filter.js';

function setup() {
  const reply = vi.fn();
  const adapterHost = { httpAdapter: { reply } } as unknown as HttpAdapterHost;
  const response = {};
  const host = {
    switchToHttp: () => ({ getResponse: () => response }),
  } as unknown as ArgumentsHost;
  return { filter: new DomainErrorFilter(adapterHost), reply, response, host };
}

describe('DomainErrorFilter', () => {
  it('maps a DomainError to 422 with its code', () => {
    const { filter, reply, response, host } = setup();
    filter.catch(new DomainError('NOT_FOUND'), host);
    expect(reply).toHaveBeenCalledWith(response, { code: 'NOT_FOUND' }, 422);
  });

  it('maps a FinanceError to 422 with its code', () => {
    const { filter, reply, response, host } = setup();
    filter.catch(new FinanceError('CURRENCY_MISMATCH'), host);
    expect(reply).toHaveBeenCalledWith(response, { code: 'CURRENCY_MISMATCH' }, 422);
  });

  it('keeps a readable message on DomainError', () => {
    expect(new DomainError('NOT_FOUND').message).toBe('NOT_FOUND');
    expect(new DomainError('NOT_FOUND', 'trade 42').message).toBe('trade 42');
  });
});
