import { describe, expect, it } from 'vitest';

import { en } from './locales/en.js';
import { es } from './locales/es.js';

// Chequeo de claves (plan §16): falla si a un idioma le falta una clave, si sobra una, si hay un
// texto vacío o si las variables {{x}} no coinciden entre idiomas.

type Tree = Readonly<Record<string, unknown>>;

/** Aplana `{ a: { b: 'x' } }` a `{ 'a.b': 'x' }`. */
function flatten(tree: Tree, prefix = ''): Map<string, unknown> {
  const entries = new Map<string, unknown>();
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      for (const [nested, nestedValue] of flatten(value as Tree, path)) {
        entries.set(nested, nestedValue);
      }
    } else {
      entries.set(path, value);
    }
  }
  return entries;
}

const placeholders = (text: string) =>
  [...text.matchAll(/{{\s*(\w+)\s*}}/g)].map((m) => m[1]).sort();

const locales = { es: flatten(es), en: flatten(en) };

describe('translations', () => {
  it('have exactly the same keys in every language', () => {
    expect([...locales.en.keys()].sort()).toEqual([...locales.es.keys()].sort());
  });

  it.each(Object.entries(locales))('has only non-empty strings in %s', (_language, entries) => {
    for (const [key, value] of entries) {
      expect(typeof value, key).toBe('string');
      expect((value as string).trim(), key).not.toBe('');
    }
  });

  it('use the same {{placeholders}} in every language', () => {
    for (const [key, spanish] of locales.es) {
      const english = locales.en.get(key);
      expect(placeholders(english as string), key).toEqual(placeholders(spanish as string));
    }
  });
});
