import 'reflect-metadata';

import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { ApiErrorSchema, BuyPreviewResponseSchema, HealthResponseSchema } from '@repo/contracts';

import { AppModule } from '../src/app.module.js';

describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns a payload that matches the contract', async () => {
    const response = await request(app.getHttpServer()).get('/health').expect(200);
    const body = HealthResponseSchema.parse(response.body);
    expect(body.status).toBe('ok');
  });

  it('POST /wiring/buy-preview computes the weighted average cost', async () => {
    const response = await request(app.getHttpServer())
      .post('/wiring/buy-preview')
      .send({
        currency: 'USD',
        position: { quantity: '10', averageCost: '100' },
        buy: { quantity: '5', price: '130', fee: '0' },
      })
      .expect(200);

    expect(BuyPreviewResponseSchema.parse(response.body).averageCost).toBe('110.0000000000');
  });

  it('rejects payloads that break the contract with VALIDATION_FAILED', async () => {
    const response = await request(app.getHttpServer())
      .post('/wiring/buy-preview')
      .send({ currency: 'EUR' })
      .expect(400);

    expect(ApiErrorSchema.parse(response.body).code).toBe('VALIDATION_FAILED');
  });

  it('maps business-rule errors to 422 with their code', async () => {
    const response = await request(app.getHttpServer())
      .post('/wiring/buy-preview')
      .send({
        currency: 'USD',
        position: { quantity: '0', averageCost: '0' },
        buy: { quantity: '0', price: '1', fee: '0' },
      })
      .expect(422);

    expect(ApiErrorSchema.parse(response.body).code).toBe('INVALID_QUANTITY');
  });
});
