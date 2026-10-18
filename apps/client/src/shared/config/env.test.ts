import { env, isDevCatalogEnabled } from './env';

describe('isDevCatalogEnabled', () => {
  it('is enabled in development', () => {
    expect(isDevCatalogEnabled(true)).toBe(true);
  });

  it('follows EXPO_PUBLIC_DEV_CATALOG outside development', () => {
    expect(isDevCatalogEnabled(false)).toBe(env.devCatalog);
  });
});
