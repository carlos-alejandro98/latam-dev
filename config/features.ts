import { IS_WEB } from './platform';

// EJEMPLO DE VARIABLES GLOBALES/FLAGS DE PLATAFORMAS PARA FEATURES 

interface FeatureFlags {
  enableHotkeys: boolean;
  enableHoverInteractions: boolean;
  enableNativeHaptics: boolean;
}

export const FEATURES: FeatureFlags = {
  enableHotkeys: IS_WEB,
  enableHoverInteractions: IS_WEB,
  enableNativeHaptics: !IS_WEB,
};
