import { z } from 'zod';

import { HttpError, getJson } from './http-client';

const Schema = z.object({ value: z.number() });

const stubResponse = (status: number, body: unknown) =>
  ({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) }) as Response;

describe('getJson', () => {
  it('calls the API base URL and validates the body', async () => {
    const fetchMock = jest.fn(() => Promise.resolve(stubResponse(200, { value: 1 })));
    globalThis.fetch = fetchMock;

    await expect(getJson('/thing', Schema)).resolves.toEqual({ value: 1 });
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/thing', expect.any(Object));
  });

  it('throws HttpError on non-2xx responses', async () => {
    globalThis.fetch = jest.fn(() => Promise.resolve(stubResponse(503, {})));
    await expect(getJson('/thing', Schema)).rejects.toBeInstanceOf(HttpError);
  });

  it('rejects bodies that break the contract', async () => {
    globalThis.fetch = jest.fn(() => Promise.resolve(stubResponse(200, { value: 'nope' })));
    await expect(getJson('/thing', Schema)).rejects.toBeInstanceOf(z.ZodError);
  });
});
