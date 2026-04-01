// presentation/adapters/ui/button/button.native.tsx

import React from 'react';
import { Button } from '@/presentation/components/design-system';

import type { ButtonAdapterProps } from './button.types';

/**
 * Mobile implementation using design-system Button (Hangar mobile).
 */
export const ButtonAdapter: React.FC<ButtonAdapterProps> = ({
  id,
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  size = 'normal',
  colorMode = 'standard',
}) => {
  return (
    <Button
      id={id}
      label={label}
      onPress={onPress}
      variant={variant}
      disabled={disabled}
      loading={loading}
      size={size}
      colorMode={colorMode}
    />
  );
};
