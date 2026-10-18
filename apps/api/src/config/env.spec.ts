import { describe, expect, it } from 'vitest';

import { parseEnv } from './env.js';

describe('parseEnv', () => {
  it('applies defaults', () => {
    expect(parseEnv({})).toEqual({
      NODE_ENV: 'development',
      PORT: 3000,
      CORS_ORIGINS: ['http://localhost:8081'],
    });
  });

  it('splits CORS origins', () => {
    const env = parseEnv({ CORS_ORIGINS: 'http://a.test, http://b.test,' });
    expect(env.CORS_ORIGINS).toEqual(['http://a.test', 'http://b.test']);
  });

  it('fails fast on invalid values', () => {
    expect(() => parseEnv({ PORT: 'abc' })).toThrow(/Invalid environment/);
  });
});
