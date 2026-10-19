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
export { usePresence, type PresenceOptions } from './motion/use-presence';
export { usePress, type PressOptions } from './motion/use-press';
export { useProgressFill } from './motion/use-progress-fill';
export { useSheen, type SheenMode, type SheenOptions } from './motion/use-sheen';
export { useSlideIndicator, type SlotLayout } from './motion/use-slide-indicator';

// Marca Gravyx Ascenda (F1.3, §11): órbita pura y componentes BR01–BR04.
export { ENTRANCE_DURATION, entranceAt, twinkleScale, type EntranceState } from './brand/entrance';
export { BRAND_BACKGROUND, MARK_VARIANT_MIN_SIZE } from './brand/geometry';
export { brandVariantForSize, type BrandMarkVariant } from './brand/mark';
export { type ModuleIconTone } from './brand/module-icon';
export {
  ORBIT,
  orbitFrame,
  orbitPhase,
  projectPoint,
  type OrbitFrame,
  type OrbitSlot,
} from './brand/orbit';
export { BrandMark, type BrandMarkProps } from './brand/ui/brand-mark';
export { ModuleIcon, type ModuleIconProps, type ModuleIconState } from './brand/ui/module-icon';
export {
  BrandLockup,
  Wordmark,
  type BrandLockupProps,
  type WordmarkProps,
} from './brand/ui/wordmark';

// Formato de montos y porcentajes para mostrar (texto decimal, sin pasar por `number`).
export {
  CURRENCY_DECIMALS,
  CURRENCY_PREFIX,
  deltaDirection,
  formatAmount,
  formatCount,
  formatPercent,
  maskedAmount,
  MINUS,
  NUMBER_SEPARATORS,
  type AmountCurrency,
  type DeltaDirection,
  type NumberLocale,
  type SignDisplay,
} from './lib/format-number';

// Primitivas de contenido y acción (F1.4).
export {
  AmountPrivacyProvider,
  AmountText,
  DeltaText,
  useAmountPrivacy,
  type AmountTextProps,
  type DeltaTextProps,
} from './primitives/amount-text/amount-text';
export { Avatar, type AvatarProps } from './primitives/avatar/avatar';
export { Badge, type BadgeProps, type BadgeTone } from './primitives/badge/badge';
export {
  Button,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
} from './primitives/button/button';
export { Card, type CardProps } from './primitives/card/card';
export { Chip, type ChipProps, type ChipVariant } from './primitives/chip/chip';
export {
  EmptyState,
  ErrorState,
  type EmptyStateProps,
  type ErrorStateProps,
} from './primitives/feedback-state/feedback-state';
export {
  Icon,
  IconColorProvider,
  type IconComponent,
  type IconProps,
  type IconSize,
} from './primitives/icon/icon';
export {
  IconButton,
  type IconButtonProps,
  type IconButtonVariant,
} from './primitives/icon-button/icon-button';
export { SectionHeader, type SectionHeaderProps } from './primitives/section-header/section-header';
export { Skeleton, type SkeletonProps, type SkeletonShape } from './primitives/skeleton/skeleton';

// Superposiciones, progreso y navegación interna (F1.5).
export { BottomSheet, type BottomSheetProps } from './primitives/bottom-sheet/bottom-sheet';
export { type SheetHeight } from './primitives/bottom-sheet/sheet-math';
export { Dialog, type DialogProps } from './primitives/dialog/dialog';
export { Fab, type FabProps } from './primitives/fab/fab';
export {
  ProgressBar,
  ProgressRing,
  type ProgressBarProps,
  type ProgressRingProps,
  type ProgressToneProp,
} from './primitives/progress/progress';
export {
  budgetTone,
  PROGRESS_LIMIT_RATIO,
  type ProgressTone,
} from './primitives/progress/progress-math';
export {
  SegmentedControl,
  type SegmentedControlProps,
  type SegmentOption,
} from './primitives/segmented-control/segmented-control';
export { Stepper, type StepperProps } from './primitives/stepper/stepper';
export {
  OfflineBanner,
  SyncBadge,
  type OfflineBannerProps,
  type SyncBadgeProps,
  type SyncStatus,
} from './primitives/sync-status/sync-status';
export { Tabs, type TabItem, type TabsProps } from './primitives/tabs/tabs';
export {
  ToastProvider,
  useToast,
  type ToastApi,
  type ToastProviderProps,
} from './primitives/toast/toast';
export {
  type ToastAchievement,
  type ToastOptions,
  type ToastTone,
} from './primitives/toast/toast-queue';

