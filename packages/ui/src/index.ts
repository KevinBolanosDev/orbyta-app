// @repo/ui — API pública del design system Cristal Aurora (docs/design-system.md).
// Lo consume: apps/client, solo a través de src/shared/ui (plan §4.2, regla 6).
// El primer import registra temas y breakpoints en Unistyles antes de cualquier StyleSheet.create.
import './theme/configure';

export * from './tokens';
export * from './theme';
export {
  composite,
  contrastRatio,
  parseColor,
  relativeLuminance,
  toHex,
  WCAG_AA,
  withAlpha,
  type Rgba,
} from './lib/color';
export {
  cssAngleToSvgVector,
  toCssLinearGradient,
  type GradientStop,
  type LinearGradientToken,
  type SvgGradientVector,
} from './lib/gradient';
export { glassRendering, type GlassRendering } from './lib/glass';

// Movimiento (F1.2, §4): hooks sobre Reanimated, preferencias de accesibilidad y háptica.
export {
  AccessibilityPreferencesProvider,
  useReduceMotion,
  useReduceTransparency,
  type AccessibilityPreferences,
} from './motion/accessibility-preferences';
export { easingFunction, toEasing } from './motion/easing';
export { triggerHaptic, type HapticKind } from './motion/haptics';
export { staggerDelay } from './motion/motion-math';
export { useAppActive } from './motion/use-app-active';
export { useCountUp, type CountUpOptions } from './motion/use-count-up';
export { useDrawProgress, type DrawOptions } from './motion/use-draw-progress';
export { useEnter, type EnterOptions } from './motion/use-enter';
export { useOrbDrift } from './motion/use-orb-drift';
export { usePress, type PressOptions } from './motion/use-press';
export { useProgressFill } from './motion/use-progress-fill';
export { useSheen, type SheenMode, type SheenOptions } from './motion/use-sheen';

// Primitivas.
export {
  AuroraBackground,
  type AuroraBackgroundProps,
  type AuroraIntensity,
} from './primitives/aurora-background/aurora-background';
export { GlassSurface, type GlassSurfaceProps } from './primitives/glass-surface/glass-surface';
// Android: envuelve lo que el vidrio desenfoca (fondo aurora) y se pasa como `blurTarget` (ref) a
// GlassSurface. En iOS y web es una View normal.
export { BlurTargetView as GlassBlurTarget } from 'expo-blur';
export { GradientFill, type GradientFillProps } from './primitives/gradient-fill/gradient-fill';
export { HoloSheen, type HoloSheenProps } from './primitives/holo-sheen/holo-sheen';
export { Text, type TextProps, type TextTone } from './primitives/text/text';
