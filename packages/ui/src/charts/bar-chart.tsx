import { View, type ViewProps } from 'react-native';
import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import Svg, { Line, Path } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { withAlpha } from '../lib/color';
import { Text } from '../primitives/text/text';
import { radius } from '../tokens';

import {
  staggerProgress,
  useChartColor,
  useChartEntrance,
  useMeasuredWidth,
  type ChartTone,
} from './chart-kit';
import { plotBox } from './geometry/scale';
import { barLayout, rectPath, type BarRect } from './geometry/shapes';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export interface BarDatum {
  /** Mes o categoría ya formateados ("Oct", "Comida"). */
  label: string;
  value: number;
  /** Color propio (por ejemplo, el de la categoría); si no, el tono del gráfico. */
  color?: string;
}

export interface BarChartProps extends Pick<ViewProps, 'style' | 'testID'> {
  data: readonly BarDatum[];
  /** Resumen para el lector de pantalla ("Gasto por mes: octubre el más alto, $ 2,1 M"). */
  accessibilityLabel: string;
  /** vertical: comparar meses · horizontal: comparar categorías o activos vs pasivos. */
  orientation?: 'vertical' | 'horizontal';
  /** Tono de las barras positivas; las negativas van en `loss`. */
  tone?: Exclude<ChartTone, 'auto'>;
  /** Muestra el valor de cada barra (formateado por la pantalla). */
  formatValue?: (value: number) => string;
  /** Alto en vertical; en horizontal sale de la cantidad de filas. */
  height?: number;
}

const LABEL_HEIGHT = 20;
const ROW_HEIGHT = 36;
const LABEL_WIDTH = 96;
const VALUE_WIDTH = 88;

/**
 * G04 · BarChart: barras verticales u horizontales con la línea del 0 (los negativos van del otro
 * lado y en rojo). Crecen escalonadas con M05.
 */
export function BarChart({
  data,
  accessibilityLabel,
  orientation = 'vertical',
  tone = 'primary',
  formatValue,
  height = 180,
  style,
  testID,
}: BarChartProps) {
  const { theme } = useUnistyles();
  const { width, onLayout } = useMeasuredWidth();
  const color = useChartColor(tone);
  const horizontal = orientation === 'horizontal';
  const chartHeight = horizontal ? data.length * ROW_HEIGHT : height;
  const insets = horizontal
    ? { top: 0, right: formatValue ? VALUE_WIDTH : 0, bottom: 0, left: LABEL_WIDTH }
    : { top: formatValue ? LABEL_HEIGHT : 0, right: 0, bottom: LABEL_HEIGHT, left: 0 };
  const box = plotBox(width, chartHeight, insets);
  const { bars, zero } = barLayout(
    data.map((d) => d.value),
    box,
    orientation,
  );
  const progress = useChartEntrance(data.map((d) => d.value).join());

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      onLayout={onLayout}
      style={[styles.root(chartHeight), style]}
      testID={testID}
    >
      {width > 0 ? (
        <>
          <Svg width={width} height={chartHeight}>
            {data.map((datum, i) => {
              const bar = bars[i];
              if (!bar) return null;
              return (
                <Bar
                  key={datum.label}
                  bar={bar}
                  zero={zero}
                  horizontal={horizontal}
                  index={i}
                  count={bars.length}
                  progress={progress}
                  color={bar.negative ? theme.colors.loss : (datum.color ?? color)}
                />
              );
            })}
            <Line
              x1={horizontal ? zero : box.x}
              x2={horizontal ? zero : box.x + box.width}
              y1={horizontal ? box.y : zero}
              y2={horizontal ? box.y + box.height : zero}
              stroke={withAlpha(theme.colors.inkSubtle, 0.5)}
              strokeWidth={1}
            />
          </Svg>
          {bars.map((bar, i) => {
            const datum = data[i];
            if (!datum) return null;
            return horizontal ? (
              <View key={datum.label} style={styles.row(bar.y, bar.height)}>
                <Text variant="caption" tone="muted" numberOfLines={1} style={styles.rowLabel}>
                  {datum.label}
                </Text>
                {formatValue ? (
                  <Text variant="numM" style={styles.rowValue}>
                    {formatValue(datum.value)}
                  </Text>
                ) : null}
              </View>
            ) : (
              <View key={datum.label} style={styles.column(bar.x, bar.width)}>
                {formatValue ? (
                  <Text variant="caption" style={styles.columnValue(bar.y)} numberOfLines={1}>
                    {formatValue(datum.value)}
                  </Text>
                ) : null}
                <Text variant="caption" tone="muted" numberOfLines={1} style={styles.columnLabel}>
                  {datum.label}
                </Text>
              </View>
            );
          })}
        </>
      ) : null}
    </View>
  );
}

function Bar({
  bar,
  zero,
  horizontal,
  index,
  count,
  progress,
  color,
}: {
  bar: BarRect;
  zero: number;
  horizontal: boolean;
  index: number;
  count: number;
  progress: SharedValue<number>;
  color: string;
}) {
  const r = Math.min(radius.xs / 2, horizontal ? bar.height / 2 : bar.width / 2);
  // Crece desde la línea del 0 hacia su valor.
  const animatedProps = useAnimatedProps(() => {
    const t = staggerProgress(progress.get(), index, count);
    if (horizontal) {
      const w = bar.width * t;
      return { d: rectPath(bar.negative ? zero - w : zero, bar.y, w, bar.height, r) };
    }
    const h = bar.height * t;
    return { d: rectPath(bar.x, bar.negative ? zero : zero - h, bar.width, h, r) };
  });
  return (
    <AnimatedPath
      d={rectPath(bar.x, bar.y, bar.width, bar.height, r)}
      fill={color}
      animatedProps={animatedProps}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  root: (height: number) => ({
    width: '100%',
    height,
  }),
  // Vertical: etiqueta debajo de cada barra y su valor encima.
  column: (x: number, width: number) => ({
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: x - theme.space[2],
    width: width + theme.space[4],
  }),
  columnValue: (y: number) => ({
    position: 'absolute',
    top: y - LABEL_HEIGHT,
    left: 0,
    right: 0,
    textAlign: 'center',
  }),
  columnLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  // Horizontal: etiqueta a la izquierda y valor a la derecha de cada fila.
  row: (y: number, height: number) => ({
    position: 'absolute',
    left: 0,
    right: 0,
    top: y,
    height,
    flexDirection: 'row',
    alignItems: 'center',
  }),
  rowLabel: {
    width: LABEL_WIDTH - theme.space[2],
  },
  rowValue: {
    marginLeft: 'auto',
    width: VALUE_WIDTH,
    textAlign: 'right',
  },
}));
