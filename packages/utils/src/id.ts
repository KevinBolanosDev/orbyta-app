import { v7 as uuidv7, validate, version } from 'uuid';

/** Texto con marca de tipo para que un id no se confunda con un texto cualquiera. */
export type Id = string & { readonly __brand: 'Id' };

/**
 * Crea un UUIDv7. Los ids se generan en el cliente para poder crear registros sin conexión
 * y reenviarlos de forma idempotente (plan §6.1, §10).
 */
export function createId(): Id {
  return uuidv7() as Id;
}

export function isUuidV7(value: string): value is Id {
  return validate(value) && version(value) === 7;
}
