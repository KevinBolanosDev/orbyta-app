import { UnistylesRuntime } from 'react-native-unistyles';

import { fontFamily } from '../tokens';

import { fontAssets } from './fonts';
import {
  applyThemePreference,
  DEFAULT_THEME_PREFERENCE,
  isThemePreference,
  THEME_PREFERENCES,
} from './preference';
import { createTheme, darkTheme, lightTheme, themes } from './themes';

describe('themes', () => {
  it('registers a light and a dark theme named after their scheme', () => {
    expect(Object.keys(themes)).toEqual(['light', 'dark']);
    expect(themes.light.scheme).toBe('light');
    expect(themes.dark.scheme).toBe('dark');
  });

  it('resolves colors, modules and glass per scheme', () => {
    expect(darkTheme.colors.bg).toBe('#060A16');
    expect(lightTheme.colors.bg).toBe('#EEF3FB');
    expect(darkTheme.modules.habits.color).toBe('#3DF5B0');
    expect(lightTheme.modules.habits.color).toBe('#06794E');
    expect(darkTheme.glass.card.fill).not.toBe(lightTheme.glass.card.fill);
  });

  it('builds the glow elevation from the theme glow color', () => {
    expect(createTheme('dark').elevation.glow).toBe(`0 10px 30px ${darkTheme.colors.glow}`);
  });

  it('shares the theme-independent tokens', () => {
    expect(lightTheme.space).toBe(darkTheme.space);
    expect(lightTheme.radius.xl).toBe(28);
  });
});

describe('fontAssets', () => {
  it('has one asset per font family token', () => {
    expect(Object.keys(fontAssets).sort()).toEqual(Object.values(fontFamily).sort());
  });
});

describe('theme preference', () => {
  // Se restaura cada espía a mano: restoreAllMocks también tocaría los mocks de jest-expo.
  const spies: { mockRestore: () => void }[] = [];
  const track = <T extends { mockRestore: () => void }>(instance: T): T => {
    spies.push(instance);
    return instance;
  };

  afterEach(() => {
    for (const instance of spies.splice(0)) instance.mockRestore();
  });

  it('accepts only system, light and dark', () => {
    expect(THEME_PREFERENCES).toEqual(['system', 'light', 'dark']);
    expect(DEFAULT_THEME_PREFERENCE).toBe('system');
    expect(isThemePreference('dark')).toBe(true);
    expect(isThemePreference('sepia')).toBe(false);
    expect(isThemePreference(null)).toBe(false);
  });

  it('follows the system with adaptive themes', () => {
    const setAdaptive = track(jest.spyOn(UnistylesRuntime, 'setAdaptiveThemes'));
    const setTheme = track(jest.spyOn(UnistylesRuntime, 'setTheme'));
    applyThemePreference('system');
    expect(setAdaptive).toHaveBeenCalledWith(true);
    expect(setTheme).not.toHaveBeenCalled();
  });

  it('turns adaptive themes off before fixing a theme', () => {
    const calls: string[] = [];
    track(jest.spyOn(UnistylesRuntime, 'setAdaptiveThemes')).mockImplementation((enabled) => {
      calls.push(`adaptive:${String(enabled)}`);
    });
    track(jest.spyOn(UnistylesRuntime, 'setTheme')).mockImplementation((name) => {
      calls.push(`theme:${name}`);
    });
    applyThemePreference('dark');
    expect(calls).toEqual(['adaptive:false', 'theme:dark']);
  });
});
