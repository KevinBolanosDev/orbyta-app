import { useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedProps, useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import {
  GlassSurface,
  stagger,
  Text,
  useCountUp,
  useDrawProgress,
  useEnter,
  usePress,
  useProgressFill,
} from '@/shared/ui';

// Demos del catálogo de movimiento (§4.3). Cada una usa solo el hook de @repo/ui que muestra.

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** Marco de una demo: título arriba y la animación debajo. */
export function MotionDemo({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.demo}>
      <Text variant="caption" tone="muted">
        {title}
      </Text>
      {children}
    </View>
  );
}

const ENTER_ROWS = [0, 1, 2, 3];

/** M01: filas que entran escalonadas. Se repite al cambiar la `key` del padre. */
export function EnterDemo() {
  return (
    <View style={styles.stack}>
      {ENTER_ROWS.map((index) => (
        <EnterRow key={index} index={index} />
      ))}
    </View>
  );
}

function EnterRow({ index }: { index: number }) {
  const enter = useEnter({ index, step: stagger.list });
  return <Animated.View style={[styles.row, enter]} />;
}

/** M02: escala con resorte y háptica ligera. */
export function PressDemo({ label }: { label: string }) {
  const { animatedStyle, onPressIn, onPressOut } = usePress();
  const [presses, setPresses] = useState(0);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={() => {
        setPresses((count) => count + 1);
      }}
    >
      <Animated.View style={[styles.pressTile, animatedStyle]}>
        <Text variant="numM" tone="onPrimary">
          {presses}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

/** M03: la cifra cuenta hasta el valor nuevo cada vez que se repite. */
export function CountUpDemo({ replay }: { replay: number }) {
  const target = replay % 2 === 0 ? 48_250_000 : 52_900_000;
  const shown = useCountUp(target);
  return <Text variant="numL">{`$ ${Math.round(shown).toLocaleString('es-CO')}`}</Text>;
}

// Línea de ejemplo en una caja de 240 × 80.
const LINE_POINTS: readonly (readonly [number, number])[] = [
  [0, 64],
  [40, 52],
  [80, 58],
  [120, 30],
  [160, 38],
  [200, 14],
  [240, 20],
];
const LINE_PATH = LINE_POINTS.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
const AREA_PATH = `${LINE_PATH} L 240 80 L 0 80 Z`;
const LINE_LENGTH = LINE_POINTS.slice(1).reduce((total, [x, y], i) => {
  const [px, py] = LINE_POINTS[i] ?? [x, y];
  return total + Math.hypot(x - px, y - py);
}, 0);

/** M04: el trazo se dibuja y el área aparece al final. */
export function DrawDemo({ replay }: { replay: number }) {
  const { theme } = useUnistyles();
  const { progress, areaOpacity } = useDrawProgress({ trigger: replay });
  const lineProps = useAnimatedProps(() => ({
    strokeDashoffset: LINE_LENGTH * (1 - progress.get()),
  }));
  const areaProps = useAnimatedProps(() => ({ fillOpacity: areaOpacity.get() * 0.25 }));
  return (
    <Svg width={240} height={80} viewBox="0 0 240 80">
      <AnimatedPath d={AREA_PATH} fill={theme.colors.primary} animatedProps={areaProps} />
      <AnimatedPath
        d={LINE_PATH}
        fill="none"
        stroke={theme.colors.primary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={LINE_LENGTH}
        animatedProps={lineProps}
      />
    </Svg>
  );
}

/** M05: barra que se llena hasta el valor nuevo. */
export function ProgressDemo({ replay }: { replay: number }) {
  const progress = useProgressFill(replay % 2 === 0 ? 0.72 : 0.35);
  const fill = useAnimatedStyle(() => ({ width: `${progress.get() * 100}%` }));
  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, fill]} />
    </View>
  );
}

/** M08: barrido del reflejo sobre una tarjeta; se repite con `replay`. */
export function SheenDemo({ replay, label }: { replay: number; label: string }) {
  return (
    <GlassSurface holo="manual" holoTrigger={replay} style={styles.sheenCard}>
      <Text variant="titleS">{label}</Text>
    </GlassSurface>
  );
}

const styles = StyleSheet.create((theme) => ({
  demo: {
    flexGrow: 1,
    flexBasis: 260,
    gap: theme.space[3],
    padding: theme.space[5],
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.glass.card.border,
    backgroundColor: theme.glass.card.fill,
  },
  stack: {
    gap: theme.space[2],
  },
  row: {
    height: theme.space[4],
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.primary,
  },
  pressTile: {
    width: theme.space[16] * 2,
    height: theme.space[16],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.l,
    backgroundColor: theme.colors.primary,
    boxShadow: theme.elevation.glow,
  },
  track: {
    height: theme.space[3],
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
    backgroundColor: theme.glass.card.border,
  },
  fill: {
    height: '100%',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  sheenCard: {
    padding: theme.space[6],
  },
}));
