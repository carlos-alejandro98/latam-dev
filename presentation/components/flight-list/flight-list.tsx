import React from 'react';
import { Box } from '@/presentation/components/design-system';
import { useTheme } from 'styled-components';

import type { Flight } from '@/domain/entities/flight';
import type { OrderKey } from './flight-list.types';

import { FLIGHT_LIST_COLLAPSED_WIDTH } from './flight-list.constants';
import { getPanelColors } from './flight-list-theme';
import { FlightListHeader } from './flight-list-header';
import { FlightListContent } from './flight-list-content';
import { FlightListCollapsed } from './flight-list-collapsed';
import { styles } from './flight-list.styles';

export interface FlightListProps {
  flights: Flight[];
  loading: boolean;
  collapsed: boolean;
  searchQuery: string;
  orderBy: OrderKey | null;
  selectedDateKey: string | null;
  availableDateKeys: string[];
  selectedFlightId?: string | null;
  selectedFlightIds?: string[];
  panelWidth: number;
  onToggleCollapse: () => void;
  onSearchChange: (value: string) => void;
  onOrderChange: (value: OrderKey | null) => void;
  onDateChange: (value: string) => void;
  onPreviousDate: () => void;
  onNextDate: () => void;
  onSelectFlight?: (flightId: string) => void;
}

/**
 * Componente presentacional del listado de vuelos.
 * 100% controlado; una sola FlatList virtualizada dentro de Content.
 */
export const FlightList: React.FC<FlightListProps> = ({
  flights,
  loading,
  collapsed,
  searchQuery,
  orderBy,
  selectedDateKey,
  availableDateKeys,
  selectedFlightId,
  selectedFlightIds = [],
  panelWidth,
  onToggleCollapse,
  onSearchChange,
  onOrderChange,
  onDateChange,
  onPreviousDate,
  onNextDate,
  onSelectFlight,
}) => {
  const theme = useTheme();
  const colors = getPanelColors(theme);

  const selectedFlightIdSet = new Set(selectedFlightIds);
  const mineCount = flights.filter((flight) =>
    selectedFlightIdSet.has(flight.flightId),
  ).length;
  const othersCount = flights.length - mineCount;

  const resolvedWidth = collapsed ? FLIGHT_LIST_COLLAPSED_WIDTH : panelWidth;
  const containerStyle = {
    ...styles.container,
    backgroundColor: collapsed
      ? colors.surfacePrimary
      : colors.backgroundSecondary,
    borderRightColor: colors.borderPrimary,
    width: collapsed ? resolvedWidth : 'max-content',
    minWidth: collapsed ? resolvedWidth : 'max-content',
    maxWidth: collapsed ? resolvedWidth : 'max-content',
    flexGrow: 0,
    flexShrink: 0,
    overflow: 'hidden',
  };

  return (
    <Box style={containerStyle}>
      {collapsed ? (
        <FlightListCollapsed
          colors={colors}
          mineCount={mineCount}
          othersCount={othersCount}
          onToggleCollapse={onToggleCollapse}
        />
      ) : (
        <Box style={styles.content}>
          <FlightListHeader
            colors={colors}
            onToggleCollapse={onToggleCollapse}
            searchValue={searchQuery}
            onSearchChange={onSearchChange}
            orderBy={orderBy}
            onOrderChange={onOrderChange}
            selectedDateKey={selectedDateKey}
            availableDateKeys={availableDateKeys}
            onDateChange={onDateChange}
            onPreviousDate={onPreviousDate}
            onNextDate={onNextDate}
          />
          <Box style={styles.content}>
            <FlightListContent
              flights={flights}
              selectedFlightId={selectedFlightId}
              selectedFlightIds={selectedFlightIds}
              loading={loading}
              colors={colors}
              onSelectFlight={onSelectFlight}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};