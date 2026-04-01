import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

/** ViewStyle + propiedades web (ej. cursor) para uso cross-platform. */
export type AppPressableStyle = StyleProp<ViewStyle> | Record<string, unknown>;

export interface AppPressableProps {
  children: ReactNode;
  onPress: () => void;
  style?: AppPressableStyle;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'link';
  disabled?: boolean;
}
