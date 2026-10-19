import { useId } from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { useDrawProgress } from '../motion/use-draw-progress';

import { useChartColor, useMeasuredWidth, type ChartTone } from './chart-kit';
import { areaPath, linePath, pathLength, seriesPoints, trendOf } from './geometry/line';
import { plotBox } from './geometry/scale';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** Grosor del trazo; el margen evita que la curva se corte arriba y abajo. */
const STROKE = 2;

export interface SparklineProps extends Pick<ViewProps, 'style' | 'testID'> {
  values: readonly number[];
  /** Resumen para el lector de pantalla ("Subió 4 % en el mes"). */
  accessibilityLabel: string;
  /** `auto` (por defecto): verde si termina más alto que empieza, rojo si más bajo. */
  tone?: ChartTone;
  height?: number;
  /** Ancho fijo; sin él ocupa el del contenedor. */
  width?: number;
  /** Relleno suave bajo la línea. */
  area?: boolean;
  /** Se dibuja al aparecer (M04). Apagado por defecto: en listas hay muchas. */
  animate?: boolean;
}

/** G01 · Sparkline: línea sin ejes para tarjetas y filas. */
export function Sparkline({
  values,
  accessibilityLabel,
  tone = 'auto',
  height = 32,
  width: fixedWidth,
  area = false,
  animate = false,
  style,
  testID,
}: SparklineProps) {
  const { width, onLayout } = useMeasuredWidth(fixedWidth);
  const color = useChartColor(tone, trendOf(values));
  const id = `spark-${useId().replace(/[^\w-]/g, '')}`;
  const box = plotBox(width, height, { top: STROKE, right: STROKE, bottom: STROKE, left: STROKE });
  const points = seriesPoints(values, box);
  const length = pathLength(points);
  const { progress, areaOpacity } = useDrawProgress({ trigger: values.join() });

  const lineProps = useAnimatedProps(() => ({
    strokeDashoffset: animate ? length * (1 - progress.get()) : 0,
  }));
  const areaProps = useAnimatedProps(() => ({ opacity: animate ? areaOpacity.get() : 1 }));

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      onLayout={onLayout}
      style={[{ height, width: fixedWidth ?? '100%' }, style]}
      testID={testID}
    >
      {width > 0 ? (
        <Svg width={width} height={height}>
          {area ? (
            <>
              <Defs>
                <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset={0} stopColor={color} stopOpacity={0.3} />
                  <Stop offset={1} stopColor={color} stopOpacity={0} />
                </LinearGradient>
              </Defs>
              <AnimatedPath
                d={areaPath(points, box.y + box.height)}
                fill={`url(#${id})`}
                animatedProps={areaProps}
              />
            </>
          ) : null}
          <AnimatedPath
            d={linePath(points)}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={animate ? length : undefined}
            animatedProps={lineProps}
          />
        </Svg>
      ) : null}
    </View>
  );
}
