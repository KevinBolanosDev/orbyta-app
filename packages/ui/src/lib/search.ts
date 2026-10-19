// Búsqueda de texto de Select (P10) y SearchBar (P33): sin mayúsculas ni tildes, así "credito"
// encuentra "Crédito" y "COMIDA" encuentra "Comida".

/**
 * Marcas diacríticas combinantes (U+0300 a U+036F) que deja `normalize('NFD')`: la tilde de "é" queda
 * aparte de la "e". Se arma con los códigos para no tener caracteres invisibles en el código.
 */
const COMBINING_MARKS = new RegExp(
  `[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`,
  'g',
);

/** Minúsculas, sin tildes ni diéresis y sin espacios de sobra. */
export function normalizeSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** ¿Cada palabra de la consulta aparece en alguno de los textos? Una consulta vacía coincide. */
export function matchesQuery(query: string, ...texts: (string | undefined)[]): boolean {
  const words = normalizeSearch(query).split(' ').filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalizeSearch(texts.filter(Boolean).join(' '));
  return words.every((word) => haystack.includes(word));
}
