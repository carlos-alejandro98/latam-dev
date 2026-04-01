import React from 'react';
import { Image, Pressable, View } from 'react-native';

import { styles, HEADER_COLORS } from './app-header.styles';

/** Native/web-safe fallback icon built only with React Native views. */
const PersonIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 16,
  color = '#FFFFFF',
}) => {
  const headSize = Math.max(6, Math.round(size * 0.42));
  const bodyWidth = Math.max(10, Math.round(size * 0.9));
  const bodyHeight = Math.max(5, Math.round(size * 0.36));

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: headSize,
          height: headSize,
          borderRadius: headSize / 2,
          backgroundColor: color,
          marginBottom: 1,
        }}
      />
      <View
        style={{
          width: bodyWidth,
          height: bodyHeight,
          borderTopLeftRadius: bodyWidth / 2,
          borderTopRightRadius: bodyWidth / 2,
          borderBottomLeftRadius: Math.round(bodyHeight / 2),
          borderBottomRightRadius: Math.round(bodyHeight / 2),
          backgroundColor: color,
        }}
      />
    </View>
  );
};

interface HeaderAvatarProps {
  /** Callback when avatar is pressed */
  onPress?: () => void;
  /** Base64 data URL of the user profile photo from Microsoft Graph.
   *  When present it replaces the fallback completely. */
  photoUrl?: string;
  /** Kept for API compatibility — no longer rendered visually */
  userName?: string;
  /** Use LATAM brand mark instead of person fallback */
  useBrandFallback?: boolean;
  /** Explicit avatar size in px */
  size?: number;
}

/**
 * Avatar button for the header.
 * Shows the Microsoft Graph profile photo when available.
 * Falls back to a person silhouette icon (matching the header's icon style)
 * when no photo is present — no letter circles.
 */
export const HeaderAvatar: React.FC<HeaderAvatarProps> = ({
  onPress,
  photoUrl,
  useBrandFallback = false,
  size = 28,
}) => {
  const borderRadius = size / 2;
  const fallbackIconSize = Math.max(16, Math.round(size * 0.58));

  return (
    <Pressable
      style={[
        styles.avatarButton,
        { width: size, height: size, borderRadius },
      ]}
      onPress={onPress}
      accessibilityLabel="User profile"
      accessibilityRole="button"
    >
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          style={[
            styles.avatarImage,
            { width: size, height: size, borderRadius },
          ]}
          accessibilityLabel="Profile"
        />
      ) : useBrandFallback ? (
        <Image
          source={require('@/assets/images/avatar-default.png')}
          style={[
            styles.avatarImage,
            { width: size, height: size, borderRadius },
          ]}
          resizeMode="cover"
          accessibilityLabel="LATAM profile"
        />
      ) : (
        <View
          style={[
            styles.avatarFallback,
            { width: size, height: size, borderRadius },
          ]}
        >
          <PersonIcon size={fallbackIconSize} color="#FFFFFF" />
        </View>
      )}
    </Pressable>
  );
};
