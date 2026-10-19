// Medidas mínimas de una fuente TrueType para maquetar el logotipo en SVG sin dependencias:
// unidades por em, altura de mayúsculas y avance de cada carácter (tablas head, hhea, hmtx, OS/2
// y cmap formato 4).

export interface FontMetrics {
  unitsPerEm: number;
  capHeight: number;
  /** Avance horizontal de un carácter, en unidades de la fuente. */
  advance: (char: string) => number;
}

export function readFontMetrics(file: Uint8Array): FontMetrics {
  const view = new DataView(file.buffer, file.byteOffset, file.byteLength);
  const tables = new Map<string, number>();
  const numTables = view.getUint16(4);
  for (let i = 0; i < numTables; i += 1) {
    const record = 12 + i * 16;
    const tag = String.fromCharCode(...file.subarray(record, record + 4));
    tables.set(tag, view.getUint32(record + 8));
  }
  const table = (tag: string) => {
    const offset = tables.get(tag);
    if (offset === undefined) throw new Error(`Font table ${tag} not found`);
    return offset;
  };

  const unitsPerEm = view.getUint16(table('head') + 18);
  const numberOfHMetrics = view.getUint16(table('hhea') + 34);
  const hmtx = table('hmtx');
  const os2 = table('OS/2');
  const capHeight =
    view.getUint16(os2) >= 2 ? view.getInt16(os2 + 88) : Math.round(unitsPerEm * 0.7);

  const cmapSubtable = findUnicodeSubtable(view, table('cmap'));

  const glyphIndex = (code: number): number => {
    const segX2 = view.getUint16(cmapSubtable + 6);
    const ends = cmapSubtable + 14;
    const starts = ends + segX2 + 2;
    const deltas = starts + segX2;
    const rangeOffsets = deltas + segX2;
    for (let i = 0; i < segX2 / 2; i += 1) {
      if (view.getUint16(ends + i * 2) < code) continue;
      const start = view.getUint16(starts + i * 2);
      if (start > code) return 0;
      const delta = view.getUint16(deltas + i * 2);
      const rangeOffset = view.getUint16(rangeOffsets + i * 2);
      if (rangeOffset === 0) return (code + delta) & 0xffff;
      const glyph = view.getUint16(rangeOffsets + i * 2 + rangeOffset + (code - start) * 2);
      return glyph === 0 ? 0 : (glyph + delta) & 0xffff;
    }
    return 0;
  };

  const advance = (char: string) => {
    const glyph = glyphIndex(char.codePointAt(0) ?? 0);
    const metric = Math.min(glyph, numberOfHMetrics - 1);
    return view.getUint16(hmtx + metric * 4);
  };

  return { unitsPerEm, capHeight, advance };
}

// Subtabla Unicode BMP (plataforma 3 · codificación 1, o plataforma 0) en formato 4.
function findUnicodeSubtable(view: DataView, cmap: number): number {
  const count = view.getUint16(cmap + 2);
  for (let i = 0; i < count; i += 1) {
    const record = cmap + 4 + i * 8;
    const platform = view.getUint16(record);
    const encoding = view.getUint16(record + 2);
    const subtable = cmap + view.getUint32(record + 4);
    const unicode = (platform === 3 && encoding === 1) || platform === 0;
    if (unicode && view.getUint16(subtable) === 4) return subtable;
  }
  throw new Error('No Unicode format 4 cmap subtable');
}

/** Ancho de un texto en px con un tamaño de letra y un tracking (en px) dados. */
export function textWidth(
  metrics: FontMetrics,
  text: string,
  fontSize: number,
  letterSpacing: number,
): number {
  let units = 0;
  let count = 0;
  for (const char of text) {
    units += metrics.advance(char);
    count += 1;
  }
  return (units * fontSize) / metrics.unitsPerEm + letterSpacing * (count - 1);
}
