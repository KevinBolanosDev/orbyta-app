import type { GlassLevel, GlassStyle } from '../tokens';

// Reglas del vidrio por plataforma (design-system.md §3.4), como funciones puras.

export type GlassRendering = 'native-blur' | 'css-blur' | 'translucent' | 'solid';

export interface GlassRenderingInput {
  os: 'ios' | 'android' | 'web' | 'windows' | 'macos';
  level: GlassLevel;
  reduceTransparency: boolean;
  /** En Android, `expo-blur` necesita la vista que hay detrás (`BlurTargetView`). */
  hasBlurTarget: boolean;
}

/**
 * Cómo se pinta una superficie de vidrio:
 * - `solid`: "reducir transparencia" → relleno sólido de respaldo, sin desenfoque.
 * - `css-blur`: web → `backdrop-filter` (sin soporte, el navegador deja el relleno translúcido).
 * - `native-blur`: `BlurView`. En Android solo en chrome y sheet (es costoso) y con `blurTarget`.
 * - `translucent`: solo el relleno translúcido (`glass.card.fallback` en Android).
 */
export function glassRendering({
  os,
  level,
  reduceTransparency,
  hasBlurTarget,
}: GlassRenderingInput): GlassRendering {
  if (reduceTransparency) return 'solid';
  if (os === 'web') return 'css-blur';
  if (os === 'android') return level !== 'card' && hasBlurTarget ? 'native-blur' : 'translucent';
  return 'native-blur';
}

/** `backdrop-filter` de CSS para un nivel: `blur(30px) saturate(180%)`. */
export function cssBackdropFilter({ blur, saturation }: Pick<GlassStyle, 'blur' | 'saturation'>) {
  return `blur(${blur}px) saturate(${Math.round(saturation * 100)}%)`;
}

/**
 * Intensidad de `BlurView` (0–100) para un radio de desenfoque. expo-blur no usa píxeles: con el
 * doble del radio, 30 → 60 y 40 → 80 se parecen al desenfoque de la web. TODO(F1.9): ajustar en
 * equipo al medir FPS.
 */
export function nativeBlurIntensity(blur: number): number {
  return Math.min(100, Math.round(blur * 2));
}
