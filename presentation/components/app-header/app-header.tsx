/**
 * Platform bridge for AppHeader.
 * Metro bundler resolves .native.tsx and .web.tsx automatically when imported
 * directly, but barrel re-exports lose that resolution. This file provides a
 * fallback that Metro will use when no platform-specific file is resolved.
 *
 * On native (iOS/Android): Metro picks app-header.native.tsx first.
 * On web: Metro picks app-header.web.tsx first.
 * This file is used only when neither specific extension is found.
 */
export { AppHeader } from './app-header.native';
export type { AppHeaderProps } from './app-header.types';
