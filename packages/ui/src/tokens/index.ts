// @repo/ui/tokens — tokens de Cristal Aurora como datos puros (sin React ni Unistyles).
// Lo consumen: los temas de @repo/ui, sus componentes y, a través de shared/ui, el cliente
// (catálogo /dev/ui y la prueba que compara index.html con los colores de fondo).
export {
  categoryColors,
  darkColors,
  holoGradient,
  lightColors,
  semanticColors,
  type ColorScheme,
  type SemanticColors,
} from './color';
export {
  breakpoints,
  componentSize,
  ICON_STROKE_WIDTH,
  iconSize,
  layout,
  MODULE_ICON_MIN_SIZE,
  radius,
  space,
  zIndex,
  type Breakpoint,
  type RadiusToken,
  type SpaceToken,
} from './layout';
export {
  categoryPalette,
  MODULE_IDS,
  moduleCategoryIndex,
  moduleColors,
  modulePalettes,
  type ModuleColors,
  type ModuleId,
  type ModulePalette,
} from './modules';
export {
  distance,
  duration,
  easing,
  EXIT_DURATION_RATIO,
  exitDuration,
  MAX_STAGGERED_ROWS,
  PRESSED_SCALE,
  spring,
  stagger,
  timing,
  type CubicBezier,
  type DurationToken,
  type EasingToken,
  type SpringToken,
} from './motion';
export {
  elevation,
  glass,
  GLASS_LEVELS,
  glassGeometry,
  type Elevation,
  type GlassLevel,
  type GlassStyle,
  type GlassTheme,
} from './surface';
export {
  fontFamily,
  MAX_FONT_SCALE,
  TYPE_VARIANTS,
  typeScale,
  type FontFamilyToken,
  type TypeMetrics,
  type TypeStyleToken,
  type TypeVariant,
} from './typography';
