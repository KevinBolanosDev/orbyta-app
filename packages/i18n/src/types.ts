import type { es } from './locales/es.js';

/** Misma forma que `T`, pero cada texto es `string` (no el literal en español). */
export type Messages<T> = {
  readonly [K in keyof T]: T[K] extends string ? string : Messages<T[K]>;
};

/** Forma que debe cumplir cada idioma: las claves de `es.ts`. */
export type TranslationResource = Messages<typeof es>;
