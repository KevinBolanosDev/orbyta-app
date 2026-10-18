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
export { GradientFill, type GradientFillProps } from './primitives/gradient-fill/gradient-fill';
export { Text, type TextProps, type TextTone } from './primitives/text/text';
