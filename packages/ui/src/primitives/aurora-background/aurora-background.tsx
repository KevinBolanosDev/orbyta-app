import { useEffect, useId } from 'react';
import { View, type DimensionValue, type ViewProps } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { parseColor, toHex } from '../../lib/color';
import { fillParent } from '../../lib/fill-parent';
import { useReduceMotion } from '../../motion/accessibility-preferences';
import { timingConfig } from '../../motion/easing';
import { useAppActive } from '../../motion/use-app-active';
import { useOrbDrift } from '../../motion/use-orb-drift';
import { glassGeometry, type SemanticColors } from '../../tokens';

/** `full` en pantallas normales; `dimmed` (al 50 %) en formularios y detrás de hojas. */
export type AuroraIntensity = 'full' | 'dimmed';

export interface AuroraBackgroundProps extends Pick<ViewProps, 'style' | 'testID'> {
  intensity?: AuroraIntensity;
  /**
   * Detiene la deriva sin moverla de su sitio: la pantalla quedó tapada por otra en la pila de
   * navegación. Reanimated sigue calculando las animaciones aunque no se vean (en Android, la aurora
   * de la pantalla de abajo ocupaba el hilo de UI). La pantalla se lo pasa con su foco (F1.9).
   */
  paused?: boolean;
}

interface Placement {
  top?: DimensionValue;
  bottom?: DimensionValue;
  left?: DimensionValue;
  right?: DimensionValue;
}

type OrbColor = 'orb1' | 'orb2' | 'orb3';

// Primary arriba a la izquierda, accent a la derecha y secondary abajo; salen en parte de la pantalla.
const ORBS: readonly { color: OrbColor; seed: number; size: number; position: Placement }[] = [
  { color: 'orb1', seed: 1, size: 520, position: { top: '-18%', left: '-25%' } },
  { color: 'orb2', seed: 2, size: 440, position: { top: '28%', right: '-30%' } },
  { color: 'orb3', seed: 3, size: 480, position: { bottom: '-22%', left: '5%' } },
];

interface Ribbon {
  color: keyof Pick<SemanticColors, 'primary' | 'gain' | 'accent'>;
  /** Posición vertical y alto de la cortina, respecto a la pantalla. */
  top: DimensionValue;
  height: DimensionValue;
  /** Inclinación en grados. */
  tilt: number;
  /** Deriva horizontal máxima en px. */
  drift: number;
  /** Una ida (la vuelta dura lo mismo), en ms: duraciones distintas para que no vayan sincronizadas. */
  duration: number;
  /** Intensidad del color por tema. */
  alpha: { dark: number; light: number };
}

// Cortinas de aurora: cian, verde y violeta, en la mitad de arriba (como una aurora boreal).
const RIBBONS: readonly Ribbon[] = [
  {
    color: 'primary',
    top: '2%',
    height: '38%',
    tilt: -9,
    drift: 48,
    duration: 13_000,
    alpha: { dark: 0.4, light: 0.2 },
  },
  {
    color: 'gain',
    top: '12%',
    height: '34%',
    tilt: -3,
    drift: 36,
    duration: 17_000,
    alpha: { dark: 0.3, light: 0.16 },
  },
  {
    color: 'accent',
    top: '20%',
    height: '40%',
    tilt: 7,
    drift: 56,
    duration: 21_000,
    alpha: { dark: 0.34, light: 0.18 },
  },
];

// Banda ondulada en una caja de 400 × 120; se estira al tamaño de la cortina.
const RIBBON_PATH =
  'M0,52 C60,22 120,74 200,42 S330,12 400,48 L400,96 C330,70 262,112 200,86 S80,62 0,104 Z';

/**
 * P35 · AuroraBackground: fondo de las pantallas (§3.3). Tres orbes difuminados que derivan (M09) y
 * tres cortinas de aurora que ondulan despacio. Solo se animan transformaciones y opacidad en el hilo
 * de UI, así el SVG no se vuelve a dibujar en cada cuadro. Se pausa con la app en segundo plano y
 * queda quieto con "reducir movimiento". Llena a su contenedor y es decorativo.
 */
