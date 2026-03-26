import React from 'react';
import { View, Text as RNText, StyleSheet } from 'react-native';

import { PlatformImage } from '@/presentation/components/platform-image';

import { HEADER_COLORS } from './app-header.styles';

const WEB_LOGO = require('@/presentation/assets/images/Logo_LATAM_mobile.svg');

interface HeaderLogoProps {
  /** Whether to show the text next to the logo */
  showText?: boolean;
  /** Whether this is the desktop variant (larger logo) */
  isDesktop?: boolean;
  /** Whether to render the larger mobile hero version */
  isProminentMobile?: boolean;
}

const logoStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  image: {
    width: 20,
    height: 32,
  },
  imageDesktop: {
    width: 22,
    height: 24,
  },
  textContainer: {
    flexDirection: 'column',
    gap: 0,
  },
  brandText: {
    color: HEADER_COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    lineHeight: 14,
  },
  subText: {
    color: HEADER_COLORS.textPrimary,
    fontSize: 7,
    fontWeight: '400',
    letterSpacing: 1.2,
    lineHeight: 9,
  },
});

/**
 * LATAM Airlines logo component for the header (Web).
 * Shows the iso logo and optionally the LATAM AIRLINES text.
 */
export const HeaderLogo: React.FC<HeaderLogoProps> = ({
  showText = true,
  isDesktop = false,
  isProminentMobile = false,
}) => {
  return (
    <View style={logoStyles.container}>
      <PlatformImage
        source={WEB_LOGO}
        style={isDesktop ? logoStyles.imageDesktop : logoStyles.image}
        contentFit="contain"
        accessibilityLabel="LATAM Airlines Logo"
      />
      {showText && (
        <View style={logoStyles.textContainer}>
          <RNText style={logoStyles.brandText}>LATAM</RNText>
          <RNText style={logoStyles.subText}>AIRLINES</RNText>
        </View>
      )}
    </View>
  );
};
