/**
 * Types for the AppHeader component.
 */

export interface AppHeaderProps {
  /** Title to display (desktop only) */
  title?: string;
  /** Subtitle to display (desktop only) */
  subtitle?: string;
  /** Visual layout variant for mobile/tablet/desktop */
  layoutVariant?: 'mobile' | 'tablet' | 'desktop';
  /** Whether to show the hamburger menu button */
  showMenuButton?: boolean;
  /** Callback when menu button is pressed */
  onMenuPress?: () => void;
  /** Callback when help button is pressed */
  onHelpPress?: () => void;
  /** Callback when notification button is pressed (mobile/tablet only) */
  onNotificationPress?: () => void;
  /** Callback when avatar is pressed */
  onAvatarPress?: () => void;
  /** Callback when logout is requested from the avatar dropdown */
  onLogoutPress?: () => void;
  /** Whether to show the notification button */
  showNotification?: boolean;
  /** Number of unread notifications (mobile/tablet only) */
  notificationCount?: number;
  /** Display name of the authenticated user */
  userName?: string;
  /** Role label of the authenticated user (e.g. "Controller", "Operator") */
  userRole?: string;
  /** Base64 data URL of the user profile photo from Microsoft Graph */
  userPhotoUrl?: string;
}
