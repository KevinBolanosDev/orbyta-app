import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';

import { AccessibilityPreferencesProvider } from '../../motion/accessibility-preferences';

import { BrandMark } from './brand-mark';
import { ModuleIcon } from './module-icon';
import { BrandLockup, Wordmark } from './wordmark';

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success' },
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
}));

const flushMicrotasks = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('BrandMark (BR01)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('is an image named by the caller', async () => {
    await render(<BrandMark size={120} accessibilityLabel="Gravyx Ascenda" />);
    expect(screen.getByRole('image', { name: 'Gravyx Ascenda' })).toBeOnTheScreen();
  });

  it('is decorative without a label', async () => {
    await render(<BrandMark size={20} testID="mark" />);
    expect(screen.getByTestId('mark', { includeHiddenElements: true }).props).toMatchObject({
      importantForAccessibility: 'no-hide-descendants',
    });
  });

  it('reports the end of the entrance once M21 finishes (M21 → M20)', async () => {
    const onEntranceEnd = jest.fn();
    await render(
      <AccessibilityPreferencesProvider reduceMotion={false}>
        <BrandMark size={200} onEntranceEnd={onEntranceEnd} />
      </AccessibilityPreferencesProvider>,
    );
    await act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onEntranceEnd).not.toHaveBeenCalled();
    await act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(onEntranceEnd).toHaveBeenCalledTimes(1);
    await act(() => {
      jest.advanceTimersByTime(4000);
    });
    expect(onEntranceEnd).toHaveBeenCalledTimes(1);
  });

  it('moves the orbit and the sparkle on the UI thread after the entrance (layers)', async () => {
    await render(
      <AccessibilityPreferencesProvider reduceMotion={false}>
        <BrandMark size={220} accessibilityLabel="Orbita" />
        <BrandMark size={170} variant="icons" accessibilityLabel="Destello" />
      </AccessibilityPreferencesProvider>,
    );
    await act(() => {
      jest.advanceTimersByTime(3000);
    });
    // Después de M21: dos trazos animados, planeta, estela y destello en capas propias, más los
    // cinco íconos en cada lado de la órbita.
    const svgCount = (label: string) => {
      let count = 0;
      const walk = (node: unknown) => {
        if (!node || typeof node !== 'object') return;
        const host = node as { type: unknown; children: unknown[] };
        if (host.type === 'RNSVGSvgView') count += 1;
        host.children.forEach(walk);
      };
      walk(screen.getByLabelText(label));
      return count;
    };
    expect(svgCount('Orbita')).toBe(5 + 10);
    expect(svgCount('Destello')).toBe(5 + 10);
    await act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(screen.getByRole('image', { name: 'Orbita' })).toBeOnTheScreen();
  });

  it('skips the entrance with reduced motion and for static variants', async () => {
    const reduced = jest.fn();
    const staticMark = jest.fn();
    await render(
      <>
        <AccessibilityPreferencesProvider reduceMotion>
          <BrandMark size={200} onEntranceEnd={reduced} />
        </AccessibilityPreferencesProvider>
        <BrandMark size={64} variant="dots" onEntranceEnd={staticMark} />
        <BrandMark size={170} variant="icons" monoColor="#FFFFFF" />
      </>,
    );
    expect(reduced).toHaveBeenCalledTimes(1);
    expect(staticMark).toHaveBeenCalledTimes(1);
  });
});

describe('SvgPartsView', () => {
  it('gives every gradient its stops (react-native-svg reads them from direct children)', async () => {
    await render(<BrandMark size={220} variant="icons" accessibilityLabel="Logo" />);
    // react-native-svg convierte los <Stop> en la prop `gradient` del nodo nativo.
    interface HostNode {
      type: unknown;
      props: Record<string, unknown>;
      children: unknown[];
    }
    const gradients: HostNode[] = [];
    const walk = (node: unknown) => {
      if (!node || typeof node !== 'object') return;
      const host = node as HostNode;
      if (host.type === 'RNSVGRadialGradient' || host.type === 'RNSVGLinearGradient') {
        gradients.push(host);
      }
      host.children.forEach(walk);
    };
    walk(screen.root);
    expect(gradients.length).toBeGreaterThan(0);
    // Plano: [offset, color, offset, color…]. Sin los <Stop> reales todos los offsets quedan en 0 y
    // los colores en negro (así se veía el planeta en Android).
    for (const gradient of gradients) {
      const stops = gradient.props['gradient'] as number[];
      expect(stops.at(-2)).toBeGreaterThan(0);
    }
  });
});

describe('ModuleIcon (BR02)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is named after its module and supports every tone and size', async () => {
    await render(
      <>
        <ModuleIcon moduleId="expenses" accessibilityLabel="Gastos" />
        <ModuleIcon moduleId="stocks" tone="mono" size={32} />
        <ModuleIcon moduleId="habits" tone="light" size={20} state="inactive" />
      </>,
    );
    expect(screen.getByRole('image', { name: 'Gastos' })).toBeOnTheScreen();
  });

  it('plays a selection haptic only when it becomes active (M22)', async () => {
    const { rerender } = await render(<ModuleIcon moduleId="wealth" state="default" />);
    await flushMicrotasks();
    expect(Haptics.selectionAsync).not.toHaveBeenCalled();

    await rerender(<ModuleIcon moduleId="wealth" state="active" />);
    await act(flushMicrotasks);
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);

    await rerender(<ModuleIcon moduleId="wealth" state="active" />);
    await act(flushMicrotasks);
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
  });

  it('jumps to the active state with reduced motion', async () => {
    await render(
      <AccessibilityPreferencesProvider reduceMotion>
        <ModuleIcon moduleId="agenda" state="active" accessibilityLabel="Agenda" />
      </AccessibilityPreferencesProvider>,
    );
    expect(screen.getByLabelText('Agenda')).toBeOnTheScreen();
  });
});

describe('Wordmark and BrandLockup (BR03, BR04)', () => {
  it('renders the brand words and an accessible name', async () => {
    await render(
      <>
        <Wordmark accessibilityLabel="Gravyx Ascenda wordmark" />
        <Wordmark size={12} color="#FFFFFF" testID="plain" />
        <BrandLockup accessibilityLabel="Gravyx Ascenda" />
        <BrandLockup height={160} color="#FFFFFF" accessibilityLabel="Gravyx Ascenda grande" />
      </>,
    );
    expect(screen.getByLabelText('Gravyx Ascenda wordmark')).toBeOnTheScreen();
    expect(screen.getByRole('image', { name: 'Gravyx Ascenda' })).toBeOnTheScreen();
    expect(screen.getByLabelText('Gravyx Ascenda grande')).toBeOnTheScreen();
  });

  it('shrinks the lockup to fit a narrow container instead of cutting it', async () => {
    await render(<BrandLockup height={56} accessibilityLabel="Logo" />);
    const lockup = screen.getByRole('image', { name: 'Logo' });
    const row = lockup.children[0] as Parameters<typeof fireEvent>[0];
    const layout = (width: number, height: number) => ({
      nativeEvent: { layout: { x: 0, y: 0, width, height } },
    });
    await fireEvent(row, 'layout', layout(360, 70));
    await fireEvent(lockup, 'layout', layout(300, 70));
    expect(lockup).toHaveStyle({ height: (70 * 300) / 360 });
    expect(row).toHaveStyle({ transform: [{ scale: 300 / 360 }] });

    // Si cabe, queda en su tamaño.
    await fireEvent(lockup, 'layout', layout(400, 70));
    expect(row).toHaveStyle({ transform: [{ scale: 1 }] });
  });
});
