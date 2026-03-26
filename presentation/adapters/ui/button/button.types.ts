// presentation/adapters/ui/button/button.types.ts

export interface ButtonAdapterProps {
  id: string;
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'text';
  disabled?: boolean;
  loading?: boolean;
  size?: 'normal' | 'compact';
  colorMode?: 'standard' | 'inverse';
}
