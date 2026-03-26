import { Platform } from 'react-native';

export type PlatformType = 'web' | 'mobile';

export const PLATFORM: PlatformType =
  Platform.OS === 'web' ? 'web' : 'mobile';

export const IS_WEB = PLATFORM === 'web';
export const IS_MOBILE = PLATFORM === 'mobile';

const hasWindow = typeof window !== 'undefined';
const hasDocument = typeof document !== 'undefined';
const isEmbeddedWebView =
  hasWindow && typeof (window as { ReactNativeWebView?: unknown }).ReactNativeWebView !== 'undefined';

export const IS_WEBVIEW = IS_WEB && hasWindow && hasDocument && isEmbeddedWebView;
export const IS_BROWSER = IS_WEB && !IS_WEBVIEW;
