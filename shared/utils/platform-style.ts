import { Platform } from 'react-native';

/**
 * Estilos que solo aplican en web (cursor, transition, whiteSpace, etc.).
 * En native devuelve objeto vacío para no ensuciar estilos cross-platform.
 */
export const webOnly = <T extends object>(styles: T): T | Record<string, never> =>
  Platform.OS === 'web' ? styles : ({} as Record<string, never>);
