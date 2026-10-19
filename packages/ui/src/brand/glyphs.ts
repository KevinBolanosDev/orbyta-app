import type { ModuleId } from '../tokens/modules.ts';

// Glifos de los íconos de módulo (§11.5), en una caja de 24 × 24 con trazo: los íconos de Lucide
// fijados en ADR 0015 (licencia ISC), copiados de lucide-react-native 1.55.0. Se guardan como datos
// para dibujarlos también fuera de React (export de la marca); rectángulos y círculos van como
// trazos. La prueba `glyphs.test.ts` verifica que coincidan con el paquete instalado.

export const MODULE_GLYPHS: Readonly<Record<ModuleId, readonly string[]>> = {
  // ReceiptText
  expenses: [
    'M13 16H8',
    'M14 8H8',
    'M16 12H8',
    'M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z',
  ],
  // TrendingUp
  stocks: ['M16 7h6v6', 'm22 7-8.5 8.5-5-5L2 17'],
  // House
  wealth: [
    'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8',
    'M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  ],
  // CalendarDays (el rect x 3, y 3, 18 × 18, rx 2, como trazo)
  agenda: [
    'M8 2v3',
    'M16 2v3',
    'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z',
    'M3 9h18',
    'M8 13h.01',
    'M12 13h.01',
    'M16 13h.01',
    'M8 17h.01',
    'M12 17h.01',
    'M16 17h.01',
  ],
  // Target (los tres círculos de r 10, 6 y 2, como trazos)
  habits: [
    'M2 12a10 10 0 1 0 20 0a10 10 0 1 0-20 0',
    'M6 12a6 6 0 1 0 12 0a6 6 0 1 0-12 0',
    'M10 12a2 2 0 1 0 4 0a2 2 0 1 0-4 0',
  ],
};
