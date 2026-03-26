/**
 * Custom Chip component for web.
 * Replaces @hangar/web-components Chip due to theme configuration issues.
 */

import React, { memo, forwardRef } from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';

export interface ChipProps {
  id?: string;
  label: string;
  selected?: boolean;
  size?: 'compact' | 'default';
  startIcon?: React.ComponentType<{ size?: number; color?: string }>;
  onPress?: () => void;
  disabled?: boolean;
}

const ChipComponent = forwardRef<View, ChipProps>(
  ({ id, label, selected = false, size = 'default', startIcon: StartIcon, onPress, disabled }, ref) => {
    const isCompact = size === 'compact';

    return (
      <Pressable
        ref={ref}
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.chip,
          isCompact ? styles.chipCompact : styles.chipDefault,
          selected ? styles.chipSelected : styles.chipUnselected,
          pressed && styles.chipPressed,
          disabled && styles.chipDisabled,
        ]}
        accessibilityRole="button"
        accessibilityState={{ selected, disabled }}
        testID={id}
      >
        {StartIcon && (
          <StartIcon size={isCompact ? 14 : 16} color={selected ? '#FFFFFF' : '#303030'} />
        )}
        <Text
          style={[
            styles.label,
            isCompact ? styles.labelCompact : styles.labelDefault,
            selected ? styles.labelSelected : styles.labelUnselected,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  }
);

ChipComponent.displayName = 'Chip';

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  chipDefault: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipCompact: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  chipSelected: {
    backgroundColor: '#0D12AB',
    borderColor: '#0D12AB',
  },
  chipUnselected: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  chipPressed: {
    opacity: 0.8,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  label: {
    fontWeight: '500',
  },
  labelDefault: {
    fontSize: 14,
  },
  labelCompact: {
    fontSize: 12,
  },
  labelSelected: {
    color: '#FFFFFF',
  },
  labelUnselected: {
    color: '#303030',
  },
});

export const Chip = memo(ChipComponent);
export default Chip;
