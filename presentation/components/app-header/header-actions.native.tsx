import React, { useState, useRef } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { HelpOutlined } from '@hangar/react-native-icons/core/interaction/HelpOutlined';

import { styles, HEADER_COLORS } from './app-header.styles';
import { HeaderAvatar } from './header-avatar';

interface HeaderActionsProps {
  layoutVariant?: 'mobile' | 'tablet';
  showNotification?: boolean;
  onHelpPress?: () => void;
  onNotificationPress?: () => void;
  onAvatarPress?: () => void;
  onLogoutPress?: () => void;
  userName?: string;
  userRole?: string;
  userPhotoUrl?: string;
}

interface DropdownPosition {
  top: number;
  right: number;
}

const actionStyles = StyleSheet.create({
  helpButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    minWidth: 140,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  dropdownItemPressed: {
    backgroundColor: '#F5F5F5',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '400',
  },
});

export const HeaderActions: React.FC<HeaderActionsProps> = ({
  layoutVariant = 'mobile',
  onHelpPress,
  onAvatarPress,
  onLogoutPress,
  userName,
  userPhotoUrl,
}) => {
  const isTablet = layoutVariant === 'tablet';
  const helpButtonSize = isTablet ? 36 : 24;
  const helpButtonRadius = helpButtonSize / 2;
  const helpIconSize = isTablet ? 32 : 24;
  const avatarSize = isTablet ? 40 : 28;
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<DropdownPosition>({ top: 0, right: 16 });
  const avatarRef = useRef<View>(null);

  const handleAvatarPress = () => {
    if (avatarRef.current) {
      avatarRef.current.measure((_x, _y, width, height, pageX, pageY) => {
        // Position dropdown just below the avatar, aligned to its right edge
        const { Dimensions } = require('react-native') as typeof import('react-native');
        const screenWidth = Dimensions.get('window').width;
        setDropdownPos({
          top: pageY + height + 6,
          right: screenWidth - (pageX + width),
        });
        setMenuOpen(true);
      });
    } else {
      setMenuOpen(true);
    }
    onAvatarPress?.();
  };

  const handleLogout = () => {
    setMenuOpen(false);
    onLogoutPress?.();
  };

  return (
    <View style={styles.rightSection}>
      <Pressable
        style={[
          actionStyles.helpButton,
          {
            width: helpButtonSize,
            height: helpButtonSize,
            borderRadius: helpButtonRadius,
          },
        ]}
        onPress={onHelpPress}
        accessibilityLabel="Help"
        accessibilityRole="button"
      >
        <HelpOutlined size={helpIconSize} color={HEADER_COLORS.iconDefault} />
      </Pressable>

      {/* collapsable={false} ensures measure() works on Android */}
      <View ref={avatarRef} collapsable={false}>
        <HeaderAvatar
          onPress={handleAvatarPress}
          photoUrl={userPhotoUrl}
          userName={userName}
          useBrandFallback
          size={avatarSize}
        />
      </View>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setMenuOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuOpen(false)}>
          <View style={actionStyles.overlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  actionStyles.dropdown,
                  { top: dropdownPos.top, right: dropdownPos.right },
                ]}
              >
                <Pressable
                  style={({ pressed }) => [
                    actionStyles.dropdownItem,
                    pressed && actionStyles.dropdownItemPressed,
                  ]}
                  onPress={handleLogout}
                  accessibilityLabel="Cerrar sesión"
                  accessibilityRole="button"
                >
                  <Text style={actionStyles.dropdownItemText}>Salir</Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};
