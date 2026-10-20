import { glass } from '../tokens';

import { cssBackdropFilter, glassRendering, nativeBlurIntensity } from './glass';

describe('glassRendering', () => {
  const base = { level: 'chrome', reduceTransparency: false, hasBlurTarget: true } as const;

  it('uses the solid fallback when transparency is reduced, on every platform', () => {
    for (const os of ['ios', 'android', 'web'] as const) {
      expect(glassRendering({ ...base, os, reduceTransparency: true })).toBe('solid');
    }
  });

  it('uses CSS backdrop-filter on web', () => {
    expect(glassRendering({ ...base, os: 'web', level: 'card' })).toBe('css-blur');
  });

  it('blurs every level on iOS, with or without a target', () => {
    expect(glassRendering({ ...base, os: 'ios', level: 'card', hasBlurTarget: false })).toBe(
      'native-blur',
    );
  });

  it('only blurs chrome and sheet on Android, and only with a blur target', () => {
    expect(glassRendering({ ...base, os: 'android', level: 'sheet' })).toBe('native-blur');
    expect(glassRendering({ ...base, os: 'android', level: 'card' })).toBe('translucent');
  });

  it('keeps Android overlays without a blur target legible with the solid fallback', () => {
    expect(glassRendering({ ...base, os: 'android', hasBlurTarget: false })).toBe('solid');
    expect(glassRendering({ ...base, os: 'android', level: 'sheet', hasBlurTarget: false })).toBe(
      'solid',
    );
  });
});

describe('glass helpers', () => {
  it('builds the CSS backdrop filter of a level', () => {
    expect(cssBackdropFilter(glass.dark.sheet)).toBe('blur(40px) saturate(180%)');
  });

  it('maps the blur radius to a BlurView intensity of at most 100', () => {
    expect(nativeBlurIntensity(30)).toBe(60);
    expect(nativeBlurIntensity(90)).toBe(100);
  });
});
