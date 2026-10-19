import { View, type ViewProps } from 'react-native';
import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import Svg, { G, Path } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { weekStartOf, type IsoDay } from '../lib/calendar';
import { withAlpha } from '../lib/color';
import type { NumberLocale } from '../lib/format-number';
import { Text } from '../primitives/text/text';

import {
  SHOWCASE,
  staggerProgress,
  useChartColor,
  useChartEntrance,
  useMeasuredWidth,
  type ChartTone,
} from './chart-kit';
import { heatmapCells, rectPath, type HeatCell } from './geometry/shapes';

const AnimatedG = Animated.createAnimatedComponent(G);

export interface HeatmapCalendarProps extends Pick<ViewProps, 'style' | 'testID'> {
  /** Primer y último día (`YYYY-MM-DD`), incluidos. */
  start: IsoDay;
  end: IsoDay;
  /** Valor de cada día (hábitos cumplidos, gasto); los que faltan van vacíos. */
  values: Readonly<Record<IsoDay, number>>;
  /** Resumen para el lector de pantalla ("Leer: 96 de 120 días cumplidos"). */
  accessibilityLabel: string;
  tone?: Exclude<ChartTone, 'auto'>;
  locale?: NumberLocale;
  /** Leyenda "Menos ▢▢▢▢ Más" (textos traducidos). */
  legend?: { less: string; more: string };
}

const GAP = 3;
const MAX_CELL = 16;
const ROWS = 7;

/**
 * G06 · HeatmapCalendar: cuadrícula de días (una columna por semana) con 5 intensidades del tono.
 * Las columnas aparecen escalonadas de izquierda a derecha. La semana empieza según el locale.
 */
export function HeatmapCalendar({
  start,
  end,
  values,
  accessibilityLabel,
  tone = 'gain',
  locale = 'es-CO',
  legend,
  style,
  testID,
}: HeatmapCalendarProps) {
  const { theme } = useUnistyles();
  const { width, onLayout } = useMeasuredWidth();
  const color = useChartColor(tone);
  const { cells, columns } = heatmapCells(start, end, values, weekStartOf(locale));
  const cell = Math.min(MAX_CELL, columns > 0 ? (width - GAP * (columns - 1)) / columns : 0);
  const height = cell * ROWS + GAP * (ROWS - 1);
  const progress = useChartEntrance(`${start}:${end}`, SHOWCASE);

  // Intensidades 0–4: vacío y cuatro niveles del tono (colores reales, no variables CSS).
  const levels = [
    withAlpha(theme.colors.inkSubtle, 0.18),
    withAlpha(color, 0.3),
    withAlpha(color, 0.55),
    withAlpha(color, 0.8),
    color,
  ];
  // Una columna por semana; su clave es el primer día que tiene.
  const byColumn: { key: string; column: number; cells: HeatCell[] }[] = [];
  for (const c of cells) {
    const last = byColumn.at(-1);
    if (last?.column === c.column) last.cells.push(c);
    else byColumn.push({ key: c.iso, column: c.column, cells: [c] });
  }

  return (
    <View style={[styles.root, style]} testID={testID}>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
        onLayout={onLayout}
        style={styles.grid(height)}
      >
        {width > 0 && cell > 0 ? (
          <Svg width={width} height={height}>
            {byColumn.map((group) => (
              <HeatColumn
                key={group.key}
                cells={group.cells}
                column={group.column}
                columns={columns}
                cell={cell}
                levels={levels}
                progress={progress}
              />
            ))}
          </Svg>
        ) : null}
      </View>
      {legend ? (
        <View style={styles.legend} importantForAccessibility="no-hide-descendants">
          <Text variant="caption" tone="muted">
            {legend.less}
          </Text>
          {levels.map((fill) => (
            <View key={fill} style={styles.swatch(fill)} />
          ))}
          <Text variant="caption" tone="muted">
            {legend.more}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function HeatColumn({
  cells,
  column,
  columns,
  cell,
  levels,
  progress,
}: {
  cells: readonly HeatCell[];
  column: number;
  columns: number;
  cell: number;
  levels: readonly string[];
  progress: SharedValue<number>;
}) {
  const animatedProps = useAnimatedProps(() => ({
    opacity: staggerProgress(progress.get(), column, columns),
  }));
  return (
    <AnimatedG animatedProps={animatedProps}>
      {cells.map((c) => (
        <Path
          key={c.iso}
          d={rectPath(
            column * (cell + GAP),
            c.row * (cell + GAP),
            cell,
            cell,
            Math.min(3, cell / 4),
          )}
          fill={levels[c.level]}
        />
      ))}
    </AnimatedG>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    gap: theme.space[2],
  },
  grid: (height: number) => ({
    width: '100%',
    height,
  }),
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: theme.space[1],
  },
  swatch: (fill: string) => ({
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: fill,
  }),
}));
