import { Injectable } from '@nestjs/common';

import { PreviewLogPort, type PreviewLogEntry } from '../application/ports/preview-log.port.js';

const MAX_ENTRIES = 100;

/** Adaptador de PreviewLogPort en memoria. Un módulo real usaría aquí un repositorio Drizzle (B1+). */
@Injectable()
export class InMemoryPreviewLog extends PreviewLogPort {
  private readonly items: PreviewLogEntry[] = [];

  get entries(): readonly PreviewLogEntry[] {
    return this.items;
  }

  record(entry: PreviewLogEntry): Promise<void> {
    this.items.push(entry);
    if (this.items.length > MAX_ENTRIES) {
      this.items.shift();
    }
    return Promise.resolve();
  }

  count(): Promise<number> {
    return Promise.resolve(this.items.length);
  }
}
