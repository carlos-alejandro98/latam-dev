import React from 'react';
import { Text as HangarMobileText } from '@hangar/mobile-components';
import type {
  TextProps as RNTextProps,
  StyleProp,
  TextStyle,
} from 'react-native';

type KnownTabletTextVariant =
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
  | 'label-sm';

type TabletTextVariant = KnownTabletTextVariant | (string & {});

interface TabletTextProps extends RNTextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  variant?: TabletTextVariant;
  bold?: boolean;
  color?: 'primary' | 'secondary' | string;
}

export const TabletText: React.FC<TabletTextProps> = ({
  children,
  style,
  variant,
  bold = false,
  color,
  ...rest
}) => {
  return (
    <HangarMobileText
      variant={variant}
      bold={bold}
      color={color as 'primary' | 'secondary' | undefined}
      style={style as never}
      {...rest}
    >
      {children}
    </HangarMobileText>
  );
};
