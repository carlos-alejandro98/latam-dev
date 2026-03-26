import type { ComponentType } from 'react';

export interface ChipProps {
  id: string;
  label: string;
  selected?: boolean;
  disabled?: boolean;
  size?: 'compact' | 'base';
  startIcon?: ComponentType<{ size?: number }>;
  onPress?: () => void;
}
