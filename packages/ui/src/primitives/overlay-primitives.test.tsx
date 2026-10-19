import { act, fireEvent, render, renderHook, screen } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import Plus from 'lucide-react-native/icons/plus';
import type { ReactNode } from 'react';
import { Pressable, Text as NativeText } from 'react-native';
import { UnistylesRuntime } from 'react-native-unistyles';

import { AccessibilityPreferencesProvider } from '../motion/accessibility-preferences';
import { usePresence } from '../motion/use-presence';
import { useSlideIndicator } from '../motion/use-slide-indicator';

import { BottomSheet } from './bottom-sheet/bottom-sheet';
import {
  sheetDragOffset,
  sheetFixedHeight,
  sheetMaxHeight,
  shouldDismissSheet,
} from './bottom-sheet/sheet-math';
import { Dialog } from './dialog/dialog';
import { Fab } from './fab/fab';
import { ProgressBar, ProgressRing } from './progress/progress';
import { budgetTone, progressPercent, ringGeometry, stepState } from './progress/progress-math';
import { SegmentedControl } from './segmented-control/segmented-control';
import { Stepper } from './stepper/stepper';
import { OfflineBanner, SyncBadge } from './sync-status/sync-status';
import { Tabs } from './tabs/tabs';
import { ToastProvider, useToast } from './toast/toast';
import { dismissToast, enqueueToast, removeToast, type ToastEntry } from './toast/toast-queue';

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success' },
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
}));

function FullMotion({ children }: { children: ReactNode }) {
  return (
    <AccessibilityPreferencesProvider reduceMotion={false}>
      {children}
    </AccessibilityPreferencesProvider>
  );
}

function Reduced({ children }: { children: ReactNode }) {
  return (
    <AccessibilityPreferencesProvider reduceMotion>{children}</AccessibilityPreferencesProvider>
  );
}

const advance = async (ms: number) => {
  await act(() => {
    jest.advanceTimersByTime(ms);
  });
};

beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});

describe('pure helpers', () => {
  it('maps budget usage to healthy, limit and exceeded', () => {
    expect(budgetTone(0.5)).toBe('healthy');
    expect(budgetTone(0.8)).toBe('limit');
    expect(budgetTone(0.99)).toBe('limit');
    expect(budgetTone(1)).toBe('exceeded');
    expect(budgetTone(1.4)).toBe('exceeded');
  });

  it('reports a clamped integer percent', () => {
    expect(progressPercent(0.456)).toBe(46);
    expect(progressPercent(-1)).toBe(0);
    expect(progressPercent(1.7)).toBe(100);
  });

  it('keeps the ring stroke inside its box', () => {
    const ring = ringGeometry(96, 8);
    expect(ring.center).toBe(48);
    expect(ring.radius).toBe(44);
    expect(ring.circumference).toBeCloseTo(2 * Math.PI * 44);
    expect(ringGeometry(4, 10).radius).toBe(0);
  });

  it('classifies wizard steps', () => {
    expect([0, 1, 2].map((i) => stepState(i, 1))).toEqual(['done', 'current', 'upcoming']);
  });

  it('sizes the sheet by height mode', () => {
    const max = sheetMaxHeight(800, 40, 48);
    expect(max).toBe(712);
    expect(sheetMaxHeight(50, 40, 48)).toBe(0);
    expect(sheetFixedHeight('full', 800, max)).toBe(712);
    expect(sheetFixedHeight('half', 800, max)).toBe(400);
    expect(sheetFixedHeight('half', 800, 300)).toBe(300);
    expect(sheetFixedHeight('auto', 800, max)).toBeUndefined();
  });

  it('drags freely down, resists up and dismisses past the threshold or on a fling', () => {
    expect(sheetDragOffset(120)).toBe(120);
    expect(sheetDragOffset(-100)).toBeCloseTo(-15);
    expect(shouldDismissSheet(100, 0, 400)).toBe(false);
    expect(shouldDismissSheet(130, 0, 400)).toBe(true);
    expect(shouldDismissSheet(20, 1500, 400)).toBe(true);
  });

  it('queues toasts and lets the oldest leave past the maximum', () => {
    const entry = (id: number): ToastEntry => ({
      id,
      message: `t${id}`,
      tone: 'info',
      duration: 4000,
      leaving: false,
    });
    let queue = [entry(1), entry(2)];
    queue = enqueueToast(queue, entry(3), 2);
    expect(queue.map((t) => [t.id, t.leaving])).toEqual([
      [1, true],
      [2, false],
      [3, false],
    ]);
    queue = dismissToast(queue, 2);
    expect(queue.find((t) => t.id === 2)?.leaving).toBe(true);
    expect(dismissToast(queue, 2)).toEqual(queue);
    expect(removeToast(queue, 1).map((t) => t.id)).toEqual([2, 3]);
  });
});

