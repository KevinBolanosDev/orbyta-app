// shared/api — API pública. Cliente HTTP hacia el API de Gravyx Ascenda, siempre validado con zod.
// Lo consumen: el segmento api de las entidades (ej. entities/system-status).
export { HttpError, getJson } from './http-client';
