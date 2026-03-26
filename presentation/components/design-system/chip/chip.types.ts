/**
 * Chip component types.
 */

export interface ChipProps {
    id?: string;
    label: string;
    selected?: boolean;
    size?: 'compact' | 'default';
    startIcon?: React.ComponentType<{ size?: number; color?: string }>;
    onPress?: () => void;
    disabled?: boolean;
}
