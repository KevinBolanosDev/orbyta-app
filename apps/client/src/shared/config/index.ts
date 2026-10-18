// shared/config — API pública. Variables públicas de entorno y valores de región.
// Lo consumen: shared/api (URL del API), la página wiring (zona horaria) y la ruta /dev/ui
// (si el catálogo visual está habilitado).
export { env, isDevCatalogEnabled } from './env';
export { DEFAULT_TIME_ZONE } from './region';
