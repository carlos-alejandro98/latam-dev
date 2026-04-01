import { useMemo } from 'react';
import type { Flight } from '@/domain/entities/flight';
import { groupFlightsByDate } from '@/presentation/components/flight-list/utils/flight-list-grouping';
import { formatDate } from '@/presentation/view-models/flight-view-model';

export type SectionId = 'mine' | 'others';

export interface FlightRenderItem {
  type: 'section' | 'date_group' | 'flight' | 'empty_section';
  key: string;
  label?: string;
  count?: number;
  sectionId?: SectionId;
  flight?: Flight;
  /** Solo en date_group: fecha formateada para mostrar. */
  dateLabel?: string;
  /** Solo en date_group: vuelos de esa fecha. */
  flights?: Flight[];
}

export interface ExpandedSections {
  mine: boolean;
  others: boolean;
}

interface Params {
  flights: Flight[];
  selectedFlightIds: string[];
  expandedSections: ExpandedSections;
}

/**
 * Genera estructura plana optimizada para FlatList.
 * Una sola lista virtualizada (section | empty_section | date_group…).
 *
 * Cada date_group agrupa una fecha + sus vuelos en un solo ítem para control centralizado de padding/gap.
 *
 * Meus Voos (mine): sin selección → header + empty_section. Con selección → date_group por fecha (orden cronológico).
 *
 * selectedSet memoizado; appendSection local sin mutar estado externo.
 */
export const useFlightVirtualizedData = ({
  flights,
  selectedFlightIds,
  expandedSections,
}: Params): FlightRenderItem[] => {
  const selectedSet = useMemo(
    () => new Set(selectedFlightIds),
    [selectedFlightIds],
  );

  return useMemo(() => {
    if (!flights.length) return [];

    const items: FlightRenderItem[] = [];
    const mine: Flight[] = [];
    const others: Flight[] = [];

    for (const flight of flights) {
      if (selectedSet.has(flight.flightId)) {
        mine.push(flight);
      } else {
        others.push(flight);
      }
    }

    const appendSection = (
      id: SectionId,
      label: string,
      data: Flight[],
    ): void => {
      const expanded = expandedSections[id];

      items.push({
        type: 'section',
        key: `section-${id}`,
        label,
        count: data.length,
        sectionId: id,
      });

      if (id === 'mine' && data.length === 0 && expanded) {
        items.push({
          type: 'empty_section',
          key: 'empty-mine',
          sectionId: 'mine',
        });
      }

      if (!data.length || !expanded) return;

      const dateMap = groupFlightsByDate(data);
      const sortedDates = Array.from(dateMap.keys()).sort();

      for (const dateKey of sortedDates) {
        const flightsForDate = dateMap.get(dateKey)!;
        items.push({
          type: 'date_group',
          key: `date-${id}-${dateKey}`,
          dateLabel: formatDate(dateKey) || dateKey,
          flights: flightsForDate,
        });
      }
    };

    appendSection('mine', 'Meus Voos', mine);
    appendSection('others', 'Otros Voos', others);

    return items;
  }, [flights, selectedSet, expandedSections]);
};
