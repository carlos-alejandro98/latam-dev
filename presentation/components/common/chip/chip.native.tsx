import React from 'react';
import { View } from 'react-native';

import { Chip as DesignSystemChip } from '@/presentation/components/design-system';

import type { ChipProps } from './chip.types';

type HangarChipArgs = Omit<ChipProps, 'style'>;

function renderDesignSystemChip(args: HangarChipArgs): React.ReactElement {
  const nativePress =
    args.onPress != null
      ? () => {
          args.onPress?.();
        }
      : undefined;

  return (
    <DesignSystemChip
      id={args.id}
      label={args.label}
      selected={args.selected ?? false}
      disabled={args.disabled ?? false}
      size={args.size === 'base' ? 'normal' : args.size}
      startIcon={args.startIcon}
      aspect={args.aspect === 'outlined' ? 'outlined' : 'solid'}
      {...(nativePress != null ? { onPress: nativePress } : {})}
    />
  );
}

/**
 * Native Chip wrapper.
 * `style` va en un `View` envolvente (Hangar no fusiona `style` en el root).
 * Los tipos del design-system Chip vienen del build web; `onPress` existe en Hangar mobile.
 */
export const Chip: React.FC<ChipProps> = (p) => {
  const { style, ...rest } = p;
  const core = renderDesignSystemChip(rest);
  return style == null ? core : <View style={style}>{core}</View>;
};
