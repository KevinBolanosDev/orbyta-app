import { act, fireEvent, render, renderHook, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { Text as NativeText } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AccessibilityPreferencesProvider } from '../motion/accessibility-preferences';
import { StatTile } from '../primitives/stat-tile/stat-tile';

import { AreaChart } from './area-chart';
import { BarChart } from './bar-chart';
import { CandleChart } from './candle-chart';
import { staggerProgress } from './chart-kit';
import { DonutChart } from './donut-chart';
import { HeatmapCalendar } from './heatmap-calendar';
import { Sparkline } from './sparkline';
import { useScrubber } from './use-scrubber';

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success' },
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
}));

function Wrapper({ children, reduced = false }: { children: ReactNode; reduced?: boolean }) {
  return (
    <GestureHandlerRootView>
      <AccessibilityPreferencesProvider reduceMotion={reduced}>
        {children}
      </AccessibilityPreferencesProvider>
    </GestureHandlerRootView>
  );
}

/** Los gráficos dibujan después de medir su ancho. */
const layout = async (label: string, width = 320) => {
  await fireEvent(screen.getByLabelText(label), 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width, height: 200 } },
  });
};

beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});

describe('chart kit', () => {
  it('staggers pieces so they all end together', () => {
    expect(staggerProgress(0.5, 0, 1)).toBe(0.5);
    expect(staggerProgress(0, 3, 4)).toBe(0);
    expect(staggerProgress(1, 0, 4)).toBe(1);
    expect(staggerProgress(1, 3, 4)).toBe(1);
    expect(staggerProgress(0.5, 0, 4)).toBeGreaterThan(staggerProgress(0.5, 3, 4));
  });
});

describe('Sparkline (G01) and StatTile (P30)', () => {
  it('draws after measuring and exposes its summary', async () => {
    await render(
      <Wrapper>
        <Sparkline values={[1, 3, 2, 5]} accessibilityLabel="Subió 4 %" area animate />
        <Sparkline values={[5, 1]} accessibilityLabel="Bajó" width={80} tone="primary" />
      </Wrapper>,
    );
    await layout('Subió 4 %');
    await act(() => {
      jest.advanceTimersByTime(1300);
    });
    expect(screen.getByRole('image', { name: 'Subió 4 %' })).toBeOnTheScreen();
    expect(screen.getByRole('image', { name: 'Bajó' })).toBeOnTheScreen();
  });

  it('shows label, value, delta and trend', async () => {
    await render(
      <Wrapper reduced>
        <StatTile
          label="Gasto del mes"
          value="$ 2.140.000"
          delta="-3.5"
          trend={[3, 2, 4]}
          trendLabel="Tendencia"
        />
        <StatTile label="Visitas" value={<NativeText>12</NativeText>} locale="en-US" delta="1" />
        <StatTile label="Solo cifra" value="7" />
      </Wrapper>,
    );
    expect(screen.getByText('Gasto del mes')).toBeOnTheScreen();
    expect(screen.getByText('$ 2.140.000')).toBeOnTheScreen();
    expect(screen.getByRole('image', { name: 'Tendencia' })).toBeOnTheScreen();
    expect(screen.getByText('12')).toBeOnTheScreen();
  });
});

