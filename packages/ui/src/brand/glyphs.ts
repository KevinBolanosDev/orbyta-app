import type { ModuleId } from '../tokens/modules.ts';

// Glifos de los íconos de módulo (§11.5), en una caja de 24 × 24 con trazo, tomados de Lucide
// (licencia ISC, la librería de íconos de la app: ADR 0015). Se guardan como datos para dibujarlos
// también fuera de React (export de la marca). Rectángulos y círculos van convertidos a trazos.

export const MODULE_GLYPHS: Readonly<Record<ModuleId, readonly string[]>> = {
  // receipt
  expenses: [
    'M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z',
    'M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8',
    'M12 17.5v-11',
  ],
  // trending-up
  stocks: ['M16 7h6v6', 'm22 7-8.5 8.5-5-5L2 17'],
  // house
  wealth: [
    'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8',
    'M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  ],
  // calendar
  agenda: [
    'M8 2v4',
    'M16 2v4',
    'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    'M3 10h18',
  ],
  // target
  habits: [
    'M2 12a10 10 0 1 0 20 0a10 10 0 1 0-20 0',
    'M6 12a6 6 0 1 0 12 0a6 6 0 1 0-12 0',
    'M10 12a2 2 0 1 0 4 0a2 2 0 1 0-4 0',
  ],
};
