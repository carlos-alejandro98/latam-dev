import React, { useCallback, useMemo, useState } from 'react';
import {
  type LayoutChangeEvent,
  type ListRenderItemInfo,
  Platform,
  View,
} from 'react-native';

import type { Flight } from '@/domain/entities/flight';
import { Box, Spinner, Text } from '@/presentation/components/design-system';
import {
  useFlightVirtualizedData,
  type FlightRenderItem,
} from '@/presentation/hooks/use-flight-virtualized-data';
import { useExpandedSections } from '@/presentation/hooks/use-expanded-sections';

import type { PanelColors } from './flight-list.types';
import { FlightListItem } from './flight-list-item';
import { FlightSectionHeader } from './flight-list-section-header-list';
import { FlightListVirtualized } from './flight-list-virtualized';
import { styles } from './flight-list.styles';

interface SectionSlice {
  header: FlightRenderItem;
  content: FlightRenderItem[];
}

/** Parte en Meus Voos y Otros Voos; cada uno con header (section) y content filtrado por fecha. */
function splitDataBySection(data: FlightRenderItem[]): {
  mine: SectionSlice;
  others: SectionSlice | null;
} {
  const othersIndex = data.findIndex(
    (item) => item.type === 'section' && item.sectionId === 'others',
  );
  const mineHeader = data[0];
  const mineContent =
    othersIndex < 0 ? data.slice(1) : data.slice(1, othersIndex);
  if (othersIndex < 0) {
    return { mine: { header: mineHeader, content: mineContent }, others: null };
  }
  const othersHeader = data[othersIndex];
  const othersContent = data.slice(othersIndex + 1);
  return {
    mine: { header: mineHeader, content: mineContent },
    others: { header: othersHeader, content: othersContent },
  };
}

/** Alturas en px por tipo de ítem (alineadas con flight-list.styles). */
const ITEM_HEIGHTS = {
  section: 58,
  empty_section: 48,
} as const;

const FLIGHT_ITEM_HEIGHT = 68;

/**
 * Altura total del bloque de vuelos para la fecha seleccionada.
 * = paddingTop(16) + n*68 + (n-1)*12 + paddingBottom(16) = 20 + 80*n
 */
function getDateGroupHeight(flightsCount: number): number {
  if (flightsCount <= 0) return 0;
  return 20 + 80 * flightsCount;
}

export interface FlightListContentProps {
  flights: Flight[];
  selectedFlightId?: string | null;
  selectedFlightIds: string[];
  loading: boolean;
  colors: PanelColors;
  onSelectFlight?: (flightId: string) => void;
}

const FlightListLoading = React.memo(function FlightListLoading() {
  return (
    <Box style={styles.loadingContainer}>
      <Spinner size="normal" />
      <Text variant="label-sm" color="secondary">
        Cargando voos...
      </Text>
    </Box>
  );
});

const FlightListEmpty = React.memo(function FlightListEmpty() {
  return (
    <Box style={styles.emptyContainer}>
      <Text variant="label-sm" color="secondary">
        No hay voos para mostrar.
      </Text>
    </Box>
  );
});

const ListSeparator = React.memo(function ListSeparator() {
  return <Box style={styles.separator} />;
});

/** Altura máxima de la lista "Meus Voos": crece con el contenido hasta este límite. */
const MAX_MINE_LIST_HEIGHT = 400;
const SEPARATOR_HEIGHT = 24;

/** Altura total del contenido de una sección (ítems + separadores + padding del list). */
function getSectionContentHeight(
  content: FlightRenderItem[],
  getItemHeight: (index: number, item: FlightRenderItem) => number,
): number {
  const paddingVertical = 32; // sectionList paddingTop 16 + paddingBottom 16
  const itemsHeight = content.reduce(
    (sum, item, index) => sum + getItemHeight(index, item),
    0,
  );
  const separatorsHeight =
    content.length > 1 ? (content.length - 1) * SEPARATOR_HEIGHT : 0;
  return paddingVertical + itemsHeight + separatorsHeight;
}

