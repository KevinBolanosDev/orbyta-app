import { useId } from 'react';
import { View, type ViewProps } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { withAlpha } from '../lib/color';
import { useDrawProgress } from '../motion/use-draw-progress';
import { SegmentedControl } from '../primitives/segmented-control/segmented-control';
import { Text } from '../primitives/text/text';

import { useChartColor, useMeasuredWidth, type ChartTone } from './chart-kit';
import { areaPath, linePath, pathLength, seriesPoints, trendOf } from './geometry/line';
import { extentOf, linear, niceTicks, plotBox } from './geometry/scale';
import { useScrubber } from './use-scrubber';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export interface ChartPoint {
  /** Fecha o etiqueta ya formateada ("19 oct"), para el eje y el scrubber. */
  label: string;
  value: number;
}

export interface ChartMarker {
  index: number;
  kind: 'buy' | 'sell';
}

export interface AreaChartProps<R extends string> extends Pick<ViewProps, 'style' | 'testID'> {
  data: readonly ChartPoint[];
  /** Formato de los valores del eje y del scrubber (moneda, %). */
  formatValue: (value: number) => string;
  /** Resumen para el lector de pantalla ("Patrimonio: subió de $ 120 M a $ 134 M en 3 meses"). */
  accessibilityLabel: string;
  height?: number;
  /** `auto` (por defecto): verde si sube en el período, rojo si baja. */
  tone?: ChartTone;
  /** Compras y ventas sobre la línea (Bolsa). */
  markers?: readonly ChartMarker[];
  /** Rango (1S/1M/3M/1A/Todo): las etiquetas y el filtrado de datos los da la pantalla. */
  ranges?: readonly { value: R; label: string }[];
  range?: R;
  onRangeChange?: (range: R) => void;
  rangeLabel?: string;
  /** Avisa el punto elegido con el scrubber (o `null` al soltar). */
  onScrub?: (index: number | null) => void;
}

const INSETS = { top: 12, right: 0, bottom: 24, left: 0 };
const Y_TICKS = 3;

/**
 * G02 · AreaChart: línea con área en degradado, tres líneas guía con su valor, la primera y la última
 * fecha, marcadores de compra (punto verde) y venta (punto rojo) y el scrubber G07 (arrastrar muestra
 * valor y fecha). Se dibuja con M04 al aparecer y al cambiar de rango.
 */
