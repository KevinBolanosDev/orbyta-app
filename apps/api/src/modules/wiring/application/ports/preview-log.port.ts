import type { Id } from '@repo/utils';

import type { PositionSnapshot } from '../../domain/position.js';

export interface PreviewLogEntry {
  /** UUIDv7 de @repo/utils, el mismo generador que usará el cliente sin conexión (plan §6.1). */
  readonly id: Id;
  readonly result: PositionSnapshot;
  readonly calculatedAt: Date;
}

/** Puerto de salida: dónde se registran las vistas previas. Infrastructure decide cómo. */
export abstract class PreviewLogPort {
  abstract record(entry: PreviewLogEntry): Promise<void>;
  abstract count(): Promise<number>;
}
