/**
 * AppHeader component export.
 * Platform resolution:
 * - .web.tsx for web
 * - .native.tsx for iOS/Android
 */
export { AppHeader } from './app-header';
export type { AppHeaderProps } from './app-header.types';
export {
  HEADER_HEIGHT_MOBILE,
  HEADER_HEIGHT_DESKTOP,
  HEADER_COLORS,
} from './app-header.styles';
export { HeaderLogo } from './header-logo';
export { HeaderActions } from './header-actions';
export { HeaderAvatar } from './header-avatar';
