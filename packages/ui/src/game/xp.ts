// Curva de experiencia y niveles (design-system.md §5.1) como funciones puras.
// Las reglas de cuánta XP da cada acción y sus límites son negocio: viven en el módulo de
// gamificación (F9), no aquí. Aquí solo está la curva que dibujan LevelBadge y XPBar.

/** Pasar del nivel n al n + 1 cuesta `XP_STEP × n` XP (del 12 al 13 son 3.600). */
export const XP_STEP = 300;

/** XP que hace falta para pasar del nivel `level` al siguiente. */
export function xpToNextLevel(level: number): number {
  return XP_STEP * Math.max(1, Math.floor(level));
}

/** XP acumulada para llegar al nivel `level` desde el 1 (el nivel 1 empieza en 0). */
export function totalXpForLevel(level: number): number {
  const n = Math.max(1, Math.floor(level));
  // 300 × (1 + 2 + … + (n − 1)).
  return (XP_STEP * n * (n - 1)) / 2;
}

/** Rangos de título por nivel: 1–4, 5–9, 10–14, 15–19 y 20+. El texto lo pone i18n. */
export type LevelTier = 'apprentice' | 'organized' | 'strategist' | 'architect' | 'legend';

const TIERS: readonly { from: number; tier: LevelTier }[] = [
  { from: 20, tier: 'legend' },
  { from: 15, tier: 'architect' },
  { from: 10, tier: 'strategist' },
  { from: 5, tier: 'organized' },
  { from: 1, tier: 'apprentice' },
];

export function levelTier(level: number): LevelTier {
  return TIERS.find((entry) => level >= entry.from)?.tier ?? 'apprentice';
}

export interface LevelProgress {
  level: number;
  tier: LevelTier;
  /** XP ganada dentro del nivel actual ("2.450" de "2.450 / 3.600 XP"). */
  current: number;
  /** XP que pide el nivel actual para subir ("3.600"). */
  goal: number;
  /** current / goal, de 0 a 1 (sin llegar a 1). */
  ratio: number;
}

/** Nivel y avance a partir de la XP total acumulada. La XP negativa cuenta como 0. */
export function levelFromXp(totalXp: number): LevelProgress {
  const xp = Math.max(0, Math.floor(totalXp));
  // 150 n (n − 1) ≤ xp → n = ⌊(1 + √(1 + xp / 37,5)) / 2⌋; los bucles corrigen el redondeo.
  let level = Math.max(1, Math.floor((1 + Math.sqrt(1 + xp / (XP_STEP / 8))) / 2));
  while (totalXpForLevel(level + 1) <= xp) level += 1;
  while (level > 1 && totalXpForLevel(level) > xp) level -= 1;
  const current = xp - totalXpForLevel(level);
  const goal = xpToNextLevel(level);
  return { level, tier: levelTier(level), current, goal, ratio: current / goal };
}
