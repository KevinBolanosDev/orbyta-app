import { useEffect } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { useReduceMotion } from '../../motion/accessibility-preferences';
import { springConfig } from '../../motion/easing';
import { usePress } from '../../motion/use-press';
import { componentSize, holoGradient, spring } from '../../tokens';
import { GradientFill } from '../gradient-fill/gradient-fill';
import { Icon, type IconComponent } from '../icon/icon';

/** Al expandirse, el ícono gira 45° (un "+" pasa a ser "×"). */
const EXPANDED_ROTATION = 45;

export interface FabProps extends Pick<PressableProps, 'onPress' | 'testID' | 'style'> {
  icon: IconComponent;
  /** Obligatorio: qué hace el botón ("Nuevo gasto"). */
  accessibilityLabel: string;
  /** Si abrió su menú de acciones (W04): el ícono gira con el resorte de recompensa (M07). */
  expanded?: boolean;
}

/**
 * P32 · FAB: acción principal del módulo, 56 × 56 con el degradado holo y glow. Presión M02 con
 * háptica media. No se posiciona solo: lo ubica el layout de la pantalla, abajo a la derecha (F2).
 */
export function Fab({ icon, accessibilityLabel, expanded, onPress, style, testID }: FabProps) {
  const reduceMotion = useReduceMotion();
  const { animatedStyle, onPressIn, onPressOut } = usePress({ haptic: 'medium' });
  const rotation = useSharedValue(expanded ? EXPANDED_ROTATION : 0);

  useEffect(() => {
    const target = expanded ? EXPANDED_ROTATION : 0;
    rotation.set(reduceMotion ? target : withSpring(target, springConfig(spring.reward)));
  }, [expanded, reduceMotion, rotation]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.get()}deg` }] }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={expanded === undefined ? {} : { expanded }}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={style}
      testID={testID}
    >
      <Animated.View style={[styles.body, animatedStyle]}>
        <GradientFill gradient={holoGradient} />
        <Animated.View style={iconStyle}>
          <Icon icon={icon} size="nav" color={holoGradient.ink} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  body: {
    width: componentSize.fab,
    height: componentSize.fab,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: theme.radius.pill,
    boxShadow: theme.elevation.glow,
  },
}));