export function AreaChart<R extends string>({
  data,
  formatValue,
  accessibilityLabel,
  height = 200,
  tone = 'auto',
  markers = [],
  ranges,
  range,
  onRangeChange,
  rangeLabel,
  onScrub,
  style,
  testID,
}: AreaChartProps<R>) {
  const { theme } = useUnistyles();
  const { width, onLayout } = useMeasuredWidth();
  const values = data.map((point) => point.value);
  const color = useChartColor(tone, trendOf(values));
  const id = `area-${useId().replace(/[^\w-]/g, '')}`;

  const { domain, ticks } = niceTicks(extentOf(values), Y_TICKS);
  const box = plotBox(width, height, INSETS);
  const points = seriesPoints(values, box, domain);
  const y = linear(domain, [box.y + box.height, box.y]);
  const length = pathLength(points);
  const { gesture, index } = useScrubber(
    points.map((p) => p.x),
    onScrub,
  );
  const { progress, areaOpacity } = useDrawProgress({ trigger: `${range ?? ''}:${data.length}` });

  const lineProps = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - progress.get()) }));
  const areaProps = useAnimatedProps(() => ({ opacity: areaOpacity.get() }));

  const grid = withAlpha(theme.colors.inkSubtle, 0.25);
  const selected = index === null ? undefined : points[index];
  const selectedPoint = index === null ? undefined : data[index];

  return (
    <View style={[styles.root, style]} testID={testID}>
      {ranges && range !== undefined && onRangeChange ? (
        <SegmentedControl
          accessibilityLabel={rangeLabel ?? accessibilityLabel}
          options={ranges}
          value={range}
          onChange={onRangeChange}
          fullWidth
        />
      ) : null}
      <GestureDetector gesture={gesture}>
        <View
          accessible
          accessibilityRole="image"
          accessibilityLabel={accessibilityLabel}
          onLayout={onLayout}
          style={styles.plot(height)}
        >
          {width > 0 ? (
            <Svg width={width} height={height}>
              <Defs>
                <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset={0} stopColor={color} stopOpacity={0.35} />
                  <Stop offset={1} stopColor={color} stopOpacity={0} />
                </LinearGradient>
              </Defs>
              {ticks.map((tick) => (
                <Line
                  key={tick}
                  x1={box.x}
                  x2={box.x + box.width}
                  y1={y(tick)}
                  y2={y(tick)}
                  stroke={grid}
                  strokeWidth={1}
                  strokeDasharray="3 5"
                />
              ))}
              <AnimatedPath
                d={areaPath(points, box.y + box.height)}
                fill={`url(#${id})`}
                animatedProps={areaProps}
              />
              <AnimatedPath
                d={linePath(points)}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={length}
                animatedProps={lineProps}
              />
              {markers.map((marker) => {
                const point = points[marker.index];
                if (!point) return null;
                return (
                  <Circle
                    key={`${marker.kind}-${marker.index.toString()}`}
                    cx={point.x}
                    cy={point.y}
                    r={5}
                    fill={marker.kind === 'buy' ? theme.colors.gain : theme.colors.loss}
                    stroke={theme.colors.bg}
                    strokeWidth={2}
                  />
                );
              })}
              {selected ? (
                <>
                  <Line
                    x1={selected.x}
                    x2={selected.x}
                    y1={box.y}
                    y2={box.y + box.height}
                    stroke={theme.colors.inkMuted}
                    strokeWidth={1}
                  />
                  <Circle
                    cx={selected.x}
                    cy={selected.y}
                    r={6}
                    fill={color}
                    stroke={theme.colors.bg}
                    strokeWidth={2}
                  />
                </>
              ) : null}
            </Svg>
          ) : null}
          {/* Valores de las líneas guía, arriba de cada una a la izquierda. */}
          {width > 0
            ? ticks.map((tick) => (
                <Text key={tick} variant="caption" tone="subtle" style={styles.tickLabel(y(tick))}>
                  {formatValue(tick)}
                </Text>
              ))
            : null}
          <View style={styles.xLabels} importantForAccessibility="no-hide-descendants">
            <Text variant="caption" tone="subtle">
              {data[0]?.label ?? ''}
            </Text>
            <Text variant="caption" tone="subtle">
              {data.at(-1)?.label ?? ''}
            </Text>
          </View>
          {selected && selectedPoint ? (
            <View
              pointerEvents="none"
              accessibilityLiveRegion="polite"
              style={styles.tooltip(selected.x, width)}
            >
              <Text variant="numM">{formatValue(selectedPoint.value)}</Text>
              <Text variant="caption" tone="muted">
                {selectedPoint.label}
              </Text>
            </View>
          ) : null}
        </View>
      </GestureDetector>
    </View>
  );
}

const TOOLTIP_WIDTH = 132;

const styles = StyleSheet.create((theme) => ({
  root: {
    gap: theme.space[3],
  },
  plot: (height: number) => ({
    height,
    width: '100%',
  }),
  tickLabel: (y: number) => ({
    position: 'absolute',
    left: 0,
    top: y - 18,
  }),
  xLabels: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // El globo sigue al punto pero no se sale por los costados.
  tooltip: (x: number, width: number) => ({
    position: 'absolute',
    top: 0,
    left: Math.min(Math.max(x - TOOLTIP_WIDTH / 2, 0), Math.max(width - TOOLTIP_WIDTH, 0)),
    width: TOOLTIP_WIDTH,
    alignItems: 'center',
    paddingVertical: theme.space[1],
    borderRadius: theme.radius.s,
    borderWidth: 1,
    borderColor: theme.glass.card.border,
    backgroundColor: theme.glass.solidFallback,
  }),
}));
