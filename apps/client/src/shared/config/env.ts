// Solo valores públicos y no secretos (EXPO_PUBLIC_*). Los secretos nunca viven en el cliente (plan §16).
// Expo incrusta `process.env.EXPO_PUBLIC_*` al compilar; por eso se accede con punto.
export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
  /** Catálogo /dev/ui en un build de release (para medir FPS, ADR 0018). */
  devCatalog: process.env.EXPO_PUBLIC_DEV_CATALOG === '1',
} as const;

/** El catálogo visual se ve en desarrollo o si el build lo pide explícitamente (ADR 0018). */
export function isDevCatalogEnabled(isDev: boolean = __DEV__): boolean {
  return isDev || env.devCatalog;
}
