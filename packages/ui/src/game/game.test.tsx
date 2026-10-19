import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import Medal from 'lucide-react-native/icons/medal';
import { createRef, type ReactNode } from 'react';
import { AccessibilityInfo, Platform, Pressable, Text as NativeText } from 'react-native';

import { AccessibilityPreferencesProvider } from '../motion/accessibility-preferences';
import { ToastProvider, useToast } from '../primitives/toast/toast';

import { AchievementBadge } from './achievement-badge';
import { AchievementToast } from './achievement-toast';
import { HoloCard } from './holo-card';
import { LevelBadge } from './level-badge';
import { StreakCounter } from './streak-counter';
import { XPBar } from './xp-bar';
import { XPFloat, type XPFloatHandle } from './xp-float';

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success' },
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
}));

// En Jest no hay sensores: el giroscopio de la HoloCard devuelve una lectura fija.
jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual<Record<string, unknown>>('react-native-reanimated');
  const makeMutable = actual['makeMutable'] as (mockInitial: unknown) => unknown;
  return {
    __esModule: true,
    ...actual,
    default: actual['default'],
    useAnimatedSensor: () => ({
      sensor: makeMutable({ pitch: 0, roll: 0, yaw: 0, qw: 1, qx: 0, qy: 0, qz: 0 }),
      unregister: () => undefined,
      isAvailable: true,
      config: { interval: 'auto' },
    }),
  };
});

function Motion({ children, reduced = false }: { children: ReactNode; reduced?: boolean }) {
  return (
    <AccessibilityPreferencesProvider reduceMotion={reduced}>
      {children}
    </AccessibilityPreferencesProvider>
  );
}

const advance = async (ms: number) => {
  await act(() => {
    jest.advanceTimersByTime(ms);
  });
};

/** Promesas pendientes (la háptica se dispara dentro de una). */
const flush = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.mocked(Haptics.notificationAsync).mockClear();
});
afterEach(() => {
  jest.useRealTimers();
});

describe('LevelBadge (X01)', () => {
  it('shows the level and celebrates only when it goes up', async () => {
    const { rerender } = await render(
      <Motion>
        <LevelBadge level={12} accessibilityLabel="Nivel 12, Estratega" />
      </Motion>,
    );
    expect(screen.getByRole('image', { name: 'Nivel 12, Estratega' })).toHaveTextContent('12');
    await flush();
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();

    await rerender(
      <Motion>
        <LevelBadge level={13} size="l" accessibilityLabel="Nivel 13, Estratega" />
      </Motion>,
    );
    await flush();
    expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);

    await rerender(
      <Motion reduced>
        <LevelBadge level={14} size="s" accessibilityLabel="Nivel 14, Estratega" />
      </Motion>,
    );
    await rerender(
      <Motion reduced>
        <LevelBadge level={3} size="s" accessibilityLabel="Nivel 3, Aprendiz" />
      </Motion>,
    );
    await flush();
    expect(Haptics.notificationAsync).toHaveBeenCalledTimes(2);
  });
});

describe('XPBar (X02)', () => {
  it('shows the XP of the level as text and as a progress value', async () => {
    const { rerender } = await render(
      <Motion>
        <XPBar
          current={2450}
          goal={3600}
          level={12}
          label="Nivel 12 · Estratega"
          accessibilityLabel="Experiencia"
        />
      </Motion>,
    );
    expect(screen.getByText('2.450 / 3.600 XP')).toBeOnTheScreen();
    expect(screen.getByText('Nivel 12 · Estratega')).toBeOnTheScreen();
    expect(screen.getByRole('progressbar', { name: 'Experiencia' })).toHaveAccessibilityValue({
      now: 68,
      text: '2.450 / 3.600 XP',
    });

    // Sube de nivel: completa la barra y vuelve a llenar desde 0.
    await rerender(
      <Motion>
        <XPBar current={100} goal={3900} level={13} locale="en-US" accessibilityLabel="XP" />
      </Motion>,
    );
    expect(screen.getByText('100 / 3,900 XP')).toBeOnTheScreen();
    await advance(1600);

    await rerender(
      <Motion reduced>
        <XPBar current={0} goal={0} accessibilityLabel="XP" />
      </Motion>,
    );
    expect(screen.getByRole('progressbar', { name: 'XP' })).toHaveAccessibilityValue({ now: 0 });
  });
});

