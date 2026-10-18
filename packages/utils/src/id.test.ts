import { describe, expect, it } from 'vitest';

import { createId, isUuidV7 } from './id.js';

describe('createId', () => {
  it('creates valid UUIDv7 values', () => {
    const id = createId();
    expect(isUuidV7(id)).toBe(true);
  });

  it('creates ids that sort by creation time', () => {
    const ids = Array.from({ length: 50 }, () => createId());
    expect([...ids].sort()).toEqual(ids);
  });
});

describe('isUuidV7', () => {
  it('rejects other UUID versions and garbage', () => {
    expect(isUuidV7('2b0f6d7c-3f5e-4b8a-9c1d-0e2f4a6b8c0d')).toBe(false); // es v4
    expect(isUuidV7('not-an-id')).toBe(false);
  });
});
