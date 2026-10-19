import { BlurView, type BlurViewProps } from 'expo-blur';
import { StyleSheet as NativeStyleSheet, Platform, View, type ViewProps } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { fillParent } from '../../lib/fill-parent';
import { cssBackdropFilter, glassRendering, nativeBlurIntensity } from '../../lib/glass';
import { useReduceTransparency } from '../../motion/accessibility-preferences';
import type { SheenMode } from '../../motion/use-sheen';
import { radius, type GlassLevel } from '../../tokens';
import { HoloSheen } from '../holo-sheen/holo-sheen';

import { HudCorners } from './hud-corners';

export interface GlassSurfaceProps extends ViewProps {
  /** chrome (header, tab bar), card (tarjetas) o sheet (hojas y diálogos). Por defecto `card`. */
  level?: GlassLevel;
  /** Esquinas HUD en L; solo en tarjetas héroe. */
  hud?: boolean;
  /** Reflejo holográfico (M08): `manual`, `idle` o `false` (por defecto). */
  holo?: SheenMode | false;
  /** Cambiar este valor dispara otro barrido del reflejo. */
  holoTrigger?: unknown;
  /**
   * Android: la vista que hay detrás (`BlurTargetView` de expo-blur). Sin ella, en Android no hay
   * desenfoque y queda el relleno translúcido. En iOS y web no hace falta.
   */
  blurTarget?: BlurViewProps['blurTarget'];
}

/**
 * P05 · GlassSurface: superficie de vidrio de Cristal Aurora (§3.1). Capas, de abajo hacia arriba:
 * desenfoque del fondo → relleno translúcido con borde de 1 px y brillo interior superior → sombra
 * `elevation.2` → contenido → esquinas HUD → reflejo. Con "reducir transparencia" usa el relleno
 * sólido de respaldo y no desenfoca.
 */
export function GlassSurface({
  level = 'card',
  hud = false,
  holo = false,
  holoTrigger,
  blurTarget,
  style,
  children,
  ...rest
}: GlassSurfaceProps) {
  const { theme } = useUnistyles();
  const reduceTransparency = useReduceTransparency();
  const rendering = glassRendering({
    os: Platform.OS,
    level,
    reduceTransparency,
    hasBlurTarget: blurTarget !== undefined,
  });

  return (
    <View style={[styles.surface(level), style]} {...rest}>
      {rendering === 'native-blur' ? (
        <BlurView
          style={NativeStyleSheet.absoluteFill}
          intensity={nativeBlurIntensity(theme.glass[level].blur)}
          tint={theme.scheme}
          blurMethod="dimezisBlurViewSdk31Plus"
          blurTarget={blurTarget}
        />
      ) : null}
      <View pointerEvents="none" style={styles.fill(level, rendering === 'solid')} />
      {children}
      {hud ? <HudCorners /> : null}
      {holo ? <HoloSheen mode={holo} trigger={holoTrigger} /> : null}
    </View>
  );
}

// Forma por nivel: las hojas solo redondean arriba. Chrome usa 28 y puede pasar a pill con `style`.
function shape(level: GlassLevel) {
  return level === 'sheet'
    ? { borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet }
    : { borderRadius: radius.xl };
}

const styles = StyleSheet.create((theme) => ({
  // Contenedor: recorta las capas a la forma y lleva la sombra exterior.
  surface: (level: GlassLevel) => ({
    ...shape(level),
    overflow: 'hidden',
    boxShadow: theme.elevation.e2,
  }),
  // Relleno, borde y brillo interior; en web, también el desenfoque del fondo.
  fill: (level: GlassLevel, solid: boolean) => ({
    ...fillParent,
    ...shape(level),
    borderWidth: 1,
    borderColor: theme.glass[level].border,
    backgroundColor: solid ? theme.glass.solidFallback : theme.glass[level].fill,
    boxShadow: `inset 0 1px 0 ${theme.glass[level].highlight}`,
    _web: {
      backdropFilter: solid ? 'none' : cssBackdropFilter(theme.glass[level]),
      WebkitBackdropFilter: solid ? 'none' : cssBackdropFilter(theme.glass[level]),
    },
  }),
}));
