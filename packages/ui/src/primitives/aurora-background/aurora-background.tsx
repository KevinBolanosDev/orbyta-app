import { useId } from 'react';
import {
  StyleSheet as NativeStyleSheet,
  View,
  type DimensionValue,
  type ViewProps,
} from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { parseColor, toHex } from '../../lib/color';
import { fillParent } from '../../lib/fill-parent';
import { useOrbDrift } from '../../motion/use-orb-drift';
import { glassGeometry } from '../../tokens';

/** `full` en pantallas normales; `dimmed` (orbes al 50 %) en formularios y detrás de hojas. */
export type AuroraIntensity = 'full' | 'dimmed';

export interface AuroraBackgroundProps extends Pick<ViewProps, 'style' | 'testID'> {
  intensity?: AuroraIntensity;
  /** Rejilla HUD de 48 px encima de los orbes. Por defecto, sí. */
  grid?: boolean;
}

interface OrbPosition {
  top?: DimensionValue;
  bottom?: DimensionValue;
  left?: DimensionValue;
  right?: DimensionValue;
}

type OrbColor = 'orb1' | 'orb2' | 'orb3';

// Primary arriba a la izquierda, accent a la derecha y secondary abajo; salen en parte de la pantalla.
const ORBS: readonly { color: OrbColor; seed: number; size: number; position: OrbPosition }[] = [
  { color: 'orb1', seed: 1, size: 520, position: { top: '-18%', left: '-25%' } },
  { color: 'orb2', seed: 2, size: 440, position: { top: '28%', right: '-30%' } },
  { color: 'orb3', seed: 3, size: 480, position: { bottom: '-22%', left: '5%' } },
];

/**
 * P35 · AuroraBackground: fondo de las pantallas (§3.3). Tres orbes en primary, accent y secondary
 * que derivan despacio (M09) y la rejilla HUD en `color.grid`. Llena a su contenedor y es decorativo.
 */
export function AuroraBackground({
  intensity = 'full',
  grid = true,
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
      <View style={styles.orbs(intensity)}>
        {ORBS.map((orb) => (
          <Orb
            key={orb.color}
            color={theme.colors[orb.color]}
            seed={orb.seed}
            size={orb.size}
            position={orb.position}
          />
        ))}
      </View>
      {grid ? <HudGrid color={theme.colors.grid} /> : null}
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
}: {
  color: string;
  seed: number;
  size: number;
  position: OrbPosition;
}) {
  const drift = useOrbDrift(seed);
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

const { gridSize, dimmedOpacity } = glassGeometry.aurora;

/** Rejilla HUD: líneas de 1 px cada 48 px. */
function HudGrid({ color }: { color: string }) {
  const id = `grid-${useId().replace(/[^\w-]/g, '')}`;
  return (
    <Svg style={NativeStyleSheet.absoluteFill} width="100%" height="100%">
      <Defs>
        <Pattern id={id} width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
          <Path
            d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
            fill="none"
            stroke={color}
            strokeWidth={1}
          />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    ...fillParent,
    overflow: 'hidden',
    backgroundColor: theme.colors.bg,
  },
  orbs: (intensity: AuroraIntensity) => ({
    ...fillParent,
    opacity: intensity === 'dimmed' ? dimmedOpacity : 1,
  }),
  orb: (size: number) => ({
    position: 'absolute',
    width: size,
    height: size,
  }),
}));