describe('StreakCounter (X03)', () => {
  it('shows the days and warns when the streak is at risk', async () => {
    const { rerender } = await render(
      <Motion>
        <StreakCounter days={1234} unit="días" accessibilityLabel="Racha de 1.234 días" />
      </Motion>,
    );
    expect(screen.getByLabelText('Racha de 1.234 días')).toHaveTextContent('1.234días');
    expect(screen.queryByText('Registra hoy')).toBeNull();

    await rerender(
      <Motion>
        <StreakCounter
          days={12}
          unit="días"
          atRisk
          riskLabel="Registra hoy"
          accessibilityLabel="Racha de 12 días, en riesgo"
        />
      </Motion>,
    );
    expect(screen.getByText('Registra hoy')).toBeOnTheScreen();
    await advance(1200);

    await rerender(
      <Motion reduced>
        <StreakCounter days={12} unit="days" atRisk locale="en-US" accessibilityLabel="Streak" />
      </Motion>,
    );
    expect(screen.getByLabelText('Streak')).toHaveTextContent('12days');
  });
});

describe('AchievementBadge (X04)', () => {
  it('renders the three states and celebrates an unlock in view', async () => {
    const { rerender } = await render(
      <Motion>
        <AchievementBadge
          title="Racha de 30 días"
          icon={Medal}
          state="locked"
          family="discipline"
          detail="Registra 30 días seguidos"
          accessibilityLabel="Racha de 30 días, bloqueado"
        />
      </Motion>,
    );
    expect(screen.getByLabelText('Racha de 30 días, bloqueado')).toHaveTextContent(
      'Racha de 30 díasRegistra 30 días seguidos',
    );

    await rerender(
      <Motion>
        <AchievementBadge
          title="Racha de 30 días"
          icon={Medal}
          state="progress"
          family="discipline"
          progress={0.4}
          detail="12 / 30"
          accessibilityLabel="Racha de 30 días, 12 de 30"
        />
      </Motion>,
    );
    expect(screen.getByRole('progressbar', { name: 'Racha de 30 días' })).toHaveAccessibilityValue({
      now: 40,
      text: '12 / 30',
    });
    await flush();
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();

    const open = jest.fn();
    await rerender(
      <Motion>
        <AchievementBadge
          title="Racha de 30 días"
          icon={Medal}
          state="unlocked"
          family="discipline"
          detail="19 oct 2026"
          accessibilityLabel="Racha de 30 días, desbloqueado"
          onPress={open}
        />
      </Motion>,
    );
    await flush();
    expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
    await fireEvent.press(screen.getByRole('button', { name: 'Racha de 30 días, desbloqueado' }));
    expect(open).toHaveBeenCalled();
  });

  it('does not celebrate achievements that were already unlocked', async () => {
    await render(
      <Motion reduced>
        <AchievementBadge
          title="Primer presupuesto"
          icon={Medal}
          state="unlocked"
          accessibilityLabel="Primer presupuesto"
        />
      </Motion>,
    );
    await flush();
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Primer presupuesto')).toBeOnTheScreen();
  });
});