export function AuroraBackground({
  intensity = 'full',
  paused = false,
  style,
  testID,
}: AuroraBackgroundProps) {
  const { theme } = useUnistyles();
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.root, style]}
      testID={testID}
    >
      <View style={styles.layer(intensity)}>
        {ORBS.map((orb) => (
          <Orb
            key={orb.color}
            color={theme.colors[orb.color]}
            seed={orb.seed}
            size={orb.size}
            position={orb.position}
            paused={paused}
          />
        ))}
        {RIBBONS.map((ribbon) => (
          <AuroraRibbon
            key={ribbon.color}
            ribbon={ribbon}
            color={theme.colors[ribbon.color]}
            alpha={ribbon.alpha[theme.scheme]}
            paused={paused}
          />
        ))}
      </View>
    </View>
  );
}

/**
 * Orbe difuminado. El blur 90 de §3.3 se logra con un degradado radial que se desvanece hacia el
 * borde: se ve igual en web y Android y no cuesta un filtro de desenfoque.
 */
function Orb({
  color,
  seed,
  size,
  position,
  paused,
}: {
  color: string;
  seed: number;
  size: number;
  position: Placement;
  paused: boolean;
}) {
  const drift = useOrbDrift(seed, paused);
  const id = `orb-${useId().replace(/[^\w-]/g, '')}`;
  const rgba = parseColor(color);
  const hex = toHex(rgba);
  const radius = size / 2;
  return (
    <Animated.View style={[styles.orb(size), position, drift]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset={0} stopColor={hex} stopOpacity={rgba.a} />
            <Stop offset={0.45} stopColor={hex} stopOpacity={rgba.a * 0.6} />
            <Stop offset={1} stopColor={hex} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={radius} cy={radius} r={radius} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}

/** Cortina de aurora: se desliza, se estira y respira, ida y vuelta con `sine.inOut`. */
function AuroraRibbon({
  ribbon,
  color,
  alpha,
  paused,
}: {
  ribbon: Ribbon;
  color: string;
  alpha: number;
  paused: boolean;
}) {
  const reduceMotion = useReduceMotion();
  const appActive = useAppActive() && !paused;
  const wave = useSharedValue(0.5);
  const id = `ribbon-${useId().replace(/[^\w-]/g, '')}`;
  const hex = toHex(parseColor(color));

  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(wave);
      wave.set(0.5);
      return undefined;
    }
    if (!appActive) {
      cancelAnimation(wave);
      return undefined;
    }
    wave.set(withRepeat(withTiming(1, timingConfig(ribbon.duration, 'sineInOut')), -1, true));
    return () => {
      cancelAnimation(wave);
    };
  }, [wave, reduceMotion, appActive, ribbon.duration]);

  const animatedStyle = useAnimatedStyle(() => {
    const t = wave.get();
    return {
      opacity: 0.6 + 0.4 * t,
      transform: [
        { translateX: (t - 0.5) * 2 * ribbon.drift },
        { rotate: `${ribbon.tilt}deg` },
        { scaleY: 0.85 + 0.3 * t },
      ],
    };
  });

  return (
    <Animated.View style={[styles.ribbon(ribbon.top, ribbon.height), animatedStyle]}>
      <Svg width="100%" height="100%" viewBox="0 0 400 120" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset={0} stopColor={hex} stopOpacity={0} />
            <Stop offset={0.45} stopColor={hex} stopOpacity={alpha * 0.45} />
            <Stop offset={0.78} stopColor={hex} stopOpacity={alpha} />
            <Stop offset={1} stopColor={hex} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Path d={RIBBON_PATH} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}

const { dimmedOpacity } = glassGeometry.aurora;

const styles = StyleSheet.create((theme) => ({
  root: {
    ...fillParent,
    overflow: 'hidden',
    backgroundColor: theme.colors.bg,
  },
  layer: (intensity: AuroraIntensity) => ({
    ...fillParent,
    opacity: intensity === 'dimmed' ? dimmedOpacity : 1,
  }),
  orb: (size: number) => ({
    position: 'absolute',
    width: size,
    height: size,
  }),
  // Más ancha que la pantalla para que los extremos de la banda nunca se vean.
  ribbon: (top: DimensionValue, height: DimensionValue) => ({
    position: 'absolute',
    top,
    left: '-30%',
    width: '160%',
    height,
  }),
}));
