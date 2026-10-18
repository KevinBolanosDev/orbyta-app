// Utilidades de color sin React: parseo, transparencia, mezcla y contraste WCAG 2.x.
// Las usan los tokens (orbes con alfa), las pruebas de contraste y, más adelante, los gráficos.

export interface Rgba {
  r: number;
  g: number;
  b: number;
  /** 0 = transparente, 1 = opaco. */
  a: number;
}

/** Mínimos de contraste WCAG 2.x (nivel AA). */
export const WCAG_AA = {
  text: 4.5,
  largeText: 3,
  nonText: 3,
} as const;

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i;

/** Lee `#RGB`, `#RRGGBB`, `#RRGGBBAA`, `rgb(r,g,b)` y `rgba(r,g,b,a)`. */
export function parseColor(value: string): Rgba {
  const hex = HEX.exec(value.trim());
  if (hex?.[1]) {
    // `#abc` → `aabbcc` (solo dígitos hex, así que el reemplazo por carácter es seguro).
    const digits = hex[1].length === 3 ? hex[1].replace(/./g, '$&$&') : hex[1];
    const channel = (index: number) => parseInt(digits.slice(index, index + 2), 16);
    return {
      r: channel(0),
      g: channel(2),
      b: channel(4),
      a: digits.length === 8 ? channel(6) / 255 : 1,
    };
  }
  const rgb = RGB.exec(value.trim());
  if (rgb) {
    return {
      r: Number(rgb[1]),
      g: Number(rgb[2]),
      b: Number(rgb[3]),
      a: rgb[4] === undefined ? 1 : Number(rgb[4]),
    };
  }
  throw new Error(`Unsupported color: ${value}`);
}

/** `#RRGGBB` en mayúsculas (ignora el alfa). */
export function toHex({ r, g, b }: Rgba): string {
  const channel = (value: number) => Math.round(value).toString(16).padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`.toUpperCase();
}

/** El mismo color con otra opacidad, como `rgba(...)`. */
export function withAlpha(color: string, alpha: number): string {
  const { r, g, b } = parseColor(color);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Pinta `foreground` (con su alfa) sobre `background` y devuelve el color opaco resultante. */
export function composite(foreground: Rgba, background: Rgba): Rgba {
  const a = foreground.a;
  const mix = (top: number, bottom: number) => Math.round(top * a + bottom * (1 - a));
  return {
    r: mix(foreground.r, background.r),
    g: mix(foreground.g, background.g),
    b: mix(foreground.b, background.b),
    a: 1,
  };
}

/** Luminancia relativa (WCAG 2.x, 0 = negro, 1 = blanco). */
export function relativeLuminance({ r, g, b }: Rgba): number {
  const linear = (channel: number) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/**
 * Contraste WCAG entre dos colores (de 1 a 21). Si el primer plano es translúcido se mezcla antes
 * con el fondo; el fondo se toma opaco.
 */
export function contrastRatio(foreground: string, background: string): number {
  const bg = { ...parseColor(background), a: 1 };
  const fg = composite(parseColor(foreground), bg);
  const [light, dark] = [relativeLuminance(fg), relativeLuminance(bg)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (light + 0.05) / (dark + 0.05);
}
