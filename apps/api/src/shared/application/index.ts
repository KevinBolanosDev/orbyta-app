// Kernel compartido · capa application — puertos transversales (reloj; en B1: UnitOfWork,
// EventBus, IdGenerator). Lo consumen: los casos de uso de cada módulo. Lo implementa:
// shared/infrastructure.
export { ClockPort } from './ports/clock.port.js';
