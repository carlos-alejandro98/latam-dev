const FLIGHT_LIST_PANEL_WIDTH_RATIO = 360 / 1920;
const FLIGHT_LIST_PANEL_MAX_WIDTH = 360;
export const FLIGHT_LIST_COLLAPSED_WIDTH = 56;

/** Mobile: ancho < 768 (use-responsive). Tablet horizontal: 768–1440. */
const MOBILE_MAX_WIDTH = 767;
const TABLET_HORIZONTAL_MIN_WIDTH = 768;
const TABLET_HORIZONTAL_MAX_WIDTH = 1440;

export const getFlightListPanelWidth = (screenWidth: number): number => {
  const baseWidth = Math.round(screenWidth * FLIGHT_LIST_PANEL_WIDTH_RATIO);
  return Math.min(FLIGHT_LIST_PANEL_MAX_WIDTH, baseWidth);
};

/** Un tercio del ancho (tablet horizontal según diseño). */
export const getFlightListPanelWidthForTablet = (screenWidth: number): number =>
  Math.round(screenWidth / 3);

/**
 * Resuelve el ancho del panel por ancho de pantalla.
 * Mobile (< 768): 100% del ancho.
 * Tablet horizontal (768–1440): 1/3 del ancho.
 * Desktop (> 1440): ratio fijo (máx 360px).
 */
export const getResolvedFlightListPanelWidth = (screenWidth: number): number => {
  if (screenWidth <= MOBILE_MAX_WIDTH) return screenWidth;
  const isTabletHorizontal =
    screenWidth >= TABLET_HORIZONTAL_MIN_WIDTH &&
    screenWidth <= TABLET_HORIZONTAL_MAX_WIDTH;
  return isTabletHorizontal
    ? getFlightListPanelWidthForTablet(screenWidth)
    : getFlightListPanelWidth(screenWidth);
};
