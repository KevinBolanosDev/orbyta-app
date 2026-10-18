// Se versiona para que `tsc` funcione en CI antes de que `expo start` genere expo-env.d.ts.
/// <reference types="expo/types" />

// Variables públicas (no secretas) que Expo incrusta al compilar. Declara aquí cada EXPO_PUBLIC_*.
declare namespace NodeJS {
  interface ProcessEnv {
    readonly EXPO_PUBLIC_API_URL?: string;
  }
}
