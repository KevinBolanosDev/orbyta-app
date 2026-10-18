// Entidad system-status — API pública. Lo que el cliente sabe del API: modelo, consulta a
// /health (segmento api) y la insignia de estado (segmento ui).
// Lo consume: el widget api-status.
export type { SystemStatus } from './model/system-status';
export { getHealth } from './api/get-health';
export { StatusBadge } from './ui/status-badge';
