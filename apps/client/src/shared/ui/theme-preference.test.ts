import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook } from '@testing-library/react-native';
import { UnistylesRuntime } from 'react-native-unistyles';

import {
  getThemePreference,
  restoreThemePreference,
  setThemePreference,
  THEME_PREFERENCE_KEY,
  useThemePreference,
} from './theme-preference';

// AsyncStorage es el mock oficial (jest.setup.ts). Sus funciones ya son jest.fn: se usan
// `mock…Once` y no spyOn, para no restaurarlas sin querer entre pruebas.

describe('theme preference', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  afterEach(async () => {
    await restoreThemePreference();
  });

  it('follows the system when nothing is stored', async () => {
    const setAdaptive = jest.spyOn(UnistylesRuntime, 'setAdaptiveThemes');
    await expect(restoreThemePreference()).resolves.toBe('system');
    expect(setAdaptive).toHaveBeenCalledWith(true);
    setAdaptive.mockRestore();
  });

  it('restores and applies a stored theme', async () => {
    await AsyncStorage.setItem(THEME_PREFERENCE_KEY, 'dark');
    const setTheme = jest.spyOn(UnistylesRuntime, 'setTheme');
    await expect(restoreThemePreference()).resolves.toBe('dark');
    expect(setTheme).toHaveBeenCalledWith('dark');
    setTheme.mockRestore();
  });

  it('ignores invalid stored values', async () => {
    await AsyncStorage.setItem(THEME_PREFERENCE_KEY, 'sepia');
    await expect(restoreThemePreference()).resolves.toBe('system');
  });

  it('falls back to the system theme when storage fails', async () => {
    jest.mocked(AsyncStorage.getItem).mockRejectedValueOnce(new Error('storage down'));
    await expect(restoreThemePreference()).resolves.toBe('system');
  });

  it('applies, stores and broadcasts a new preference', async () => {
    const { result } = await renderHook(() => useThemePreference());
    expect(result.current[0]).toBe('system');

    await act(() => {
      result.current[1]('light');
    });

    expect(result.current[0]).toBe('light');
    expect(getThemePreference()).toBe('light');
    await expect(AsyncStorage.getItem(THEME_PREFERENCE_KEY)).resolves.toBe('light');
  });

  it('keeps the preference for the session when it cannot be stored', () => {
    jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('quota'));
    setThemePreference('dark');
    expect(getThemePreference()).toBe('dark');
  });
});
