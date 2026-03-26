import React from 'react';
import { View, StyleSheet } from 'react-native';

import { PlatformImage } from '@/presentation/components/platform-image';

const MOBILE_LOGO = {
  source: require('@/presentation/assets/images/Logo_LATAM_mobile.svg'),
};

const TABLET_LOGO = {
  source: require('@/presentation/assets/images/Logo_LATAM_Tablet.svg'),
};

interface HeaderLogoProps {
  /** Native layout variant */
  layoutVariant?: 'mobile' | 'tablet';
  /** Kept for web/native type compatibility */
  showText?: boolean;
  /** Kept for web/native type compatibility */
  isDesktop?: boolean;
  /** Kept for web/native type compatibility */
  isProminentMobile?: boolean;
}

const logoStyles = StyleSheet.create({
  mobileImage: {
    width: 22,
    height: 30,
  },
  tabletImage: {
    width: 142,
    height: 28,
  },
});

/**
 * LATAM header logo component for Native.
 */
export const HeaderLogo: React.FC<HeaderLogoProps> = ({ layoutVariant = 'mobile' }) => {
  const isTablet = layoutVariant === 'tablet';

  return (
    <View>
      <PlatformImage
        source={isTablet ? TABLET_LOGO.source : MOBILE_LOGO.source}
        style={isTablet ? logoStyles.tabletImage : logoStyles.mobileImage}
        contentFit="contain"
        accessibilityLabel="LATAM logo"
      />
    </View>
  );
};
