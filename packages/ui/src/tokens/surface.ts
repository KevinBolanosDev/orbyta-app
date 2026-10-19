import type { ColorScheme, SemanticColors } from './color';

// Elevación y vidrio (design-system.md §2.6, §3.1–§3.4). Las sombras usan la sintaxis de
// `boxShadow`, que React Native soporta con la nueva arquitectura y web entiende tal cual.

export interface Elevation {
  /** Filas flotantes y chips activos. */
  e1: string;
  /** Tarjetas de vidrio. */
  e2: string;
  /** Hojas y diálogos. */
  e3: string;
  /** Botón primario y pestaña activa. */
  glow: string;
}

export function elevation(scheme: ColorScheme, colors: Pick<SemanticColors, 'glow'>): Elevation {
  const glow = `0 10px 30px ${colors.glow}`;
  return scheme === 'dark'
    ? {
        e1: '0 12px 30px rgba(0,0,0,0.35)',
        e2: '0 30px 70px rgba(0,0,0,0.50)',
        e3: '0 40px 90px rgba(0,0,0,0.60)',
        glow,
      }
    : {
        e1: '0 8px 20px rgba(30,50,110,0.08)',
        e2: '0 24px 60px rgba(30,50,110,0.12)',
        e3: '0 32px 80px rgba(30,50,110,0.18)',
        glow,
      };
}

export type GlassLevel = 'chrome' | 'card' | 'sheet';

export const GLASS_LEVELS: readonly GlassLevel[] = ['chrome', 'card', 'sheet'];

export interface GlassStyle {
  /** Radio del desenfoque del fondo. */
  blur: number;
  /** Saturación del fondo (1 = sin cambio). */
  saturation: number;
  /** Relleno translúcido. */
  fill: string;
  /** Borde de 1 px. */
  border: string;
  /** Brillo interior superior (`inset 0 1px 0`) que da el canto grueso. */
  highlight: string;
}

export interface GlassTheme extends Record<GlassLevel, GlassStyle> {
  /** Relleno sólido sin desenfoque ("Reducir transparencia" o plataforma sin soporte). */
  solidFallback: string;
  /** Pico del reflejo holográfico (§3.2). */
  sheenPeak: string;
}

export const glass: Readonly<Record<ColorScheme, GlassTheme>> = {
  dark: {
    chrome: {
      blur: 30,
      saturation: 1.8,
      fill: 'rgba(255,255,255,0.08)',
      border: 'rgba(255,255,255,0.13)',
      highlight: 'rgba(255,255,255,0.22)',
    },
    card: {
      blur: 30,
      saturation: 1.8,
      fill: 'rgba(255,255,255,0.06)',
      border: 'rgba(255,255,255,0.13)',
      highlight: 'rgba(255,255,255,0.22)',
    },
    sheet: {
      blur: 40,
      saturation: 1.8,
      fill: 'rgba(255,255,255,0.10)',
      border: 'rgba(255,255,255,0.16)',
      highlight: 'rgba(255,255,255,0.22)',
    },
    solidFallback: 'rgba(14,20,38,0.92)',
    sheenPeak: 'rgba(255,255,255,0.10)',
  },
  light: {
    chrome: {
      blur: 30,
      saturation: 1.8,
      fill: 'rgba(255,255,255,0.70)',
      border: 'rgba(255,255,255,0.90)',
      highlight: '#FFFFFF',
    },
    card: {
      blur: 30,
      saturation: 1.8,
      fill: 'rgba(255,255,255,0.55)',
      border: 'rgba(255,255,255,0.90)',
      highlight: '#FFFFFF',
    },
    sheet: {
      blur: 40,
      saturation: 1.8,
      fill: 'rgba(255,255,255,0.75)',
      border: 'rgba(255,255,255,0.95)',
      highlight: '#FFFFFF',
    },
    solidFallback: 'rgba(255,255,255,0.94)',
    sheenPeak: 'rgba(255,255,255,0.70)',
  },
};

/** Medidas fijas del vidrio, el reflejo y la aurora (§3.1–§3.3). */
export const glassGeometry = {
  /** Esquinas HUD en L de las tarjetas héroe; `inset` las aleja del borde redondeado. */
  hudCorner: { size: 20, strokeWidth: 2, inset: 12 },
  /**
   * Reflejo holográfico: franja inclinada que cruza la superficie. El centro de la franja va de
   * `from` a `to` (fracciones del ancho), así empieza y termina fuera de la tarjeta.
   */
  sheen: { angleDeg: -20, widthRatio: 0.28, staticOpacity: 0.5, from: -0.4, to: 1.4 },
  /** Fondo aurora: orbes difuminados y cortinas de aurora (sin rejilla, decidido en F1.4). */
  aurora: { orbBlur: 90, dimmedOpacity: 0.5 },
} as const;
