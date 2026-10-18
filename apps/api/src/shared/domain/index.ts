// Kernel compartido · capa domain — bases de dominio sin negocio (errores, y en B1 Entity,
// ValueObject, DomainEvent). Lo consumen: el domain de cada módulo y el filtro HTTP de errores.
export { DomainError } from './domain-error.js';
