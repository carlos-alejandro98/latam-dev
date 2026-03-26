import { StyleSheet } from 'react-native';

/**
 * Header dimensions and colors.
 * Matches LATAM brand guidelines.
 */
export const HEADER_HEIGHT_MOBILE = 56;
export const HEADER_HEIGHT_TABLET = 90;
export const HEADER_HEIGHT_DESKTOP = 48;

export const HEADER_COLORS = {
  gradientStart: '#0D0463',
  gradientEnd: '#4A0D4A',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  iconDefault: '#FFFFFF',
  avatarBackground: '#3B5EED',
} as const;

export const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  gradient: {
    width: '100%',
  },
  gradientMobile: {
    height: HEADER_HEIGHT_MOBILE,
    paddingHorizontal: 12,
  },
  gradientTablet: {
    height: HEADER_HEIGHT_TABLET,
    paddingHorizontal: 20,
  },
  gradientDesktop: {
    height: HEADER_HEIGHT_DESKTOP,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flexShrink: 1,
    minWidth: 0,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 24,
    height: 24,
  },
  logoImageDesktop: {
    width: 28,
    height: 28,
  },
  logoText: {
    color: HEADER_COLORS.textPrimary,
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 2,
  },
  titlesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 8,
    minWidth: 0,
  },
  title: {
    color: HEADER_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: HEADER_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '400',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: HEADER_COLORS.avatarBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeMobileBrandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nativeTabletBrandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  nativeTabletTitlesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  nativeTabletTitle: {
    color: HEADER_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  nativeTabletSubtitle: {
    color: HEADER_COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
});
