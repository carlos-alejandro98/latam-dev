import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MenuOutlined } from '@hangar/react-icons/core/interaction';

import { Text } from '@/presentation/components/design-system';

import type { AppHeaderProps } from './app-header.types';
import { styles, HEADER_COLORS } from './app-header.styles';
import { HeaderActions } from './header-actions';
import { HeaderLogo } from './header-logo';

/**
 * Desktop/Web header component.
 * Shows hamburger menu button when showMenuButton is true (mobile/tablet breakpoints).
 */
const AppHeaderComponent: React.FC<AppHeaderProps> = ({
  title = 'HUB CONTROL CENTER',
  subtitle = 'COMPASS',
  layoutVariant = 'desktop',
  showMenuButton = false,
  onMenuPress,
  onHelpPress,
  onNotificationPress,
  onAvatarPress,
  onLogoutPress,
  showNotification = false,
  userName,
  userRole,
  userPhotoUrl,
}) => {
  const isTablet = layoutVariant === 'tablet';
  const isMobile = layoutVariant === 'mobile';
  const showLogoText = !isMobile;
  const gradientStyle = isTablet
    ? styles.gradientTablet
    : isMobile
      ? styles.gradientMobile
      : styles.gradientDesktop;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[HEADER_COLORS.gradientStart, HEADER_COLORS.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, gradientStyle]}
      >
        <View style={styles.content}>
          <View style={styles.leftSection}>
            {showMenuButton ? (
              <View style={styles.menuButton}>
                <View
                  pointerEvents="none"
                  style={[
                    StyleSheet.absoluteFillObject,
                    styles.menuButtonIconLayer,
                  ]}
                >
                  <MenuOutlined size={24} color={HEADER_COLORS.iconDefault} />
                </View>
                <Pressable
                  style={StyleSheet.absoluteFillObject}
                  onPress={onMenuPress}
                  accessibilityLabel="Abrir menú"
                  accessibilityRole="button"
                />
              </View>
            ) : null}

            <HeaderLogo showText={showLogoText} isDesktop={showLogoText} />

            {!isMobile ? (
              <View style={styles.titlesContainer}>
                <Text variant="label-md" style={styles.title}>
                  {title}
                </Text>
                <Text variant="label-md" style={styles.subtitle}>
                  {subtitle}
                </Text>
              </View>
            ) : null}
          </View>

          <HeaderActions
            showNotification={showNotification}
            onHelpPress={onHelpPress}
            onNotificationPress={onNotificationPress}
            onAvatarPress={onAvatarPress}
            onLogoutPress={onLogoutPress}
            userName={userName}
            userRole={userRole}
            userPhotoUrl={userPhotoUrl}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

AppHeaderComponent.displayName = 'AppHeader';

export const AppHeader = memo(AppHeaderComponent);
export default AppHeader;
