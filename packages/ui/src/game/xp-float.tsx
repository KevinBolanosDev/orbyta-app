import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react';
import { AccessibilityInfo, View, type ViewProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useReduceMotion } from '../motion/accessibility-preferences';
import { timingConfig } from '../motion/easing';
import { Text } from '../primitives/text/text';
import { timing } from '../tokens';

import { xpFloatFrame } from './game-math';

export interface XPFloatHandle {
  /** Lanza un "+XP" desde el punto donde está el componente ("+5 XP"). */
  show: (label: string) => void;
}

export interface XPFloatProps extends Pick<ViewProps, 'style' | 'testID'> {
  ref?: Ref<XPFloatHandle>;
  /** Anunciar el texto al lector de pantalla (por defecto sí). */
  announce?: boolean;
}

interface FloatEntry {
  id: number;
  label: string;
}

/**
 * X07 · XPFloat: "+5 XP" que sube 36 px y se desvanece en 700 ms (`power2.out`) desde el punto de
 * la acción. Se coloca encima del botón o la fila que da la XP (sin ocupar lugar ni tocar) y se
 * lanza con `ref.current.show('+5 XP')`; varios seguidos se apilan. Con "reducir movimiento" no
 * sube, solo se desvanece. El texto se anuncia al lector de pantalla.
 */
export function XPFloat({ ref, announce = true, style, testID }: XPFloatProps) {
  const [floats, setFloats] = useState<FloatEntry[]>([]);
  const nextIdRef = useRef(1);

  useImperativeHandle(
    ref,
    () => ({
      show(label) {
        const id = nextIdRef.current;
        nextIdRef.current += 1;
        setFloats((current) => [...current, { id, label }]);
        if (announce) AccessibilityInfo.announceForAccessibility(label);
      },
    }),
    [announce],
  );

  // Estable: si cambiara, la animación de los que ya están subiendo volvería a empezar.
  const remove = useCallback((id: number) => {
    setFloats((current) => current.filter((entry) => entry.id !== id));
  }, []);

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.anchor, style]}
      testID={testID}
    >
      {floats.map((entry) => (
        <FloatingLabel key={entry.id} entry={entry} onDone={remove} />
      ))}
    </View>
  );
}

function FloatingLabel({ entry, onDone }: { entry: FloatEntry; onDone: (id: number) => void }) {
  const { theme } = useUnistyles();
  const reduceMotion = useReduceMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(withTiming(1, timingConfig(timing.xpFloat, 'power2Out')));
    // Se quita con un temporizador (no con el callback de la animación) igual que usePresence.
    const timer = setTimeout(() => {
      onDone(entry.id);
    }, timing.xpFloat);
    return () => {
      clearTimeout(timer);
    };
  }, [entry.id, onDone, progress]);

  const floatStyle = useAnimatedStyle(() => {
    const frame = xpFloatFrame(progress.get(), reduceMotion);
    return { opacity: frame.opacity, transform: [{ translateY: frame.translateY }] };
  });

  return (
    <Animated.View style={[styles.float, floatStyle]}>
      <Text variant="numM" style={styles.label(theme.colors.primary)}>
        {entry.label}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  // Punto de anclaje: arriba al centro del padre. El texto se centra sobre él.
  anchor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 0,
    alignItems: 'center',
    overflow: 'visible',
  },
  float: {
    position: 'absolute',
    bottom: 0,
  },
  label: (color: string) => ({
    color,
    fontFamily: theme.font.mono700,
    textShadowColor: theme.colors.glow,
    textShadowRadius: 8,
  }),
}));
