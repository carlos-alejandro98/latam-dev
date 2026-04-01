import React from 'react';
import { Image } from 'expo-image';

import type { PlatformImageProps } from './platform-image.types';

/**
 * Imagen en web con expo-image (mejor soporte SVG / remoto que el flujo por defecto).
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
      contentFit={contentFit}
      accessibilityLabel={accessibilityLabel}
    />
  );
};