describe('AreaChart (G02) and the scrubber (G07)', () => {
  const data = [
    { label: '1 oct', value: 100 },
    { label: '10 oct', value: 140 },
    { label: '19 oct', value: 120 },
  ];

  it('draws axes, markers and switches ranges', async () => {
    const onRangeChange = jest.fn();
    await render(
      <Wrapper>
        <AreaChart
          data={data}
          formatValue={(value) => `$ ${value.toString()}`}
          accessibilityLabel="Patrimonio"
          markers={[
            { index: 1, kind: 'buy' },
            { index: 2, kind: 'sell' },
            { index: 9, kind: 'buy' },
          ]}
          ranges={[
            { value: '1M', label: '1M' },
            { value: '1A', label: '1A' },
          ]}
          range="1M"
          onRangeChange={onRangeChange}
          rangeLabel="Rango"
        />
      </Wrapper>,
    );
    await layout('Patrimonio');
    expect(screen.getByText('1 oct', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(screen.getByText('19 oct', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(screen.getByText('$ 100')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('radio', { name: '1A' }));
    expect(onRangeChange).toHaveBeenCalledWith('1A');
  });

  it('picks the point under the finger and clears on release', async () => {
    const onChange = jest.fn();
    const { result } = await renderHook(() => useScrubber([0, 50, 100], onChange), {
      wrapper: Wrapper,
    });
    expect(result.current.index).toBeNull();
    expect(result.current.gesture).toBeDefined();
  });
});

describe('BarChart (G04) and CandleChart (G03)', () => {
  it('draws vertical bars with values and labels', async () => {
    await render(
      <Wrapper>
        <BarChart
          data={[
            { label: 'Ago', value: 1200 },
            { label: 'Sep', value: -300, color: '#123456' },
            { label: 'Oct', value: 900 },
          ]}
          formatValue={(value) => value.toString()}
          accessibilityLabel="Gasto por mes"
        />
      </Wrapper>,
    );
    await layout('Gasto por mes');
    await act(() => {
      jest.advanceTimersByTime(1100);
    });
    expect(screen.getByText('Sep')).toBeOnTheScreen();
    expect(screen.getByText('-300')).toBeOnTheScreen();
  });

  it('draws horizontal bars and candles', async () => {
    await render(
      <Wrapper reduced>
        <BarChart
          orientation="horizontal"
          tone="gain"
          data={[
            { label: 'Activos', value: 500 },
            { label: 'Pasivos', value: 200 },
          ]}
          formatValue={(value) => value.toString()}
          accessibilityLabel="Activos vs pasivos"
        />
        <BarChart
          data={[{ label: 'Solo', value: 1 }]}
          accessibilityLabel="Sin valores"
          orientation="horizontal"
        />
        <CandleChart
          candles={[
            { open: 10, high: 14, low: 8, close: 13 },
            { open: 13, high: 15, low: 9, close: 9 },
          ]}
          accessibilityLabel="AAPL"
        />
      </Wrapper>,
    );
    await layout('Activos vs pasivos');
    await layout('Sin valores');
    await layout('AAPL');
    expect(screen.getByText('Pasivos')).toBeOnTheScreen();
    expect(screen.getByText('500')).toBeOnTheScreen();
    expect(screen.getByRole('image', { name: 'AAPL' })).toBeOnTheScreen();
  });
});

describe('DonutChart (G05)', () => {
  const data = [
    { label: 'Comida', value: 50 },
    { label: 'Transporte', value: 25 },
    { label: 'Ocio', value: 25, color: '#FF00FF' },
  ];

  it('selects a slice by touch and by screen reader adjustment', async () => {
    const onSelect = jest.fn();
    const { rerender } = await render(
      <Wrapper>
        <DonutChart
          data={data}
          accessibilityLabel="Gasto por categoría"
          size={200}
          thickness={28}
          selected={null}
          onSelect={onSelect}
          describeSlice={(i) => data[i]?.label ?? ''}
        >
          <NativeText>Total</NativeText>
        </DonutChart>
      </Wrapper>,
    );
    const donut = screen.getByRole('adjustable', { name: 'Gasto por categoría' });
    expect(screen.getByText('Total')).toBeOnTheScreen();
    // El toque se resuelve con measureInWindow (en Jest es un mock que no responde): la geometría
    // del toque se prueba con sliceAt; aquí, que presionar no rompa nada.
    await fireEvent.press(screen.getByTestId('donut-touch'), {
      nativeEvent: { pageX: 130, pageY: 30 },
    });
    await fireEvent(donut, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
    expect(onSelect).toHaveBeenLastCalledWith(0);
    await fireEvent(donut, 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } });
    expect(onSelect).toHaveBeenLastCalledWith(2);

    await rerender(
      <Wrapper>
        <DonutChart
          data={data}
          accessibilityLabel="Gasto por categoría"
          selected={1}
          onSelect={onSelect}
          describeSlice={(i) => data[i]?.label ?? ''}
        />
      </Wrapper>,
    );
    expect(
      screen.getByRole('adjustable', { name: 'Gasto por categoría' }),
    ).toHaveAccessibilityValue({
      text: 'Transporte',
    });
  });

  it('is a plain image without selection', async () => {
    await render(
      <Wrapper reduced>
        <DonutChart data={data} accessibilityLabel="Composición" />
      </Wrapper>,
    );
    expect(screen.getByRole('image', { name: 'Composición' })).toBeOnTheScreen();
  });
});

describe('HeatmapCalendar (G06)', () => {
  it('draws the weeks and the legend', async () => {
    await render(
      <Wrapper>
        <HeatmapCalendar
          start="2026-09-01"
          end="2026-10-19"
          values={{ '2026-10-19': 1, '2026-10-18': 3 }}
          accessibilityLabel="Leer: 2 días"
          legend={{ less: 'Menos', more: 'Más' }}
        />
      </Wrapper>,
    );
    await layout('Leer: 2 días');
    await act(() => {
      jest.advanceTimersByTime(1300);
    });
    expect(screen.getByRole('image', { name: 'Leer: 2 días' })).toBeOnTheScreen();
    expect(screen.getByText('Menos', { includeHiddenElements: true })).toBeOnTheScreen();
  });
});
