import React from 'react';
import { Image, type ImageResizeMode } from 'react-native';

import type { PlatformContentFit, PlatformImageProps } from './platform-image.types';

function contentFitToResizeMode(fit: PlatformContentFit | undefined): ImageResizeMode {
  switch (fit) {
    case 'cover':
      return 'cover';
    case 'fill':
      return 'stretch';
    case 'none':
      return 'center';
    case 'scale-down':
      return 'contain';
    case 'contain':
    default:
      return 'contain';
  }
}

/**
 * Imagen en mobile con `Image` de React Native (evita acoplar la pantalla nativa a expo-image).
 * Los SVG locales vía `require` pueden necesitar PNG o `react-native-svg` si no se renderizan.
 */
export const PlatformImage: React.FC<PlatformImageProps> = ({
  source,
  style,
  contentFit = 'contain',
  accessibilityLabel,
}) => {
  return (
    <Image
      source={source}
      style={style}
      resizeMode={contentFitToResizeMode(contentFit)}
      accessibilityLabel={accessibilityLabel}
    />
  );
};