describe('motion helpers', () => {
  it('mounts, then unmounts only after the exit animation', async () => {
    const onExited = jest.fn();
    const { result, rerender } = await renderHook(
      ({ visible }: { visible: boolean }) => usePresence(visible, { onExited }),
      { initialProps: { visible: false }, wrapper: FullMotion },
    );
    expect(result.current.mounted).toBe(false);
    await rerender({ visible: true });
    expect(result.current.mounted).toBe(true);
    await advance(700);
    expect(result.current.progress.get()).toBe(1);

    await rerender({ visible: false });
    expect(result.current.mounted).toBe(true);
    await advance(420);
    expect(result.current.mounted).toBe(false);
    expect(onExited).toHaveBeenCalledTimes(1);
  });

  it('fades in and out with reduced motion and with the fade entrance', async () => {
    const { result, rerender } = await renderHook(
      ({ visible }: { visible: boolean }) => usePresence(visible, { enter: 'spring' }),
      { initialProps: { visible: true }, wrapper: Reduced },
    );
    await advance(200);
    expect(result.current.progress.get()).toBe(1);
    await rerender({ visible: false });
    await advance(150);
    expect(result.current.mounted).toBe(false);

    const fade = await renderHook(() => usePresence(true, { enter: 'fade' }), {
      wrapper: FullMotion,
    });
    await advance(250);
    expect(fade.result.current.progress.get()).toBe(1);
  });

  it('places the indicator first and then slides it', async () => {
    const { result, rerender } = await renderHook(
      ({ target }: { target: { x: number; width: number } | undefined }) =>
        useSlideIndicator(target),
      { initialProps: { target: undefined }, wrapper: FullMotion },
    );
    expect(result.current).toBeTruthy();
    await rerender({ target: { x: 0, width: 80 } });
    await rerender({ target: { x: 90, width: 60 } });
    await advance(500);
    expect(result.current).toBeTruthy();
  });
});

describe('ProgressBar (P18), ProgressRing (P19) and Stepper (P34)', () => {
  it('exposes progress values to screen readers', async () => {
    await render(
      <FullMotion>
        <ProgressBar value={0.85} tone="auto" accessibilityLabel="Comida" valueText="85 de 100" />
        <ProgressBar value={0.3} size="thin" accessibilityLabel="Arranque" />
        <ProgressRing value={1.2} tone="exceeded" accessibilityLabel="Hábitos">
          <NativeText>3/3</NativeText>
        </ProgressRing>
        <ProgressRing value={0} tone="healthy" size={48} strokeWidth={4} accessibilityLabel="Hoy" />
      </FullMotion>,
    );
    await advance(1100);
    expect(screen.getByRole('progressbar', { name: 'Comida' })).toHaveAccessibilityValue({
      min: 0,
      max: 100,
      now: 85,
      text: '85 de 100',
    });
    expect(screen.getByRole('progressbar', { name: 'Hábitos' })).toHaveAccessibilityValue({
      now: 100,
    });
    expect(screen.getByText('3/3')).toBeOnTheScreen();
    expect(screen.getByRole('progressbar', { name: 'Hoy' })).toHaveAccessibilityValue({ now: 0 });
  });

  it('shows the current step and clamps out-of-range indices', async () => {
    const steps = ['Tipo', 'Datos', 'Confirmar'];
    const { rerender } = await render(
      <FullMotion>
        <Stepper steps={steps} current={1} accessibilityLabel="Paso 2 de 3" />
      </FullMotion>,
    );
    expect(screen.getByRole('progressbar', { name: 'Paso 2 de 3' })).toHaveAccessibilityValue({
      min: 1,
      max: 3,
      now: 2,
      text: 'Datos',
    });
    await rerender(
      <FullMotion>
        <Stepper steps={steps} current={9} accessibilityLabel="Paso 3 de 3" />
      </FullMotion>,
    );
    expect(screen.getByRole('progressbar', { name: 'Paso 3 de 3' })).toHaveAccessibilityValue({
      now: 3,
    });
  });
});

