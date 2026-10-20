import { useEffect, useId, useRef } from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useReduceMotion } from '../../motion/accessibility-preferences';
import { springConfig, timingConfig } from '../../motion/easing';
import { triggerHaptic } from '../../motion/haptics';
import {
  ICON_STROKE_WIDTH,
  MODULE_ICON_MIN_SIZE,
  modulePalettes,
  spring,
  timing,
  type ModuleId,
} from '../../tokens';
import { moduleGlyphParts, moduleIconParts, type ModuleIconTone } from '../module-icon';

import { SvgPartsView } from './svg-parts-view';

/** En el conmutador de módulos: el activo crece con halo; los demás quedan al 85 %. */
export type ModuleIconState = 'default' | 'active' | 'inactive';

export interface ModuleIconProps extends Pick<ViewProps, 'style' | 'testID'> {
  moduleId: ModuleId;
  /** Lado en px (por defecto 40). Debajo de 22 px se dibuja solo el glifo. */
  size?: number;
  state?: ModuleIconState;
  /** Por defecto, el tema activo; `mono` para la silueta de un color. */
  tone?: ModuleIconTone;
  /** Nombre del módulo (`modules.<id>`). Sin él, el ícono es decorativo. */
  accessibilityLabel?: string;
}

const ACTIVE_SCALE = 1.12;
const INACTIVE_OPACITY = 0.85;
/** El halo sobresale un 40 % por cada lado. */
const HALO_RATIO = 1.8;
/**
 * Dónde termina el ícono dentro del halo (radio del ícono / radio del halo). El degradado se
 * mantiene fuerte hasta ahí y se desvanece hacia afuera: antes caía desde el centro y en el borde
 * visible quedaba al ~15 %, casi no se notaba (F1.9).
 */
const HALO_ICON_EDGE = 1 / HALO_RATIO;

/**
 * BR02 · Ícono de módulo (§11.5). Al pasar a `active` corre M22: escala 1,12 con resorte, halo del
 * color del módulo en 300 ms y háptica de selección.
 */
export function ModuleIcon({
  moduleId,
  size = 40,
  state = 'default',
  tone,
  accessibilityLabel,
  style,
  testID,
}: ModuleIconProps) {
  const { theme } = useUnistyles();
  const reduceMotion = useReduceMotion();
  const id = `module-${useId().replace(/[^\w-]/g, '')}`;
  const resolvedTone = tone ?? theme.scheme;
  const color = resolvedTone === 'mono' ? '#FFFFFF' : modulePalettes[moduleId][resolvedTone];

  const active = state === 'active';
  const scale = useSharedValue(active ? ACTIVE_SCALE : 1);
  const halo = useSharedValue(active ? 1 : 0);
  const previousRef = useRef(state);

  useEffect(() => {
    const becameActive = active && previousRef.current !== 'active';
    previousRef.current = state;
    if (becameActive) triggerHaptic('selection');
    const scaleTarget = active ? ACTIVE_SCALE : 1;
    const haloTarget = active ? 1 : 0;
    scale.set(
      reduceMotion ? scaleTarget : withSpring(scaleTarget, springConfig(spring.moduleActive)),
    );
    halo.set(
      reduceMotion
        ? haloTarget
        : withTiming(haloTarget, timingConfig(timing.moduleHalo, 'power2Out')),
    );
  }, [active, state, reduceMotion, scale, halo]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const haloStyle = useAnimatedStyle(() => ({ opacity: halo.get() }));

  const small = size < MODULE_ICON_MIN_SIZE;
  const parts = small
    ? moduleGlyphParts(moduleId, color, ICON_STROKE_WIDTH)
    : moduleIconParts(moduleId, resolvedTone, id);
  const haloSize = size * HALO_RATIO;
  const haloId = `${id}-halo`;

  const label = accessibilityLabel
    ? { accessible: true, accessibilityRole: 'image' as const, accessibilityLabel }
    : {
        accessibilityElementsHidden: true,
        importantForAccessibility: 'no-hide-descendants' as const,
      };

  return (
    <View {...label} style={[styles.box(size, state === 'inactive'), style]} testID={testID}>
      <Animated.View pointerEvents="none" style={[styles.halo(size, haloSize), haloStyle]}>
        <Svg width={haloSize} height={haloSize}>
          <Defs>
            <RadialGradient id={haloId} cx="50%" cy="50%" r="50%">
              <Stop offset={0} stopColor={color} stopOpacity={0.55} />
              <Stop offset={HALO_ICON_EDGE} stopColor={color} stopOpacity={0.45} />
              <Stop offset={1} stopColor={color} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={haloSize / 2} cy={haloSize / 2} r={haloSize / 2} fill={`url(#${haloId})`} />
        </Svg>
      </Animated.View>
      <Animated.View style={iconStyle}>
        <Svg width={size} height={size} viewBox={small ? '0 0 24 24' : '0 0 200 200'}>
          <SvgPartsView parts={parts} />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: (size: number, inactive: boolean) => ({
    width: size,
    height: size,
    opacity: inactive ? INACTIVE_OPACITY : 1,
  }),
  halo: (size: number, haloSize: number) => ({
    position: 'absolute',
    top: (size - haloSize) / 2,
    left: (size - haloSize) / 2,
    width: haloSize,
    height: haloSize,
  }),
});
