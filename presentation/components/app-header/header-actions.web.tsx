import { HelpOutlined } from '@hangar/react-icons/core/interaction/HelpOutlined';
import { NotificationsOutlined } from '@hangar/react-icons/core/interaction/NotificationsOutlined';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Pressable, View, StyleSheet } from 'react-native';

import { styles, HEADER_COLORS } from './app-header.styles';
import { HeaderAvatar } from './header-avatar';

interface HeaderActionsProps {
  showNotification?: boolean;
  onHelpPress?: () => void;
  onNotificationPress?: () => void;
  onAvatarPress?: () => void;
  onLogoutPress?: () => void;
  /** Display name of the authenticated user */
  userName?: string;
  /** Role label of the authenticated user */
  userRole?: string;
  /** Base64 data URL of the user profile photo */
  userPhotoUrl?: string;
}

const actionStyles = StyleSheet.create({
  helpButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
});

interface DropdownMenuProps {
  top: number;
  right: number;
  onClose: () => void;
  onLogout: () => void;
  userName?: string;
  userRole?: string;
  userPhotoUrl?: string;
}

/** CSS keyframes injected once into <head> for the slide-down animation. */
const ANIMATION_ID = 'header-dropdown-keyframes';
function ensureDropdownAnimation(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(ANIMATION_ID)) return;
  const style = document.createElement('style');
  style.id = ANIMATION_ID;
  style.textContent = `
    @keyframes headerDropdownIn {
      from { opacity: 0; transform: translateY(-8px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0)   scale(1);    }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Rendered via ReactDOM.createPortal into document.body so it escapes
 * any overflow:hidden ancestor (e.g. LinearGradient).
 */
const DropdownMenu: React.FC<DropdownMenuProps> = ({
  top,
  right,
  onClose,
  onLogout,
  userName,
  userRole,
}) => {
  useEffect(() => {
    ensureDropdownAnimation();
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Ignore clicks inside the menu itself AND clicks on the avatar toggle
      // button (those are handled by handleAvatarPress which toggles the state).
      if (
        !target.closest('[data-logout-menu]') &&
        !target.closest('[data-avatar-toggle]')
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    top,
    right,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    minWidth: 200,
    zIndex: 99999,
    boxShadow: '0px 8px 24px rgba(0,0,0,0.18)',
    overflow: 'hidden',
    animation: 'headerDropdownIn 0.18s ease-out both',
    transformOrigin: 'top right',
  };

  const userSectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '14px 16px',
    backgroundColor: '#F8F8FC',
  };

  const userNameStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: '#0D0463',
    fontFamily: 'inherit',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const userRoleStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 400,
    color: '#777777',
    fontFamily: 'inherit',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const dividerStyle: React.CSSProperties = {
    height: 1,
    backgroundColor: '#EBEBEB',
    margin: 0,
  };

  const logoutButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '10px 16px',
    fontSize: 13,
    color: '#CC2929',
    fontWeight: 500,
    textAlign: 'left',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background-color 0.12s ease',
    boxSizing: 'border-box',
  };

  return ReactDOM.createPortal(
    <div data-logout-menu="" style={menuStyle}>
      {/* User info section — name and role only, no avatar */}
      <div style={userSectionStyle}>
        {userName && <span style={userNameStyle}>{userName}</span>}
        {userRole && <span style={userRoleStyle}>{userRole}</span>}
      </div>

      <div style={dividerStyle} role="separator" />

      <button
        style={logoutButtonStyle}
        onClick={onLogout}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFF5F5';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
        }}
        aria-label="Cerrar sesión"
      >
        Cerrar Sesión
      </button>
    </div>,
    document.body,
  );
};

export const HeaderActions: React.FC<HeaderActionsProps> = ({
  showNotification = false,
  onHelpPress,
  onNotificationPress,
  onAvatarPress,
  onLogoutPress,
  userName,
  userRole,
  userPhotoUrl,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const avatarRef = useRef<View>(null);

  const handleAvatarPress = useCallback(() => {
    const node = avatarRef.current as unknown as HTMLElement | null;
    if (node) {
      const rect = node.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
      });
    }
    setMenuOpen((prev) => !prev);
    onAvatarPress?.();
  }, [onAvatarPress]);

  const handleLogout = useCallback(() => {
    setMenuOpen(false);
    onLogoutPress?.();
  }, [onLogoutPress]);

  const handleClose = useCallback(() => setMenuOpen(false), []);

  return (
    <View style={styles.rightSection}>
      {showNotification && (
        <Pressable
          style={actionStyles.notificationButton}
          onPress={onNotificationPress}
          accessibilityLabel="Notifications"
          accessibilityRole="button"
        >
          <NotificationsOutlined size={24} color={HEADER_COLORS.iconDefault} />
        </Pressable>
      )}

      <Pressable
        style={actionStyles.helpButton}
        onPress={onHelpPress}
        accessibilityLabel="Help"
        accessibilityRole="button"
      >
        <HelpOutlined size={24} color={HEADER_COLORS.iconDefault} />
      </Pressable>

      <View ref={avatarRef} style={actionStyles.avatarWrapper} data-avatar-toggle="">
        <HeaderAvatar onPress={handleAvatarPress} photoUrl={userPhotoUrl} userName={userName} />
      </View>

      {menuOpen && (
        <DropdownMenu
          top={menuPos.top}
          right={menuPos.right}
          onClose={handleClose}
          onLogout={handleLogout}
          userName={userName}
          userRole={userRole}
          userPhotoUrl={userPhotoUrl}
        />
      )}
    </View>
  );
};