describe('SegmentedControl (P12) and Tabs (P31)', () => {
  const layout = (x: number, width: number) => ({
    nativeEvent: { layout: { x, y: 0, width, height: 44 } },
  });

  it('selects one option with a selection haptic', async () => {
    const onChange = jest.fn();
    await render(
      <FullMotion>
        <SegmentedControl
          accessibilityLabel="Período"
          value="month"
          onChange={onChange}
          fullWidth
          options={[
            { value: 'week', label: 'Semana' },
            { value: 'month', label: 'Mes', icon: Plus },
          ]}
        />
      </FullMotion>,
    );
    const week = screen.getByRole('radio', { name: 'Semana' });
    const month = screen.getByRole('radio', { name: 'Mes' });
    await fireEvent(week, 'layout', layout(0, 80));
    await fireEvent(month, 'layout', layout(80, 60));
    expect(month).toBeChecked();
    await fireEvent.press(month);
    expect(onChange).not.toHaveBeenCalled();
    await fireEvent.press(week);
    expect(onChange).toHaveBeenCalledWith('week');
    await act(() => Promise.resolve());
    expect(Haptics.selectionAsync).toHaveBeenCalled();
  });

  it('marks the selected tab and reads its count', async () => {
    const onChange = jest.fn();
    await render(
      <FullMotion>
        <Tabs
          accessibilityLabel="Secciones"
          value="subs"
          onChange={onChange}
          tabs={[
            { value: 'subs', label: 'Suscripciones', count: 3 },
            { value: 'loans', label: 'Créditos' },
          ]}
        />
      </FullMotion>,
    );
    const subs = screen.getByRole('tab', { name: 'Suscripciones, 3' });
    await fireEvent(subs, 'layout', layout(0, 140));
    expect(subs).toBeSelected();
    await fireEvent.press(subs);
    await fireEvent.press(screen.getByRole('tab', { name: 'Créditos' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('loans');
  });
});

describe('Fab (P32)', () => {
  it('presses and reports whether its menu is open', async () => {
    const onPress = jest.fn();
    const { rerender } = await render(
      <FullMotion>
        <Fab icon={Plus} accessibilityLabel="Nuevo gasto" onPress={onPress} expanded={false} />
      </FullMotion>,
    );
    const fab = screen.getByRole('button', { name: 'Nuevo gasto' });
    expect(fab).not.toBeExpanded();
    await fireEvent.press(fab);
    expect(onPress).toHaveBeenCalledTimes(1);
    await rerender(
      <Reduced>
        <Fab icon={Plus} accessibilityLabel="Nuevo gasto" expanded />
      </Reduced>,
    );
    expect(screen.getByRole('button', { name: 'Nuevo gasto' })).toBeExpanded();
  });
});

describe('SyncBadge and OfflineBanner (P37)', () => {
  it('shows each sync status and can be pressed to retry', async () => {
    const onPress = jest.fn();
    const { rerender } = await render(
      <FullMotion>
        <SyncBadge status="syncing" label="Sincronizando…" />
        <SyncBadge status="error" label="Error al sincronizar" onPress={onPress} />
      </FullMotion>,
    );
    expect(screen.getByLabelText('Sincronizando…')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Error al sincronizar' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    await rerender(
      <Reduced>
        <SyncBadge status="pending" label="Pendiente de sincronizar (3)" />
        <SyncBadge status="synced" label="Todo sincronizado" />
      </Reduced>,
    );
    await advance(250);
    expect(screen.getByLabelText('Pendiente de sincronizar (3)')).toBeOnTheScreen();
    expect(screen.getByLabelText('Todo sincronizado')).toBeOnTheScreen();
  });

  it('fades the offline banner in and out', async () => {
    const onAction = jest.fn();
    const banner = (visible: boolean) => (
      <FullMotion>
        <OfflineBanner
          visible={visible}
          message="Sin conexión"
          actionLabel="Reintentar"
          onAction={onAction}
        />
      </FullMotion>
    );
    const { rerender } = await render(banner(true));
    expect(screen.getByRole('alert')).toHaveTextContent('Sin conexión');
    await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onAction).toHaveBeenCalledTimes(1);
    await rerender(banner(false));
    await advance(200);
    expect(screen.queryByText('Sin conexión')).toBeNull();
  });
});

describe('Toast (P23)', () => {
  function Trigger() {
    const toast = useToast();
    return (
      <>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            toast.show({ message: 'Guardado', tone: 'success' });
          }}
        >
          <NativeText>save</NativeText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            toast.show({
              message: 'Gasto eliminado',
              tone: 'undo',
              actionLabel: 'Deshacer',
              onAction: undo,
            });
          }}
        >
          <NativeText>delete</NativeText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            const id = toast.show({ message: 'Sin red', tone: 'error' });
            toast.dismiss(id);
          }}
        >
          <NativeText>flash</NativeText>
        </Pressable>
      </>
    );
  }
  const undo = jest.fn();

  const renderToasts = () =>
    render(
      <FullMotion>
        <ToastProvider dismissLabel="Descartar">
          <Trigger />
        </ToastProvider>
      </FullMotion>,
    );

  it('shows a toast and hides it after 4 s plus the exit', async () => {
    await renderToasts();
    await fireEvent.press(screen.getByText('save'));
    expect(screen.getByRole('alert')).toHaveTextContent('Guardado');
    await advance(4000);
    await advance(200);
    expect(screen.queryByText('Guardado')).toBeNull();
  });

  it('runs the undo action and closes with the dismiss button', async () => {
    await renderToasts();
    await fireEvent.press(screen.getByText('delete'));
    await fireEvent.press(screen.getByRole('button', { name: 'Deshacer' }));
    expect(undo).toHaveBeenCalledTimes(1);
    await advance(200);
    expect(screen.queryByText('Gasto eliminado')).toBeNull();

    await fireEvent.press(screen.getByText('save'));
    await fireEvent.press(screen.getByRole('button', { name: 'Descartar' }));
    await advance(200);
    expect(screen.queryByText('Guardado')).toBeNull();

    await fireEvent.press(screen.getByText('flash'));
    await advance(200);
    expect(screen.queryByText('Sin red')).toBeNull();
  });

  it('stacks at the bottom outside compact', async () => {
    const breakpoint = jest.replaceProperty(UnistylesRuntime, 'breakpoint', 'expanded');
    await renderToasts();
    await fireEvent.press(screen.getByText('save'));
    await fireEvent.press(screen.getByText('save'));
    expect(screen.getAllByText('Guardado')).toHaveLength(2);
    breakpoint.restore();
  });

  it('requires a provider', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(render(<Trigger />)).rejects.toThrow('useToast must be used inside');
    error.mockRestore();
  });
});

