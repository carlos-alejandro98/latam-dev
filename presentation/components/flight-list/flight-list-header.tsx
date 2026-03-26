import React from 'react';

import { AppPressable } from '@/presentation/components/common/app-pressable';
import { Chip } from '@/presentation/components/common/chip';
import {
  Box,
  Divider,
  Text,
  TextField,
} from '@/presentation/components/design-system';

import { FlightListDateSelector } from './flight-list-date-selector';
import type { OrderKey, PanelColors } from './flight-list.types';
import {
  CheckOutlined,
  DoubleCaretLeftOutlined,
  SearchOutlined,
} from './icons';
import { styles } from './flight-list.styles';

export interface FlightListHeaderProps {
  colors: PanelColors;
  onToggleCollapse: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  orderBy: OrderKey | null;
  onOrderChange: (value: OrderKey | null) => void;
  selectedDateKey: string | null;
  availableDateKeys: string[];
  onDateChange: (value: string) => void;
  onPreviousDate: () => void;
  onNextDate: () => void;
}

const headerBarStyle = (colors: PanelColors) => ({
  ...styles.headerBar,
  backgroundColor: colors.surfacePrimary,
  borderBottomColor: colors.borderPrimary,
});

const searchBlockStyle = (colors: PanelColors) => ({
  ...styles.searchBlock,
  backgroundColor: colors.surfacePrimary,
  borderBottomColor: colors.borderPrimary,
});

export const FlightListHeader: React.FC<FlightListHeaderProps> = ({
  colors,
  onToggleCollapse,
  searchValue,
  onSearchChange,
  orderBy,
  onOrderChange,
  selectedDateKey,
  availableDateKeys,
  onDateChange,
  onPreviousDate,
  onNextDate,
}) => {
  const handleTextFieldChange = (e: unknown) => {
    const ev = e as {
      target?: { value?: string };
      nativeEvent?: { text?: string };
    };
    onSearchChange(ev?.target?.value ?? ev?.nativeEvent?.text ?? '');
  };

  return (
    <Box>
      <Box style={headerBarStyle(colors)}>
        <Text variant="heading-md" color="primary" bold={true}>
          Fila de Voos
        </Text>
        <AppPressable
          onPress={onToggleCollapse}
          style={
            styles.toggleButton as React.ComponentProps<
              typeof AppPressable
            >['style']
          }
          accessibilityLabel="Recolher menu de voos"
        >
          <DoubleCaretLeftOutlined size={32} />
        </AppPressable>
      </Box>
      <Divider />
      <FlightListDateSelector
        colors={colors}
        selectedDateKey={selectedDateKey}
        availableDateKeys={availableDateKeys}
        onDateChange={onDateChange}
        onPreviousDate={onPreviousDate}
        onNextDate={onNextDate}
      />
      <Divider />
      <Box style={searchBlockStyle(colors)}>
        <TextField
          id="flight-search"
          label=""
          placeholder="Pesquise voos ou prefixo"
          style={styles.searchField}
          startIcon={SearchOutlined}
          cleanable
          value={searchValue}
          onChange={handleTextFieldChange}
        />
        <Box style={styles.orderRow}>
          <Text variant="label-sm" color="secondary">
            Ordem:
          </Text>
          <Box style={styles.orderChips}>
            <Chip
              id="order-eta"
              label="ETA"
              selected={orderBy === 'eta'}
              size="compact"
              startIcon={orderBy === 'eta' ? CheckOutlined : undefined}
              onPress={() => onOrderChange(orderBy === 'eta' ? null : 'eta')}
            />

            <Chip
              id="order-etd"
              label="STD"
              selected={orderBy === 'etd'}
              size="compact"
              startIcon={orderBy === 'etd' ? CheckOutlined : undefined}
              onPress={() => onOrderChange(orderBy === 'etd' ? null : 'etd')}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
