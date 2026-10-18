// Solo valores públicos y no secretos (EXPO_PUBLIC_*). Los secretos nunca viven en el cliente (plan §16).
// Expo incrusta `process.env.EXPO_PUBLIC_*` al compilar; por eso se accede con punto.
export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
} as const;
