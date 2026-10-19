import { useEffect, useRef, type ComponentRef, type ReactNode } from 'react';
import { Platform, Pressable, View, type PointerEvent, type ViewProps } from 'react-native';
import Animated, {
  SensorType,
  useAnimatedReaction,
  useAnimatedSensor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { useReduceMotion } from '../motion/accessibility-preferences';
import { springConfig, timingConfig } from '../motion/easing';
import type { SheenMode } from '../motion/use-sheen';
import { GradientFill } from '../primitives/gradient-fill/gradient-fill';
import { HoloSheen } from '../primitives/holo-sheen/holo-sheen';
import { IconColorProvider } from '../primitives/icon/icon';
import { duration, holoGradient, spring } from '../tokens';

import { tiltFromPoint, tiltFromRotation } from './game-math';

export interface HoloCardProps extends Pick<ViewProps, 'style' | 'testID'> {
  /** Contenido de la carta; los textos van con `tone="onHolo"` (los íconos ya la heredan). */
  children: ReactNode;
  /** M14: inclinación con el giroscopio (móvil) o el cursor (web). Por defecto sí. */
  tilt?: boolean;
  /** M08: `manual` barre al aparecer; `idle` además cada 6 s (una superficie a la vez). */
  sheen?: SheenMode;
  /** Abrir la meta. Sin él, la carta no es un botón. */
  onPress?: () => void;
  /** Nombre accesible si es un botón ("Fondo de emergencia, 64 %"). */
  accessibilityLabel?: string;
}

/** Perspectiva del giro 3D, en px: más chica exagera la profundidad. */
const PERSPECTIVE = 800;

/**
 * X06 · HoloCard: carta con el degradado holo para metas destacadas. Se inclina hasta ±8° (M14):
 * con el giroscopio en el teléfono y siguiendo el cursor en web (`power2.out`), y vuelve al centro
 * con el resorte de recompensa (`elastic.out`). La cruza el reflejo M08. Con "reducir movimiento"
 * no se inclina y el reflejo queda quieto.
 */
export function HoloCard({
  children,
  tilt = true,
  sheen = 'manual',
  onPress,
  accessibilityLabel,
  style,
  testID,
}: HoloCardProps) {
  const reduceMotion = useReduceMotion();
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const cardRef = useRef<ComponentRef<typeof View>>(null);
  const rectRef = useRef({ left: 0, top: 0, width: 0, height: 0 });
  const tilting = tilt && !reduceMotion;
  const gyro = tilting && Platform.OS !== 'web';
  const pointer = tilting && Platform.OS === 'web';

  // Al apagar la inclinación, la carta vuelve al centro.
  useEffect(() => {
    if (tilting) return;
    rotateX.set(withSpring(0, springConfig(spring.reward)));
    rotateY.set(withSpring(0, springConfig(spring.reward)));
  }, [rotateX, rotateY, tilting]);

  const tiltStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: PERSPECTIVE },
      { rotateX: `${rotateX.get()}deg` },
      { rotateY: `${rotateY.get()}deg` },
    ],
  }));

  const pointerHandlers = pointer
    ? {
        onPointerEnter: () => {
          cardRef.current?.measureInWindow((left, top, width, height) => {
            rectRef.current = { left, top, width, height };
          });
        },
        onPointerMove: (event: PointerEvent) => {
          // En web `measureInWindow` usa la ventana visible, igual que clientX/Y.
          const { left, top, width, height } = rectRef.current;
          const next = tiltFromPoint(
            event.nativeEvent.clientX - left,
            event.nativeEvent.clientY - top,
            width,
            height,
          );
          const ease = timingConfig(duration.fast, 'power2Out');
          rotateX.set(withTiming(next.rotateX, ease));
          rotateY.set(withTiming(next.rotateY, ease));
        },
        onPointerLeave: () => {
          rotateX.set(withSpring(0, springConfig(spring.reward)));
          rotateY.set(withSpring(0, springConfig(spring.reward)));
        },
      }
    : {};

  const card = (
    <Animated.View style={[styles.card, tiltStyle]}>
      <GradientFill gradient={holoGradient} />
      <IconColorProvider color={holoGradient.ink}>
        <View style={styles.content}>{children}</View>
      </IconColorProvider>
      <HoloSheen mode={sheen} />
    </Animated.View>
  );

  return (
    <View ref={cardRef} style={style} testID={testID} {...pointerHandlers}>
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          {...(accessibilityLabel ? { accessibilityLabel } : {})}
          onPress={onPress}
        >
          {card}
        </Pressable>
      ) : (
        card
      )}
      {gyro ? <GyroTilt rotateX={rotateX} rotateY={rotateY} /> : null}
    </View>
  );
}

/** Cuánto sigue el reposo al teléfono en cada lectura: si se queda en otra posición, se recentra. */
const REST_DRIFT = 0.02;
/** Suavizado de la inclinación entre lecturas del sensor. */
const SMOOTHING = 0.25;

/**
 * M14 en el teléfono: lee el giroscopio (sensor de rotación de Reanimated, sin dependencias
 * nuevas) y escribe la inclinación. Va en su propio componente para registrar el sensor solo
 * mientras la inclinación está activa.
 */
function GyroTilt({
  rotateX,
  rotateY,
}: {
  rotateX: SharedValue<number>;
  rotateY: SharedValue<number>;
}) {
  const rotation = useAnimatedSensor(SensorType.ROTATION, { interval: 'auto' });
  const rest = useSharedValue<{ pitch: number; roll: number } | null>(null);

  useAnimatedReaction(
    () => rotation.sensor.get(),
    (reading) => {
      const previous = rest.get();
      if (!previous) {
        rest.set({ pitch: reading.pitch, roll: reading.roll });
        return;
      }
      const next = {
        pitch: previous.pitch + (reading.pitch - previous.pitch) * REST_DRIFT,
        roll: previous.roll + (reading.roll - previous.roll) * REST_DRIFT,
      };
      rest.set(next);
      const target = tiltFromRotation(reading.pitch - next.pitch, reading.roll - next.roll);
      rotateX.set(rotateX.get() + (target.rotateX - rotateX.get()) * SMOOTHING);
      rotateY.set(rotateY.get() + (target.rotateY - rotateY.get()) * SMOOTHING);
    },
  );

  return null;
}

const styles = StyleSheet.create((theme) => ({
  card: {
    overflow: 'hidden',
    borderRadius: theme.radius.xl,
    boxShadow: theme.elevation.glow,
  },
  content: {
    padding: theme.layout.cardPadding,
    gap: theme.space[2],
  },
}));
