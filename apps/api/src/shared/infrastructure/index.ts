// Kernel compartido · capa infrastructure — adaptadores transversales: reloj del sistema,
// /health, filtro de errores de dominio y pipe de validación zod.
// Lo consumen: app.module.ts (SharedInfrastructureModule) y los controladores de cada módulo
// (ZodValidationPipe).
export { SharedInfrastructureModule } from './shared-infrastructure.module.js';
export { ZodValidationPipe } from './http/zod-validation.pipe.js';
