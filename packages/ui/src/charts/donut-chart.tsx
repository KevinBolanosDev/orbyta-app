import { useId, useRef, type ComponentRef, type ReactNode } from 'react';
import { Pressable, View, type GestureResponderEvent, type ViewProps } from 'react-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import Svg, { Circle, Defs, G, Mask, Path } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { triggerHaptic } from '../motion/haptics';
import { useDrawProgress } from '../motion/use-draw-progress';

import { donutSlices, sliceAt, slicePath } from './geometry/shapes';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface DonutDatum {
  label: string;
  value: number;
  /** Color propio; si no, el de la categoría en orden (§2.2). */
  color?: string;
}

export interface DonutChartProps extends Pick<ViewProps, 'style' | 'testID'> {
  data: readonly DonutDatum[];
  /** Resumen para el lector de pantalla ("Gasto por categoría: comida 42 %, transporte 18 %…"). */
  accessibilityLabel: string;
  size?: number;
  /** Grosor del anillo. */
  thickness?: number;
  /** Contenido del hueco (la cifra total o la del segmento elegido). */
  children?: ReactNode;
  /** Segmento elegido; tocar uno lo elige y tocar el mismo lo suelta. */
  selected?: number | null;
  onSelect?: (index: number | null) => void;
  /** Texto del segmento para el lector de pantalla al recorrerlos ("Comida, 42 %"). */
  describeSlice?: (index: number) => string;
}

/** Cuánto sobresale el segmento elegido. */
const POP = 6;

/**
 * G05 · DonutChart: composición con hueco para una cifra central. Al aparecer, los segmentos se
 * dibujan en sentido horario (M04, con una máscara que barre el anillo). Los segmentos se tocan: el
 * elegido sobresale y los demás se atenúan. Para el lector de pantalla es ajustable: deslizar arriba
 * o abajo recorre los segmentos.
 */
export function DonutChart({
  data,
  accessibilityLabel,
  size = 200,
  thickness = 28,
  children,
  selected = null,
  onSelect,
  describeSlice,
  style,
  testID,
}: DonutChartProps) {
  const { theme } = useUnistyles();
  const id = `donut-${useId().replace(/[^\w-]/g, '')}`;
  const center = size / 2;
  const outer = center - POP;
  const inner = outer - thickness;
  const slices = donutSlices(data.map((d) => d.value));
  const { progress } = useDrawProgress({ trigger: data.map((d) => d.value).join() });

  // La máscara es un trazo que recorre el anillo de 0 a 360°.
  const sweepRadius = (inner + outer) / 2 + POP / 2;
  const circumference = 2 * Math.PI * sweepRadius;
  const sweepProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.get()),
  }));

  const colorOf = (index: number) =>
    data[index]?.color ?? theme.categories[index % theme.categories.length] ?? theme.colors.primary;

  const areaRef = useRef<ComponentRef<typeof View>>(null);

  const select = (index: number | null) => {
    if (!onSelect) return;
    triggerHaptic('selection');
    onSelect(index === selected ? null : index);
  };

  /**
   * Toque → segmento. Se mide contra la posición del donut en la ventana: en web el evento de presión
   * no trae `locationX`, y los `onPress` de los paths de SVG dejan props desconocidas en el DOM.
   */
  const onPress = (event: GestureResponderEvent) => {
    const touch = event.nativeEvent as unknown as {
      pageX: number;
      pageY: number;
      clientX?: number;
      clientY?: number;
    };
    // En web `measureInWindow` usa la ventana visible (clientX/Y); en nativo coincide con pageX/Y.
    const pointX = touch.clientX ?? touch.pageX;
    const pointY = touch.clientY ?? touch.pageY;
    areaRef.current?.measureInWindow((left: number, top: number) => {
      select(sliceAt(slices, pointX - left - center, pointY - top - center, inner, outer + POP));
    });
  };

  const step = (direction: 1 | -1) => {
    if (!onSelect || slices.length === 0) return;
    const current = selected ?? (direction === 1 ? -1 : 0);
    onSelect((current + direction + slices.length) % slices.length);
  };

  const chart = (
    <Svg width={size} height={size}>
      <Defs>
        <Mask id={id}>
          <AnimatedCircle
            cx={center}
            cy={center}
            r={sweepRadius}
            stroke="#FFFFFF"
            strokeWidth={thickness + POP * 2}
            strokeDasharray={circumference}
            fill="none"
            transform={`rotate(-90 ${center.toString()} ${center.toString()})`}
            animatedProps={sweepProps}
          />
        </Mask>
      </Defs>
      {/* La máscara va en un grupo sin transformar: si compartiera el `translate` de los segmentos,
          su círculo también se correría y solo se vería un cuarto del anillo. */}
      <G mask={`url(#${id})`}>
        <G transform={`translate(${center.toString()} ${center.toString()})`}>
          {slices.map((slice) => {
            const active = selected === slice.index;
            return (
              <Path
                key={data[slice.index]?.label ?? slice.index}
                d={slicePath(slice, inner, active ? outer + POP : outer)}
                fill={colorOf(slice.index)}
                opacity={selected === null || active ? 1 : 0.35}
              />
            );
          })}
        </G>
      </G>
    </Svg>
  );

  return (
    <View
      accessible
      accessibilityRole={onSelect ? 'adjustable' : 'image'}
      accessibilityLabel={accessibilityLabel}
      // `aria-valuetext` para web (RN-web no traduce `accessibilityValue.text`); el otro, nativo.
      {...(selected !== null && describeSlice
        ? {
            accessibilityValue: { text: describeSlice(selected) },
            'aria-valuetext': describeSlice(selected),
          }
        : {})}
      accessibilityActions={onSelect ? [{ name: 'increment' }, { name: 'decrement' }] : undefined}
      onAccessibilityAction={(event) => {
        step(event.nativeEvent.actionName === 'increment' ? 1 : -1);
      }}
      style={[styles.root(size), style]}
      testID={testID}
    >
      {onSelect ? (
        <Pressable ref={areaRef} accessible={false} onPress={onPress} testID="donut-touch">
          {chart}
        </Pressable>
      ) : (
        chart
      )}
      <View pointerEvents="none" style={styles.hole(inner * 2)}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: (size: number) => ({
    width: size,
    height: size,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  hole: (diameter: number) => ({
    position: 'absolute',
    width: diameter,
    height: diameter,
    alignItems: 'center',
    justifyContent: 'center',
  }),
});
