import React from 'react';

import { Chip as DesignSystemChip } from '@/presentation/components/design-system';

import type { ChipProps } from './chip.types';
import type { CSSProperties } from 'react';

type HangarChipArgs = Omit<ChipProps, 'style'>;

function renderDesignSystemChip(
  args: HangarChipArgs,
  webStyle?: CSSProperties,
): React.ReactElement {
  return (
    <DesignSystemChip
      id={args.id}
      label={args.label}
      selected={args.selected ?? false}
      disabled={args.disabled ?? false}
      size={args.size === 'base' ? 'normal' : args.size}
      startIcon={args.startIcon}
      aspect={args.aspect === 'outlined' ? 'outlined' : 'solid'}
      style={webStyle}
      onClick={args.onPress != null ? () => args.onPress?.() : undefined}
    />
  );
}

/**
 * Web Chip wrapper.
 * Adapts onPress a onClick para el Chip Hangar (web).
 */
export const Chip: React.FC<ChipProps> = (p) => {
  const { style, ...rest } = p;
  return renderDesignSystemChip(
    rest,
    style != null ? (style as CSSProperties) : undefined,
  );
};
