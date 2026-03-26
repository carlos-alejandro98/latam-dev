import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';

import type { Flight } from '@/domain/entities/flight';
import { Spinner } from '@/presentation/components/design-system';
import type { PanelColors } from '@/presentation/components/flight-list/flight-list.types';
import { useExpandedSections } from '@/presentation/hooks/use-expanded-sections';
import {
  useFlightVirtualizedData,
  type FlightRenderItem,
} from '@/presentation/hooks/use-flight-virtualized-data';
import { TabletText as Text } from '@/presentation/components/tablet/tablet-text';

import { TabletFlightListItem } from './tablet-flight-list-item';
import { TabletFlightListSectionHeader } from './tablet-flight-list-section-header';
import { styles } from './tablet-flight-list.styles.runtime';

interface SectionSlice {
  header: FlightRenderItem;
  content: FlightRenderItem[];
}

const splitDataBySection = (data: FlightRenderItem[]) => {
  const othersIndex = data.findIndex(
    (item) => item.type === 'section' && item.sectionId === 'others',
  );
  const mineHeader = data[0];
  const mineContent =
    othersIndex < 0 ? data.slice(1) : data.slice(1, othersIndex);

  if (othersIndex < 0) {
    return { mine: { header: mineHeader, content: mineContent }, others: null };
  }

  return {
    mine: { header: mineHeader, content: mineContent },
    others: {
      header: data[othersIndex],
      content: data.slice(othersIndex + 1),
    },
  };
};

export interface TabletFlightListContentProps {
  flights: Flight[];
  selectedFlightId?: string | null;
  selectedFlightIds: string[];
  loading: boolean;
  colors: PanelColors;
  onSelectFlight?: (flightId: string) => void;
}

export const TabletFlightListContent = React.memo<TabletFlightListContentProps>(
  ({
    flights,
    selectedFlightId,
    selectedFlightIds,
    loading,
    colors,
    onSelectFlight,
  }) => {
    const { expandedSections, toggleSection } = useExpandedSections();
    const data = useFlightVirtualizedData({
      flights,
      selectedFlightIds,
      expandedSections,
    });

    const { mine, others } = useMemo(() => splitDataBySection(data), [data]);

    const renderSectionFlights = (items: FlightRenderItem[]) => {
      if (!items.length) {
        return null;
      }

      const emptyItem = items.find((item) => item.type === 'empty_section');
      if (emptyItem) {
        return (
          <View style={styles.emptySection}>
            <Text variant="label-sm" color="secondary">
              Nenhum voo atribuído.
            </Text>
          </View>
        );
      }

      const flightsToRender = items.flatMap((item) =>
        item.type === 'date_group' && item.flights ? item.flights : [],
      );

      return (
        <View style={styles.sectionFlights}>
          {flightsToRender.map((flight) => (
            <TabletFlightListItem
              key={flight.flightId}
              flight={flight}
              selected={flight.flightId === selectedFlightId}
              colors={colors}
              onSelectFlight={onSelectFlight}
            />
          ))}
        </View>
      );
    };

    if (loading) {
      return (
        <View style={styles.loadingState}>
          <Spinner size="normal" />
        </View>
      );
    }

    if (!data.length) {
      return (
        <View style={styles.emptyState}>
          <Text variant="label-sm" color="secondary">
            No hay voos para mostrar.
          </Text>
        </View>
      );
    }

    const renderSection = (
      slice: SectionSlice | null,
      withTopBorder: boolean,
    ) => {
      if (
        !slice ||
        slice.header.type !== 'section' ||
        slice.header.sectionId == null
      ) {
        return null;
      }

      return (
        <View
          key={slice.header.key}
          style={{
            ...styles.sectionBlock,
            borderTopWidth: withTopBorder ? 1 : 0,
            borderTopColor: colors.borderPrimary,
          }}
        >
          <TabletFlightListSectionHeader
            label={slice.header.label ?? ''}
            sectionId={slice.header.sectionId}
            count={slice.header.count ?? 0}
            expanded={expandedSections[slice.header.sectionId]}
            colors={colors}
            onToggle={toggleSection}
          />
          {expandedSections[slice.header.sectionId]
            ? renderSectionFlights(slice.content)
            : null}
        </View>
      );
    };

    return (
      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.listScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderSection(mine, false)}
        {renderSection(others, true)}
      </ScrollView>
    );
  },
);

TabletFlightListContent.displayName = 'TabletFlightListContent';
