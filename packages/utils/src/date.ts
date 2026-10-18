import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';

/** Fecha de calendario sin hora, ej. `2026-10-17`. */
export type IsoDate = string & { readonly __brand: 'IsoDate' };

/**
 * Devuelve la fecha de calendario de `instant` vista en `timeZone`.
 * Los movimientos de dinero se registran por día local, no por día UTC.
 */
export function toIsoDate(instant: Date, timeZone: string): IsoDate {
  return format(new TZDate(instant, timeZone), 'yyyy-MM-dd') as IsoDate;
}
