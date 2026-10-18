import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Almacén clave-valor de preferencias pequeñas del dispositivo (tema; en F2, idioma y región).
 * AsyncStorage en nativo y `localStorage` en web, con las mismas claves (public/index.html lee la del
 * tema). Los datos de negocio no van aquí: van en la BD local de F3 (shared/api).
 */
export const preferencesStorage = {
  get(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  },
  set(key: string, value: string): Promise<void> {
    return AsyncStorage.setItem(key, value);
  },
};
