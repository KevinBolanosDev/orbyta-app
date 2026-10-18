/**
 * Puerto para la hora actual. Los casos de uso dependen de esto, nunca de `new Date()`,
 * así las pruebas controlan el tiempo.
 * Es clase abstracta (no interfaz) para que Nest la use como token de inyección.
 */
export abstract class ClockPort {
  abstract now(): Date;
}