export const FlightListContent = React.memo<FlightListContentProps>(
  function FlightListContent({
    flights,
    selectedFlightId,
    selectedFlightIds,
    loading,
    colors,
    onSelectFlight,
  }) {
    const { expandedSections, toggleSection } = useExpandedSections();

    const data = useFlightVirtualizedData({
      flights,
      selectedFlightIds,
      expandedSections,
    });

    const { mine: mineSlice, others: othersSlice } = useMemo(
      () => splitDataBySection(data),
      [data],
    );

    const [heightMine, setHeightMine] = useState(0);
    const [heightOthers, setHeightOthers] = useState(0);
    const onLayoutMine = useCallback((e: LayoutChangeEvent) => {
      const { height } = e.nativeEvent.layout;
      setHeightMine((h) => (h !== height ? height : h));
    }, []);
    const onLayoutOthers = useCallback((e: LayoutChangeEvent) => {
      const { height } = e.nativeEvent.layout;
      setHeightOthers((h) => (h !== height ? height : h));
    }, []);

    const keyExtractor = useCallback((item: FlightRenderItem) => item.key, []);

    const getItemHeight = useCallback(
      (_index: number, item: FlightRenderItem) => {
        if (item.type === 'date_group') {
          return getDateGroupHeight(item.flights?.length ?? 0);
        }
        if (item.type === 'flight') return FLIGHT_ITEM_HEIGHT;
        if (item.type === 'section' && item.sectionId === 'others') {
          return ITEM_HEIGHTS.section + 1;
        }
        const height = ITEM_HEIGHTS[item.type];
        return height ?? 68;
      },
      [],
    );

    const renderItem = useCallback(
      (contentLength: number) =>
        ({ item, index }: ListRenderItemInfo<FlightRenderItem>) => {
          if (item.type === 'section' && item.sectionId != null) {
            const header = (
              <FlightSectionHeader
                label={item.label ?? ''}
                sectionId={item.sectionId}
                count={item.count ?? 0}
                expanded={expandedSections[item.sectionId]}
                onToggle={toggleSection}
                colors={colors}
              />
            );
            if (item.sectionId === 'others') {
              return (
                <Box
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: colors.borderPrimary,
                  }}
                >
                  {header}
                </Box>
              );
            }
            return header;
          }
          if (item.type === 'empty_section') {
            return (
              <Box style={styles.sectionEmptyMessage}>
                <Text variant="label-sm" color="secondary" align="center">
                  Nenhum voo atribuído.
                </Text>
              </Box>
            );
          }
          if (item.type === 'date_group' && item.flights != null) {
            const isLastDateGroup = index === contentLength - 1;
            return (
              <Box style={styles.dateGroupContainer}>
                {item.flights.map((flight, flightIndex) => (
                  <FlightListItem
                    key={flight.flightId}
                    flight={flight}
                    selected={flight.flightId === selectedFlightId}
                    colors={colors}
                    onSelectFlight={onSelectFlight}
                    isLast={
                      isLastDateGroup &&
                      flightIndex === item.flights!.length - 1
                    }
                  />
                ))}
              </Box>
            );
          }
          return null;
        },
      [
        colors,
        expandedSections,
        onSelectFlight,
        selectedFlightId,
        toggleSection,
      ],
    );

    if (loading) return <FlightListLoading />;
    if (!data.length) return <FlightListEmpty />;

    const renderSectionBlock = (
      slice: SectionSlice | null,
      sectionHeight: number,
      onLayout: (e: LayoutChangeEvent) => void,
      withBorder: boolean,
      isAutoHeight: boolean,
    ) => {
      if (
        !slice ||
        slice.header.type !== 'section' ||
        slice.header.sectionId == null
      )
        return null;
      const listHeight = isAutoHeight
        ? Math.min(
            getSectionContentHeight(slice.content, getItemHeight),
            MAX_MINE_LIST_HEIGHT,
          )
        : sectionHeight > 0
          ? sectionHeight - ITEM_HEIGHTS.section
          : 400;
      const blockStyle = isAutoHeight
        ? styles.sectionBlockAutoHeight
        : styles.sectionBlock;
      return (
        <View
          style={{
            ...blockStyle,
            ...(withBorder
              ? {
                  borderTopWidth: 1,
                  borderTopColor: colors.borderPrimary,
                }
              : {}),
          }}
          onLayout={onLayout}
        >
          <FlightSectionHeader
            label={slice.header.label ?? ''}
            sectionId={slice.header.sectionId}
            count={slice.header.count ?? 0}
            expanded={expandedSections[slice.header.sectionId]}
            onToggle={toggleSection}
            colors={colors}
          />
          {expandedSections[slice.header.sectionId] && (
            <View style={isAutoHeight ? undefined : styles.sectionListWrapper}>
              <FlightListVirtualized
                data={slice.content}
                keyExtractor={keyExtractor}
                renderItem={renderItem(slice.content.length)}
                getItemHeight={getItemHeight}
                itemSeparator={ListSeparator}
                contentContainerStyle={styles.sectionList}
                style={{
                  ...styles.sectionListScroll,
                  ...(Platform.OS !== 'web' && !isAutoHeight
                    ? styles.sectionListWrapper
                    : {}),
                }}
                height={listHeight}
              />
            </View>
          )}
        </View>
      );
    };

    return (
      <Box
        style={{
          ...styles.content,
          ...styles.sectionListContainer,
          ...styles.sectionListNoScroll,
        }}
        id="flight-list-content"
      >
        {renderSectionBlock(mineSlice, heightMine, onLayoutMine, false, true)}
        {othersSlice &&
          renderSectionBlock(
            othersSlice,
            heightOthers,
            onLayoutOthers,
            true,
            false,
          )}
      </Box>
    );
  },
);
