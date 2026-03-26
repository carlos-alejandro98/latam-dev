import type { ImageSourcePropType, ImageStyle, StyleProp } from 'react-native';

export type PlatformContentFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';

export interface PlatformImageProps {
  source: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
  /** Misma API que expo-image; en nativo se traduce a `resizeMode`. */
  contentFit?: PlatformContentFit;
  accessibilityLabel?: string;
}
