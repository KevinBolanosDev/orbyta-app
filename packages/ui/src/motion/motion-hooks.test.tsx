import { act, renderHook } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import { AppState, Platform, type AppStateStatus } from 'react-native';

import {
  AccessibilityPreferencesProvider,
  useReduceMotion,
  useReduceTransparency,
} from './accessibility-preferences';
import { triggerHaptic } from './haptics';
import { useAppActive } from './use-app-active';
import { useCountUp } from './use-count-up';
import { useDrawProgress } from './use-draw-progress';
import { useEnter } from './use-enter';
import { useOrbDrift } from './use-orb-drift';
import { usePress } from './use-press';
import { useProgressFill } from './use-progress-fill';
import { useSheen } from './use-sheen';

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success' },
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
}));

const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));
// Con temporizadores falsos `setImmediate` no corre: basta con vaciar las microtareas.
const flushMicrotasks = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

function Reduced({ children }: { children: ReactNode }) {
  return (
    <AccessibilityPreferencesProvider reduceMotion reduceTransparency>
      {children}
    </AccessibilityPreferencesProvider>
  );
}

function FullMotion({ children }: { children: ReactNode }) {
  return (
    <AccessibilityPreferencesProvider reduceMotion={false}>
      {children}
    </AccessibilityPreferencesProvider>
  );
}

describe('accessibility preferences', () => {
  it('follows the system without a provider', async () => {
    const { result } = await renderHook(() => [useReduceMotion(), useReduceTransparency()]);
    await act(flushPromises);
    expect(result.current).toEqual([false, false]);
  });

  it('lets the app force both preferences', async () => {
    const { result } = await renderHook(() => [useReduceMotion(), useReduceTransparency()], {
      wrapper: Reduced,
    });
    expect(result.current).toEqual([true, true]);
  });
});

describe('triggerHaptic', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('maps each kind to its expo-haptics call', async () => {
    triggerHaptic('light');
    triggerHaptic('medium');
    triggerHaptic('selection');
    triggerHaptic('success');
    await flushPromises();
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
    expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
  });

  it('ignores failures and does nothing on web', async () => {
    jest.mocked(Haptics.selectionAsync).mockRejectedValueOnce(new Error('unsupported'));
    triggerHaptic('selection');
    await flushPromises();

    const os = jest.replaceProperty(Platform, 'OS', 'web');
    triggerHaptic('light');
    await flushPromises();
    os.restore();
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });
});

describe('useAppActive', () => {
  it('turns false in the background and back to true when active', async () => {
    const listener: { current?: (state: AppStateStatus) => void } = {};
    const remove = jest.fn();
    // AppState ya es un mock de React Native: se cambia solo la próxima llamada (spyOn + restore le
    // borraría la implementación al mock compartido y rompería las pruebas siguientes).
    jest.mocked(AppState.addEventListener).mockImplementationOnce((_type, handler) => {
      listener.current = handler;
      return { remove };
    });

    const { result, unmount } = await renderHook(() => useAppActive());
    expect(result.current).toBe(true);
    await act(() => {
      listener.current?.('background');
    });
    expect(result.current).toBe(false);
    await act(() => {
      listener.current?.('active');
    });
    expect(result.current).toBe(true);

    await unmount();
    expect(remove).toHaveBeenCalled();
  });
});

describe('useCountUp (M03)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('counts from 0 to the value and then from the previous value', async () => {
    const { result, rerender } = await renderHook(
      ({ value }: { value: number }) => useCountUp(value),
      { initialProps: { value: 100 }, wrapper: FullMotion },
    );
    expect(result.current).toBe(0);

    await act(() => {
      jest.advanceTimersByTime(600);
    });
    expect(result.current).toBeGreaterThan(0);
    expect(result.current).toBeLessThan(100);

    await act(() => {
      jest.advanceTimersByTime(800);
    });
    expect(result.current).toBe(100);

    await rerender({ value: 40 });
    await act(() => {
      jest.advanceTimersByTime(1400);
    });
    expect(result.current).toBe(40);
  });

  it('shows the final value at once with reduced motion', async () => {
    const { result } = await renderHook(() => useCountUp(250), { wrapper: Reduced });
    expect(result.current).toBe(250);
  });
});

describe('animation hooks', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('fills progress to the clamped target (M05)', async () => {
    const { result } = await renderHook(() => useProgressFill(1.4), { wrapper: FullMotion });
    await act(() => {
      jest.advanceTimersByTime(1100);
    });
    expect(result.current.get()).toBeCloseTo(1);
  });

  it('jumps to the final state with reduced motion (M04, M05, M08)', async () => {
    const { result } = await renderHook(
      () => ({ fill: useProgressFill(0.6), draw: useDrawProgress(), sheen: useSheen() }),
      { wrapper: Reduced },
    );
    expect(result.current.fill.get()).toBeCloseTo(0.6);
    expect(result.current.draw.progress.get()).toBe(1);
    expect(result.current.draw.areaOpacity.get()).toBe(1);
    expect(result.current.sheen.reduceMotion).toBe(true);
    expect(result.current.sheen.progress.get()).toBe(0.5);
  });

  it('draws the line and fades the area in at the end (M04)', async () => {
    const { result } = await renderHook(() => useDrawProgress(), { wrapper: FullMotion });
    await act(() => {
      jest.advanceTimersByTime(1300);
    });
    expect(result.current.progress.get()).toBeCloseTo(1);
    expect(result.current.areaOpacity.get()).toBeCloseTo(1);
  });

  it('presses with haptic feedback (M02)', async () => {
    const { result } = await renderHook(() => usePress(), { wrapper: FullMotion });
    await act(async () => {
      result.current.onPressIn();
      result.current.onPressOut();
      await flushMicrotasks();
    });
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
  });

  it('runs the enter, drift and idle sheen loops without errors (M01, M08, M09)', async () => {
    const { result, unmount } = await renderHook(
      () => ({
        enter: useEnter({ index: 2 }),
        drift: useOrbDrift(1),
        idle: useSheen({ mode: 'idle' }),
        second: useSheen({ mode: 'idle' }),
      }),
      { wrapper: FullMotion },
    );
    await act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current.enter).toBeDefined();
    expect(result.current.drift).toBeDefined();
    expect(result.current.idle.reduceMotion).toBe(false);
    await unmount();
  });
});
