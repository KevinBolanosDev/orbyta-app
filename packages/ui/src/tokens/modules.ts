import { categoryColors, type ColorScheme } from './color.ts';

// Identidad de los cinco módulos: ids y colores (design-system.md §11.5 y §11.6).
// El color de módulo es identidad, no acción: botones primarios, foco y XP siguen en `primary`.

export const MODULE_IDS = ['expenses', 'stocks', 'wealth', 'agenda', 'habits'] as const;

export type ModuleId = (typeof MODULE_IDS)[number];

export interface ModulePalette {
  /** Color del módulo en tema oscuro (`color.module.<id>`). */
  dark: string;
  /** Color en tema claro, para órbita y punto (`color.module.<id>.light`). */
  light: string;
  /** Tinte del planeta (`.tint`). */
  tint: string;
  /** Color medio del planeta (38 % del degradado radial). */
  planet: string;
  /** Sombra del planeta (`.shade`). */
  shade: string;
}

export const modulePalettes: Readonly<Record<ModuleId, ModulePalette>> = {
  expenses: {
    dark: '#2EE6F2',
    light: '#08787F',
    tint: '#E8FFFF',
    planet: '#2EE6F2',
    shade: '#0B6B78',
  },
  stocks: {
    dark: '#4C7DFF',
    light: '#1E5CFF',
    tint: '#E6EEFF',
    planet: '#6B93FF',
    shade: '#1C2E8C',
  },
  wealth: {
    dark: '#8B5CFF',
    light: '#7942FF',
    tint: '#F0E8FF',
    planet: '#A27DFF',
    shade: '#3B1F8F',
  },
  agenda: {
    dark: '#FF8AD8',
    light: '#C0287F',
    tint: '#FFE8F7',
    planet: '#FF8AD8',
    shade: '#8C2468',
  },
  habits: {
    dark: '#3DF5B0',
    light: '#06794E',
    tint: '#E8FFF5',
    planet: '#3DF5B0',
    shade: '#0C6B4A',
  },
};

/** Posición del color de cada módulo dentro de la paleta de categorías (§2.2). */
export const moduleCategoryIndex: Readonly<Record<ModuleId, number>> = {
  expenses: 0,
  stocks: 1,
  wealth: 2,
  habits: 3,
  agenda: 4,
};

/** Colores de un módulo ya resueltos para un tema. */
export interface ModuleColors {
  color: string;
  tint: string;
  planet: string;
  shade: string;
}

export function moduleColors(scheme: ColorScheme): Record<ModuleId, ModuleColors> {
  const entries = MODULE_IDS.map((id) => {
    const palette = modulePalettes[id];
    return [
      id,
      { color: palette[scheme], tint: palette.tint, planet: palette.planet, shade: palette.shade },
    ] as const;
  });
  return Object.fromEntries(entries) as Record<ModuleId, ModuleColors>;
}

/**
 * Paleta de categorías para un tema. Dentro de un módulo se salta el color de ese módulo, para no
 * confundir identidad con dato (§11.6).
 */
export function categoryPalette(scheme: ColorScheme, insideModule?: ModuleId): readonly string[] {
  const palette = categoryColors[scheme];
  if (!insideModule) return palette;
  const skip = moduleCategoryIndex[insideModule];
  return palette.filter((_, index) => index !== skip);
}
