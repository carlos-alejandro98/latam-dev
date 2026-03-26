import React from 'react';
import { Chip as DesignSystemChip } from '@/presentation/components/design-system';

import type { ChipProps } from './chip.types';

/**
 * Web Chip wrapper.
 * Adapts onPress to onClick for design-system Chip (Hangar web).
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
