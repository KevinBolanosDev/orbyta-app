import { useEffect, useState } from 'react';

import { getHealth, type SystemStatus } from '@/entities/system-status';

// Hook que consulta el estado del API al montar el widget y cancela la petición al desmontar.
// TODO(F3): pasar a TanStack Query cuando se elija la capa de datos.
export function useSystemStatus(): SystemStatus {
  const [status, setStatus] = useState<SystemStatus>({ kind: 'checking' });

  useEffect(() => {
    const controller = new AbortController();
    getHealth(controller.signal)
      .then((health) => {
        setStatus({ kind: 'online', health });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setStatus({ kind: 'offline' });
        }
      });
    return () => {
      controller.abort();
    };
  }, []);

  return status;
}
