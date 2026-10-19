// M08 en reposo: el reflejo se repite cada 6 s en **una sola** superficie a la vez (§3.2).
// Las superficies con reflejo en reposo se anotan aquí; la primera que se montó es la dueña y,
// cuando se desmonta, el turno pasa a la siguiente.

// Propiedades con funciones flecha (no métodos): se pasan sueltas a useSyncExternalStore.
export interface SheenCoordinator {
  register: (id: string) => () => void;
  owner: () => string | undefined;
  subscribe: (listener: () => void) => () => void;
}

export function createSheenCoordinator(): SheenCoordinator {
  let queue: readonly string[] = [];
  const listeners = new Set<() => void>();
  const emit = () => {
    listeners.forEach((listener) => {
      listener();
    });
  };

  return {
    register(id) {
      queue = [...queue, id];
      emit();
      return () => {
        queue = queue.filter((entry) => entry !== id);
        emit();
      };
    },
    owner: () => queue[0],
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** Coordinador compartido por toda la app. */
export const sheenCoordinator = createSheenCoordinator();
