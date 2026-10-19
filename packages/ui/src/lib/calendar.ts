// Calendario del DatePicker (P11) como funciones puras sobre date-fns (ADR 0004). Las fechas viajan
// como día calendario local `YYYY-MM-DD` (igual que `toIsoDate` de @repo/utils): sin hora ni zona, se
// comparan como texto y no se corren de día al cambiar de zona horaria.

import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  isValid,
  parse,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { enUS, es } from 'date-fns/locale';

import type { NumberLocale } from './format-number';

/** Día calendario local, `YYYY-MM-DD`. */
export type IsoDay = string;

/** Rango de días, con `start` ≤ `end`. */
export interface DayRange {
  start: IsoDay;
  end: IsoDay;
}

/** Mes visible del calendario (`month` de 0 a 11). */
export interface MonthCursor {
  year: number;
  month: number;
}

export interface CalendarDay {
  iso: IsoDay;
  /** Día del mes (1–31). */
  day: number;
  /** `false` en los días de relleno del mes anterior o siguiente. */
  inMonth: boolean;
}

const LOCALES = { 'es-CO': es, 'en-US': enUS } as const;
const ISO_DAY = 'yyyy-MM-dd';

/** La semana empieza el lunes en español y el domingo en inglés (EE. UU.). */
export function weekStartOf(locale: NumberLocale): 0 | 1 {
  return locale === 'es-CO' ? 1 : 0;
}

export function toIsoDay(date: Date): IsoDay {
  return format(date, ISO_DAY);
}

/** `YYYY-MM-DD` → `Date` a medianoche local. Lanza si el texto no es una fecha válida. */
export function parseIsoDay(iso: IsoDay): Date {
  const date = parse(iso, ISO_DAY, new Date(2000, 0, 1));
  if (!isValid(date) || toIsoDay(date) !== iso) throw new Error(`Invalid ISO day: ${iso}`);
  return date;
}

export function addDaysIso(iso: IsoDay, amount: number): IsoDay {
  return toIsoDay(addDays(parseIsoDay(iso), amount));
}

export function cursorOf(iso: IsoDay): MonthCursor {
  const date = parseIsoDay(iso);
  return { year: date.getFullYear(), month: date.getMonth() };
}

export function shiftMonth(cursor: MonthCursor, amount: number): MonthCursor {
  const date = addMonths(new Date(cursor.year, cursor.month, 1), amount);
  return { year: date.getFullYear(), month: date.getMonth() };
}

/**
 * Cuadrícula del mes: siempre 6 semanas de 7 días (el alto no salta al cambiar de mes), con los días
 * de relleno del mes anterior y siguiente marcados `inMonth: false`.
 */
export function monthGrid(cursor: MonthCursor, weekStartsOn: 0 | 1): CalendarDay[][] {
  const first = startOfMonth(new Date(cursor.year, cursor.month, 1));
  let day = startOfWeek(first, { weekStartsOn });
  const weeks: CalendarDay[][] = [];
  for (let w = 0; w < 6; w += 1) {
    const week: CalendarDay[] = [];
    for (let d = 0; d < 7; d += 1) {
      week.push({
        iso: toIsoDay(day),
        day: day.getDate(),
        inMonth: day.getMonth() === cursor.month,
      });
      day = addDays(day, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

/** Iniciales de los días de la semana en el orden de la cuadrícula ("L M X J V S D"). */
export function weekdayLabels(locale: NumberLocale): string[] {
  const start = startOfWeek(new Date(2026, 0, 7), { weekStartsOn: weekStartOf(locale) });
  return Array.from({ length: 7 }, (_, i) =>
    format(addDays(start, i), 'EEEEE', { locale: LOCALES[locale] }).toUpperCase(),
  );
}

/** Nombre del día de la semana completo, para el lector de pantalla. */
export function weekdayName(iso: IsoDay, locale: NumberLocale): string {
  return format(parseIsoDay(iso), 'EEEE', { locale: LOCALES[locale] });
}

/** Título del mes: "Octubre 2026" / "October 2026". */
export function monthTitle(cursor: MonthCursor, locale: NumberLocale): string {
  const text = format(new Date(cursor.year, cursor.month, 1), 'LLLL yyyy', {
    locale: LOCALES[locale],
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Mes abreviado para ejes y barras: "oct" / "Oct". */
export function monthShort(cursor: MonthCursor, locale: NumberLocale): string {
  return format(new Date(cursor.year, cursor.month, 1), 'LLL', { locale: LOCALES[locale] }).replace(
    '.',
    '',
  );
}

/** Fecha corta para mostrar en el campo: "19 oct 2026" / "Oct 19, 2026". */
export function formatDay(iso: IsoDay, locale: NumberLocale): string {
  const pattern = locale === 'es-CO' ? 'd MMM yyyy' : 'MMM d, yyyy';
  return format(parseIsoDay(iso), pattern, { locale: LOCALES[locale] }).replace('.', '');
}

/** Fecha larga para el lector de pantalla: "19 de octubre de 2026" / "October 19, 2026". */
export function formatDayLong(iso: IsoDay, locale: NumberLocale): string {
  return format(parseIsoDay(iso), 'PPP', { locale: LOCALES[locale] });
}

/** Rango para mostrar: "1 oct 2026 – 19 oct 2026"; un solo día se muestra una vez. */
export function formatRange(range: DayRange, locale: NumberLocale): string {
  if (range.start === range.end) return formatDay(range.start, locale);
  return `${formatDay(range.start, locale)} – ${formatDay(range.end, locale)}`;
}

/** Ordena dos días como rango. */
export function orderRange(a: IsoDay, b: IsoDay): DayRange {
  return a <= b ? { start: a, end: b } : { start: b, end: a };
}

export function isInRange(iso: IsoDay, range: DayRange): boolean {
  return iso >= range.start && iso <= range.end;
}

/** Atajos de rango: los últimos 7 días (con hoy) y el mes en curso hasta hoy. */
export function lastDays(today: IsoDay, count: number): DayRange {
  return { start: addDaysIso(today, -(count - 1)), end: today };
}

export function monthToDate(today: IsoDay): DayRange {
  return { start: toIsoDay(startOfMonth(parseIsoDay(today))), end: today };
}

/** Último día del mes del cursor (para limitar rangos y pruebas). */
export function lastDayOf(cursor: MonthCursor): IsoDay {
  return toIsoDay(endOfMonth(new Date(cursor.year, cursor.month, 1)));
}

/** Hora `HH:mm` (24 h) válida. */
export function isTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

/** Suma minutos a una hora `HH:mm`, dando la vuelta al día (23:55 + 10 → 00:05). */
export function shiftTime(time: string, minutes: number): string {
  const [h = 0, m = 0] = time.split(':').map(Number);
  const total = (((h * 60 + m + minutes) % 1440) + 1440) % 1440;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

/** Fecha y hora local `YYYY-MM-DDTHH:mm` ↔ sus partes. */
export function splitDateTime(value: string): { day: IsoDay; time: string } {
  const [day = '', time = '00:00'] = value.split('T');
  return { day, time };
}

export function joinDateTime(day: IsoDay, time: string): string {
  return `${day}T${time}`;
}
