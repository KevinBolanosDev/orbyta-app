// @repo/utils — API pública. Utilidades sin framework: ids UUIDv7 y fechas por zona horaria.
// Lo consumen: apps/api (ids de registros, ej. el log de wiring) y apps/client (fecha local
// en la página de cableado; en F3, ids generados offline).
export { createId, isUuidV7, type Id } from './id.js';
export { toIsoDate, type IsoDate } from './date.js';