// Formularios y listas (F1.6).
export {
  applyAmountKey,
  formatAmountInput,
  MAX_INTEGER_DIGITS,
  normalizeAmount,
  parseAmountInput,
  type AmountKey,
} from './lib/amount-input';
export {
  addDaysIso,
  formatDay,
  formatRange,
  monthShort,
  shiftMonth,
  toIsoDay,
  type DayRange,
  type IsoDay,
  type MonthCursor,
} from './lib/calendar';
export { matchesQuery, normalizeSearch } from './lib/search';
export {
  Checkbox,
  Radio,
  RadioGroup,
  type CheckboxProps,
  type RadioGroupProps,
  type RadioProps,
} from './primitives/choice/choice';
export {
  DatePicker,
  type DatePickerLabels,
  type DatePickerProps,
} from './primitives/date-picker/date-picker';
export { ListItem, type ListItemProps, type SwipeAction } from './primitives/list-item/list-item';
export { MoneyInput, type MoneyInputProps } from './primitives/money-input/money-input';
export { NumberPad, type NumberPadProps } from './primitives/number-pad/number-pad';
export {
  PullToRefresh,
  type PullToRefreshProps,
} from './primitives/pull-to-refresh/pull-to-refresh';
export {
  SEARCH_DEBOUNCE_MS,
  SearchBar,
  type SearchBarProps,
} from './primitives/search-bar/search-bar';
export {
  Select,
  type SelectLabels,
  type SelectOption,
  type SelectProps,
} from './primitives/select/select';
export { Switch, type SwitchProps } from './primitives/switch/switch';
export { type FieldSize } from './primitives/text-field/field-frame';
export { TextField, type TextFieldProps } from './primitives/text-field/text-field';

// Gráficos G01–G07 y StatTile (F1.7): geometría pura sobre d3 y dibujo en SVG (ADR 0014).
export {
  AreaChart,
  type AreaChartProps,
  type ChartMarker,
  type ChartPoint,
} from './charts/area-chart';
export { BarChart, type BarChartProps, type BarDatum } from './charts/bar-chart';
export { CandleChart, type CandleChartProps } from './charts/candle-chart';
export { type ChartTone } from './charts/chart-kit';
export { DonutChart, type DonutChartProps, type DonutDatum } from './charts/donut-chart';
export { trendOf } from './charts/geometry/line';
export { type Candle } from './charts/geometry/shapes';
export { HeatmapCalendar, type HeatmapCalendarProps } from './charts/heatmap-calendar';
export { Sparkline, type SparklineProps } from './charts/sparkline';
export { useScrubber } from './charts/use-scrubber';
export { StatTile, type StatTileProps } from './primitives/stat-tile/stat-tile';

// Gamificación X01–X07 y curva de XP (F1.8, §5 y §7.3).
export {
  AchievementBadge,
  type AchievementBadgeProps,
  type AchievementFamily,
  type AchievementState,
} from './game/achievement-badge';
export { AchievementToast, type AchievementToastProps } from './game/achievement-toast';
export { MAX_TILT, tiltFromPoint, tiltFromRotation, type Tilt } from './game/game-math';
export { HoloCard, type HoloCardProps } from './game/holo-card';
export { LevelBadge, type LevelBadgeProps, type LevelBadgeSize } from './game/level-badge';
export { StreakCounter, type StreakCounterProps } from './game/streak-counter';
export {
  levelFromXp,
  levelTier,
  totalXpForLevel,
  XP_STEP,
  xpToNextLevel,
  type LevelProgress,
  type LevelTier,
} from './game/xp';
export { XPBar, type XPBarProps } from './game/xp-bar';
export { XPFloat, type XPFloatHandle, type XPFloatProps } from './game/xp-float';

// Primitivas base.
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