describe('AchievementToast (X05)', () => {
  it('announces the achievement and can be dismissed', async () => {
    const dismiss = jest.fn();
    await render(
      <Motion>
        <AchievementToast
          overline="LOGRO DESBLOQUEADO"
          title="Primer presupuesto"
          xp="+50 XP"
          onDismiss={dismiss}
          dismissLabel="Descartar"
        />
      </Motion>,
    );
    expect(
      screen.getByRole('alert', { name: 'LOGRO DESBLOQUEADO, Primer presupuesto, +50 XP' }),
    ).toBeOnTheScreen();
    await flush();
    expect(Haptics.notificationAsync).toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'Descartar' }));
    expect(dismiss).toHaveBeenCalled();
  });

  it('shows through the toast queue for 5 s', async () => {
    function Trigger() {
      const toast = useToast();
      return (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            toast.show({
              message: 'Racha de 30 días',
              achievement: { overline: 'LOGRO DESBLOQUEADO', xp: '+150 XP', icon: Medal },
            });
            toast.show({ message: 'Primer paso', achievement: { overline: 'LOGRO' } });
          }}
        >
          <NativeText>unlock</NativeText>
        </Pressable>
      );
    }
    await render(
      <Motion reduced>
        <ToastProvider dismissLabel="Descartar">
          <Trigger />
        </ToastProvider>
      </Motion>,
    );
    await fireEvent.press(screen.getByText('unlock'));
    expect(screen.getByRole('alert', { name: 'LOGRO, Primer paso' })).toBeOnTheScreen();
    await fireEvent.press(screen.getAllByRole('button', { name: 'Descartar' })[0] as never);
    await advance(4900);
    expect(screen.getByText('Racha de 30 días')).toBeOnTheScreen();
    // Se cierra a los 5 s y sale (el temporizador de la salida empieza después).
    await advance(200);
    await advance(300);
    expect(screen.queryByText('Racha de 30 días')).toBeNull();
  });
});

describe('HoloCard (X06)', () => {
  it('renders its content and opens the goal', async () => {
    const open = jest.fn();
    await render(
      <Motion>
        <HoloCard onPress={open} accessibilityLabel="Fondo de emergencia, 64 %">
          <NativeText>Fondo de emergencia</NativeText>
        </HoloCard>
      </Motion>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Fondo de emergencia, 64 %' }));
    expect(open).toHaveBeenCalled();
  });

  it('follows the pointer on web and settles when it leaves', async () => {
    const os = Platform.OS;
    Platform.OS = 'web';
    try {
      const { rerender } = await render(
        <Motion>
          <HoloCard testID="card" sheen="idle">
            <NativeText>Meta</NativeText>
          </HoloCard>
        </Motion>,
      );
      const card = screen.getByTestId('card');
      await fireEvent(card, 'pointerEnter');
      await fireEvent(card, 'pointerMove', { nativeEvent: { clientX: 10, clientY: 10 } });
      await fireEvent(card, 'pointerLeave');
      await rerender(
        <Motion reduced>
          <HoloCard testID="card">
            <NativeText>Meta</NativeText>
          </HoloCard>
        </Motion>,
      );
      expect(screen.getByTestId('card').props).not.toHaveProperty('onPointerMove');
    } finally {
      Platform.OS = os;
    }
  });
});

describe('XPFloat (X07)', () => {
  it('floats each +XP, announces it and removes it after 700 ms', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockClear();
    const ref = createRef<XPFloatHandle>();
    await render(
      <Motion>
        <XPFloat ref={ref} testID="float" />
      </Motion>,
    );
    await act(() => {
      ref.current?.show('+5 XP');
      ref.current?.show('+10 XP');
    });
    const float = () => screen.getByTestId('float', { includeHiddenElements: true });
    expect(float()).toHaveTextContent('+5 XP+10 XP');
    expect(announce).toHaveBeenCalledWith('+5 XP');
    await advance(700);
    expect(float()).toHaveTextContent('', { exact: true });
    announce.mockRestore();
  });

  it('can stay quiet for the screen reader', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockClear();
    const ref = createRef<XPFloatHandle>();
    await render(
      <Motion reduced>
        <XPFloat ref={ref} announce={false} />
      </Motion>,
    );
    await act(() => {
      ref.current?.show('+5 XP');
    });
    expect(announce).not.toHaveBeenCalled();
    announce.mockRestore();
  });
});
