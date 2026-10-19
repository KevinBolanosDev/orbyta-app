import { View, type ViewProps } from 'react-native';
import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import Svg, { Line, Path } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { SHOWCASE, staggerProgress, useChartEntrance, useMeasuredWidth } from './chart-kit';
import { plotBox } from './geometry/scale';
import { candleLayout, rectPath, type Candle, type CandleShape } from './geometry/shapes';

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export interface CandleChartProps extends Pick<ViewProps, 'style' | 'testID'> {
  candles: readonly Candle[];
  /** Resumen para el lector de pantalla ("AAPL: abrió en 180, cerró en 186, máximo 188"). */
  accessibilityLabel: string;
  height?: number;
}

const INSETS = { top: 8, right: 0, bottom: 8, left: 0 };

/**
 * G03 · CandleChart: velas para el detalle de un instrumento (alterna con G02). Verdes si cierran
 * arriba de la apertura y rojas si cierran abajo; crecen escalonadas desde su centro al aparecer.
 */
export function CandleChart({
  candles,
  accessibilityLabel,
  height = 220,
  style,
  testID,
}: CandleChartProps) {
  const { theme } = useUnistyles();
  const { width, onLayout } = useMeasuredWidth();
  const shapes = candleLayout(candles, plotBox(width, height, INSETS));
  const progress = useChartEntrance(candles.length, SHOWCASE);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      onLayout={onLayout}
      style={[styles.root(height), style]}
      testID={testID}
    >
      {width > 0 ? (
        <Svg width={width} height={height}>
          {shapes.map((shape, i) => (
            <CandleMark
              key={shape.x}
              shape={shape}
              index={i}
              count={shapes.length}
              progress={progress}
              color={shape.up ? theme.colors.gain : theme.colors.loss}
            />
          ))}
        </Svg>
      ) : null}
    </View>
  );
}

function CandleMark({
  shape,
  index,
  count,
  progress,
  color,
}: {
  shape: CandleShape;
  index: number;
  count: number;
  progress: SharedValue<number>;
  color: string;
}) {
  const center = (shape.wickTop + shape.wickBottom) / 2;
  // Mecha y cuerpo crecen en alto desde el centro de la mecha (atributos de SVG, no transformaciones:
  // así se ve igual en web y Android).
  const wickProps = useAnimatedProps(() => {
    const t = staggerProgress(progress.get(), index, count);
    return {
      y1: center + (shape.wickTop - center) * t,
      y2: center + (shape.wickBottom - center) * t,
    };
  });
  const left = shape.x - shape.bodyWidth / 2;
  const bodyProps = useAnimatedProps(() => {
    const t = staggerProgress(progress.get(), index, count);
    return {
      d: rectPath(
        left,
        center + (shape.bodyTop - center) * t,
        shape.bodyWidth,
        shape.bodyHeight * t,
        1,
      ),
      opacity: t,
    };
  });
  return (
    <>
      <AnimatedLine
        x1={shape.x}
        x2={shape.x}
        y1={shape.wickTop}
        y2={shape.wickBottom}
        stroke={color}
        strokeWidth={1}
        animatedProps={wickProps}
      />
      <AnimatedPath
        d={rectPath(left, shape.bodyTop, shape.bodyWidth, shape.bodyHeight, 1)}
        fill={color}
        animatedProps={bodyProps}
      />
    </>
  );
}

const styles = StyleSheet.create({
  root: (height: number) => ({
    width: '100%',
    height,
  }),
});
