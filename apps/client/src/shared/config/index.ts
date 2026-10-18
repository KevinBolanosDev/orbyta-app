// shared/config — API pública. Variables públicas de entorno y valores de región.
// Lo consumen: shared/api (URL del API) y la página wiring (zona horaria).
export { env } from './env';
export { DEFAULT_TIME_ZONE } from './region';
