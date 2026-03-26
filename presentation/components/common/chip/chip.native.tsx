import React from 'react';
import { Chip as DesignSystemChip } from '@/presentation/components/design-system';

import type { ChipProps } from './chip.types';

/**
 * Native Chip wrapper.
 * Adapts design-system Chip to shared interface with onPress.
 */
export const Chip: React.FC<ChipProps> = ({
  id,
  label,
  selected = false,
  disabled = false,
  size = 'compact',
  startIcon,
  onPress,
}) => {
  return (
    <DesignSystemChip
      id={id}
      label={label}
      selected={selected}
      disabled={disabled}
      size={size}
      startIcon={startIcon}
      onPress={onPress}
    />
  );
};
