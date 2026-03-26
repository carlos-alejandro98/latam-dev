import React from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import type { AppPressableProps } from './app-pressable.types';

/**
 * Web implementation of AppPressable.
 * Uses React Native Pressable (react-native-web handles onPress internally).
 */
export const AppPressable: React.FC<AppPressableProps> = ({
  children,
  onPress,
  style,
  accessibilityLabel,
  accessibilityRole = 'button',
  disabled = false,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={style as StyleProp<ViewStyle>}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      disabled={disabled}
    >
      {children}
    </Pressable>
  );
};
