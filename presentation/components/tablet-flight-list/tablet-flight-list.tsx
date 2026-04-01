import React from 'react';
import { TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components';

import type { Flight } from '@/domain/entities/flight';
import { AppPressable } from '@/presentation/components/common/app-pressable';
import {
  CheckOutlined,
  DoubleCaretLeftOutlined,
  SearchOutlined,
} from '@/presentation/components/common/icons';
import { FlightListDateSelector } from '@/presentation/components/flight-list/flight-list-date-selector';
import { getPanelColors } from '@/presentation/components/flight-list/flight-list-theme';
import type { OrderKey } from '@/presentation/components/flight-list/flight-list.types';
import { TabletText as Text } from '@/presentation/components/tablet/tablet-text';
import { getBottomSystemSpacing } from '@/presentation/utils/native-safe-area';

import { TabletFlightListContent } from './tablet-flight-list-content';
import { styles } from './tablet-flight-list.styles.runtime';

export interface TabletFlightListProps {
  flights: Flight[];
  loading: boolean;
  searchQuery: string;
  orderBy: OrderKey | null;
  selectedDateKey: string | null;
  availableDateKeys: string[];
  selectedFlightId?: string | null;
  selectedFlightIds?: string[];
  onClose: () => void;
  canClose: boolean;
  onSearchChange: (value: string) => void;
  onOrderChange: (value: OrderKey | null) => void;
  onDateChange: (value: string) => void;
  onPreviousDate: () => void;
  onNextDate: () => void;
  onSelectFlight?: (flightId: string) => void;
}

const getOrderChipStyle = (selected: boolean) => {
  return [
    styles.orderChip,
    selected ? styles.orderChipActive : styles.orderChipIdle,
  ];
};

export const TabletFlightList: React.FC<TabletFlightListProps> = ({
  flights,
  loading,
  searchQuery,
  orderBy,
  selectedDateKey,
  availableDateKeys,
  selectedFlightId,
  selectedFlightIds = [],
  onClose,
  canClose,
  onSearchChange,
  onOrderChange,
  onDateChange,
  onPreviousDate,
  onNextDate,
  onSelectFlight,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bottomSafeSpacing = getBottomSystemSpacing(insets.bottom);
  const colors = getPanelColors(theme);

  return (
    <View
      style={{
        ...styles.container,
        borderRightColor: colors.borderPrimary,
      }}
    >
      <View
        style={{
          ...styles.headerBar,
          borderBottomColor: colors.borderPrimary,
        }}
      >
        <Text variant="heading-md" style={styles.headerTitle}>
          Fila de Voos
        </Text>
        <AppPressable
          onPress={onClose}
          disabled={!canClose}
          style={{
            ...styles.closeButton,
            opacity: canClose ? 1 : 0.35,
          }}
          accessibilityLabel="Fechar fila de voos"
        >
          <DoubleCaretLeftOutlined size={28} color={colors.textPrimary} />
        </AppPressable>
      </View>

      <FlightListDateSelector
        colors={colors}
        selectedDateKey={selectedDateKey}
        availableDateKeys={availableDateKeys}
        onDateChange={onDateChange}
        onPreviousDate={onPreviousDate}
        onNextDate={onNextDate}
      />

      <View
        style={{
          ...styles.searchBlock,
          borderBottomColor: colors.borderPrimary,
        }}
      >
        <View
          style={{
            ...styles.searchField,
            borderColor: colors.borderPrimary,
          }}
        >
          <SearchOutlined size={28} color={colors.textPrimary} />
          <TextInput
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Procurar Voo"
            placeholderTextColor="#757575"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.orderRow}>
          <Text variant="heading-sm" style={styles.orderLabel}>
            Ordem:
          </Text>
          <View style={styles.orderChips}>
            <AppPressable
              onPress={() => onOrderChange(orderBy === 'eta' ? null : 'eta')}
              style={getOrderChipStyle(orderBy === 'eta')}
              accessibilityLabel="Ordenar por ETA"
            >
              {orderBy === 'eta' ? (
                <CheckOutlined size={18} color="#ffffff" />
              ) : null}
              <Text
                variant="heading-xs"
                style={{
                  ...styles.orderChipText,
                  color: orderBy === 'eta' ? '#ffffff' : '#303030',
                }}
              >
                ETA
              </Text>
            </AppPressable>

            <AppPressable
              onPress={() => onOrderChange(orderBy === 'etd' ? null : 'etd')}
              style={getOrderChipStyle(orderBy === 'etd')}
              accessibilityLabel="Ordenar por ETD"
            >
              {orderBy === 'etd' ? (
                <CheckOutlined size={18} color="#ffffff" />
              ) : null}
              <Text
                variant="heading-xs"
                style={{
                  ...styles.orderChipText,
                  color: orderBy === 'etd' ? '#ffffff' : '#303030',
                }}
              >
                ETD
              </Text>
            </AppPressable>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <TabletFlightListContent
          flights={flights}
          selectedFlightId={selectedFlightId}
          selectedFlightIds={selectedFlightIds}
          loading={loading}
          colors={colors}
          onSelectFlight={onSelectFlight}
        />
      </View>

      {canClose ? (
        <View
          style={{
            ...styles.footer,
            paddingBottom: (styles.footer.paddingVertical ?? 0) + bottomSafeSpacing,
            borderTopColor: colors.borderPrimary,
          }}
        >
          <AppPressable
            onPress={onClose}
            style={{
              ...styles.footerButton,
              borderColor: colors.interactionSoftDefault,
            }}
            accessibilityLabel="Cerrar fila de vuelos"
          >
            <Text
              variant="heading-xs"
              style={{ color: colors.interactionSoftDefault }}
            >
              Cerrar
            </Text>
          </AppPressable>
        </View>
      ) : null}
    </View>
  );
};