describe('BottomSheet (P24) and Dialog (P25)', () => {
  const sheet = (visible: boolean, onClose: () => void, footer?: ReactNode) => (
    <FullMotion>
      <BottomSheet
        visible={visible}
        onClose={onClose}
        closeLabel="Cerrar"
        title="Filtrar"
        height="half"
        footer={footer}
      >
        <NativeText>Contenido</NativeText>
      </BottomSheet>
    </FullMotion>
  );

  it('opens as a modal sheet, closes with its button and unmounts after the exit', async () => {
    const onClose = jest.fn();
    const { rerender } = await render(sheet(false, onClose));
    expect(screen.queryByText('Contenido')).toBeNull();

    await rerender(sheet(true, onClose, <NativeText>Guardar</NativeText>));
    expect(screen.getByRole('header', { name: 'Filtrar' })).toBeOnTheScreen();
    expect(screen.getByText('Guardar')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    await rerender(sheet(false, onClose));
    await advance(420);
    expect(screen.queryByText('Contenido')).toBeNull();
  });

  it('becomes a centered dialog in expanded', async () => {
    const breakpoint = jest.replaceProperty(UnistylesRuntime, 'breakpoint', 'expanded');
    await render(sheet(true, jest.fn(), <NativeText>Guardar</NativeText>));
    expect(screen.getByText('Contenido')).toBeOnTheScreen();
    expect(screen.getByLabelText('Filtrar')).toBeOnTheScreen();
    breakpoint.restore();
  });

  it('confirms or cancels a destructive action', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    await render(
      <Reduced>
        <Dialog
          visible
          title="¿Eliminar el gasto?"
          message="No se puede deshacer."
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          onConfirm={onConfirm}
          onCancel={onCancel}
          destructive
        />
      </Reduced>,
    );
    expect(screen.getByRole('header', { name: '¿Eliminar el gasto?' })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Eliminar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
