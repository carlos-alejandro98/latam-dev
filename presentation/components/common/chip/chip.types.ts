import type { ComponentType } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface ChipProps {
  id: string;
  label: string;
  selected?: boolean;
  disabled?: boolean;
  size?: 'compact' | 'base';
  startIcon?: ComponentType<{ size?: number }>;
  onPress?: () => void;
  /**
   * Estilos extra del contenedor (p. ej. `borderRadius`, `margin`).
   * En web se reenvían al `button` del design system.
   * En native Hangar no fusiona `style` en el root; aquí se aplica envolviendo en un `View`
   * (para esquinas redondeadas suele hacer falta `overflow: 'hidden'` en el mismo objeto).
   */
  style?: StyleProp<ViewStyle>;
  aspect?:
    | 'normal'
    | 'compact'
    | 'solid'
    | 'outlined'
    | 'selected'
    | 'disabled'
    | 'startIcon';
}
