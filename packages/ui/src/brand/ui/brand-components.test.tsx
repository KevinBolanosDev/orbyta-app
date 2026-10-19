import { act, render, screen } from '@testing-library/react-native';
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
});
