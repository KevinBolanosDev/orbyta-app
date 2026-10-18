import type { i18n, ThirdPartyModule } from 'i18next';
import { describe, expect, it, vi } from 'vitest';

import { createI18n } from './create-i18n.js';
import { DEFAULT_LANGUAGE, isLanguage, SUPPORTED_LANGUAGES } from './languages.js';

describe('createI18n', () => {
  it('starts in Spanish and translates synchronously', () => {
    const i18n = createI18n();
    expect(i18n.language).toBe('es');
    expect(i18n.t('brand.tagline')).toBe('Tu ascenso comienza aquí.');
  });

  it('starts in the requested language', () => {
    const i18n = createI18n({ language: 'en' });
    expect(i18n.t('brand.tagline')).toBe('Your ascent begins here.');
  });

  it('switches language at runtime', async () => {
    const i18n = createI18n();
    await i18n.changeLanguage('en');
    expect(i18n.t('modules.habits')).toBe('Habits & Goals');
  });

  it('interpolates variables', () => {
    const i18n = createI18n({ language: 'en' });
    expect(i18n.t('catalog.breakpoint', { name: 'compact' })).toBe('Current breakpoint: compact');
  });

  it('creates independent instances', async () => {
    const first = createI18n();
    const second = createI18n();
    await second.changeLanguage('en');
    expect(first.language).toBe('es');
  });

  it('registers the given plugins before init', () => {
    const init = vi.fn<(instance: i18n) => void>();
    const plugin: ThirdPartyModule = { type: '3rdParty', init };
    const i18n = createI18n({ plugins: [plugin] });
    expect(init).toHaveBeenCalledWith(i18n);
  });
});

describe('languages', () => {
  it('defaults to Spanish and supports Spanish and English', () => {
    expect(DEFAULT_LANGUAGE).toBe('es');
    expect(SUPPORTED_LANGUAGES).toEqual(['es', 'en']);
  });

  it('recognises only supported language codes', () => {
    expect(isLanguage('en')).toBe(true);
    expect(isLanguage('fr')).toBe(false);
    expect(isLanguage(undefined)).toBe(false);
  });
});
