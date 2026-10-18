/**
 * Nombre de token del design system a partir de la clave en código:
 * `inkMuted` → `ink.muted`, `orb1` → `orb.1`, `displayXl` → `display.xl`.
 */
export function toTokenName(key: string): string {
  return key.replace(/[A-Z]|\d+/g, (match) => `.${match.toLowerCase()}`);
}
