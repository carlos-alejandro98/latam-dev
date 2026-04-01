import React from 'react';
import {
  Text as RNText,
  type StyleProp,
  type TextProps as RNTextProps,
  type TextStyle,
} from 'react-native';

import type { TextProps as MobileTextProps } from './mobile-text.types';

type KnownMobileTextVariant =
  | 'display-lg'
  | 'display-md'
  | 'display-sm'
  | 'heading-xl'
  | 'heading-lg'
  | 'heading-md'
  | 'heading-sm'
  | 'heading-xs'
  | 'body-lg'
  | 'body-md'
  | 'body-sm'
  | 'label-lg'
  | 'label-md'
  | 'label-sm'
  | 'label-xs';

const variantStyles: Record<KnownMobileTextVariant, TextStyle> = {
  'display-lg': { fontSize: 34, lineHeight: 40, fontWeight: '600' },
  'display-md': { fontSize: 30, lineHeight: 36, fontWeight: '600' },
  'display-sm': { fontSize: 26, lineHeight: 32, fontWeight: '600' },
  'heading-xl': { fontSize: 30, lineHeight: 36, fontWeight: '600' },
  'heading-lg': { fontSize: 24, lineHeight: 30, fontWeight: '600' },
  'heading-md': { fontSize: 20, lineHeight: 26, fontWeight: '600' },
  'heading-sm': { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  'heading-xs': { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  'body-lg': { fontSize: 18, lineHeight: 24, fontWeight: '400' },
  'body-md': { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  'body-sm': { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  'label-lg': { fontSize: 16, lineHeight: 22, fontWeight: '500' },
  'label-md': { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  'label-sm': { fontSize: 12, lineHeight: 18, fontWeight: '500' },
  'label-xs': { fontSize: 11, lineHeight: 16, fontWeight: '500' },
};

const colorStyles: Record<string, TextStyle> = {
  primary: { color: '#303030' },
  secondary: { color: '#626262' },
};

export const MobileText: React.FC<MobileTextProps> = ({
  children,
  style,
  variant = 'label-md',
  bold = false,
  color,
  ...rest
}) => {
  const resolvedVariant =
    variant in variantStyles ? (variant as KnownMobileTextVariant) : 'label-md';

  return (
    <RNText
      style={[
        variantStyles[resolvedVariant],
        color ? (colorStyles[color] ?? { color }) : null,
        bold ? { fontWeight: '700' } : null,
        style as StyleProp<TextStyle>,
      ]}
      {...(rest as RNTextProps)}
    >
      {children}
    </RNText>
  );
};
