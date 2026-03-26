import { Platform, useWindowDimensions } from 'react-native';

import { IS_WEB } from '@/config/platform';

export interface ResponsiveState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

interface ResponsiveStateInput {
  width: number;
  height: number;
  isWeb: boolean;
  platformOS: typeof Platform.OS;
  isPad?: boolean;
}

const NATIVE_TABLET_MIN_DIMENSION_DP = 600;

/**
 * Resolves the form factor used by the app shell.
 * - Web always renders the controller web experience, regardless of viewport.
 * - Native iPad devices always render tablet.
 * - Native Android falls back to the common 600dp smallest-width tablet heuristic.
 */
export const resolveResponsiveState = ({
  width,
  height,
  isWeb,
  platformOS,
  isPad,
}: ResponsiveStateInput): ResponsiveState => {
  if (isWeb) {
    return {
      width,
      height,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    };
  }

  const minDimension = Math.min(width, height);
  const isTablet =
    platformOS === 'ios'
      ? Boolean(isPad)
      : minDimension >= NATIVE_TABLET_MIN_DIMENSION_DP;

  return {
    width,
    height,
    isMobile: !isTablet,
    isTablet,
    isDesktop: false,
  };
};

/**
 * Hook global de responsive.
 * Centraliza la resolución de layout principal:
 * - Web: siempre controller web
 * - Native tablet: vista tablet
 * - Native phone: vista mobile
 */
export const useResponsive = (): ResponsiveState => {
  const { width, height } = useWindowDimensions();

  return resolveResponsiveState({
    width,
    height,
    isWeb: IS_WEB,
    platformOS: Platform.OS,
    isPad: Platform.OS === 'ios' ? Platform.isPad : undefined,
  });
};
