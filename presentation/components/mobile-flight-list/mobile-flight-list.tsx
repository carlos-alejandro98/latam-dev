import React from 'react';
import { ActivityIndicator, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components';

import type { Flight } from '@/domain/entities/flight';
import { AppPressable } from '@/presentation/components/common/app-pressable';
import { FlightListDateSelector } from '@/presentation/components/flight-list/flight-list-date-selector';
import {
  CheckOutlined,
  DoubleCaretLeftOutlined,
  SearchOutlined,
  SyncOutlined,
} from '@/presentation/components/common/icons';
import { getPanelColors } from '@/presentation/components/flight-list/flight-list-theme';
import type { OrderKey } from '@/presentation/components/flight-list/flight-list.types';
import { MobileText as Text } from '@/presentation/components/mobile/mobile-text';

import { MobileFlightListContent } from './mobile-flight-list-content';
import { styles } from './mobile-flight-list.styles';

interface MobileFlightListProps {
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
  refreshing?: boolean;
  onRefresh?: () => void;
}

const getOrderChipStyle = (selected: boolean) => {
  return [
    styles.orderChip,
    selected ? styles.orderChipActive : styles.orderChipIdle,
  ];
};

export const MobileFlightList: React.FC<MobileFlightListProps> = ({
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
  refreshing = false,
  onRefresh,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const colors = getPanelColors(theme);
  const handleRefreshPress = () => {
    onRefresh?.();
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          ...styles.headerBar,
          paddingTop: styles.headerBar.paddingVertical + insets.top,
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
          <DoubleCaretLeftOutlined size={24} color={colors.textPrimary} />
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
        <View style={styles.searchRow}>
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
              placeholder="Pesquise voos ou prefixo"
              placeholderTextColor="#757575"
              style={styles.searchInput}
            />
          </View>

          <AppPressable
            onPress={handleRefreshPress}
            disabled={!onRefresh || refreshing}
            style={{
              ...styles.refreshButton,
              opacity: !onRefresh || refreshing ? 0.7 : 1,
            }}
            accessibilityLabel="Atualizar lista de voos"
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <SyncOutlined size={24} color="#ffffff" />
            )}
          </AppPressable>
        </View>

        <View style={styles.orderRow}>
          <Text variant="label-sm" style={styles.orderLabel}>
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
                style={{ color: orderBy === 'eta' ? '#ffffff' : '#303030' }}
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
                style={{ color: orderBy === 'etd' ? '#ffffff' : '#303030' }}
              >
                ETD
              </Text>
            </AppPressable>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <MobileFlightListContent
          flights={flights}
          selectedFlightId={selectedFlightId}
          selectedFlightIds={selectedFlightIds}
          loading={loading}
          colors={colors}
          onSelectFlight={onSelectFlight}
        />
      </View>
    </View>
  );
};
