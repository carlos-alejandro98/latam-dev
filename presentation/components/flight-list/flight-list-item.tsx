import React, { useMemo } from 'react';
import { View } from 'react-native';
import styled from 'styled-components';

import type { Flight } from '@/domain/entities/flight';
import { AppPressable } from '@/presentation/components/common/app-pressable';
import { Box, Tag, Text } from '@/presentation/components/design-system';
import {
  createFlightViewModel,
  type FlightViewModel,
} from '@/presentation/view-models/flight-view-model';

import type { PanelColors } from './flight-list.types';
import { FlightLanding } from './icons';
import { styles } from './flight-list.styles';

const statusTypeToBarColor: Record<FlightViewModel['statusType'], string> = {
  success: '#07605B',
  warning: '#C77B00',
  error: '#B71C1C',
  neutral: '#D9D9D9',
};

const statusTypeToTag: Record<
  Exclude<FlightViewModel['statusType'], 'neutral'>,
  { label: string; type: 'successSoftDot' | 'warningSoftDot' | 'errorSoftDot' }
> = {
  success: { label: 'Pontual', type: 'successSoftDot' },
  warning: { label: 'Apertado', type: 'warningSoftDot' },
  error: { label: 'Atrasado', type: 'errorSoftDot' },
};

const StatusTagStyled = styled(Tag)`
  svg {
    display: none;
  }
`;

const FUTURE_PRIORITY_BADGE_LABEL = '1°';

const getPriorityTag = (flight: Flight) => {
  const tatType = flight.tatType?.toUpperCase() ?? '';

  if (tatType.includes('FOCO')) {
    return {
      label: 'Foco',
      backgroundColor: '#c10f4b',
      color: '#ffffff',
    };
  }

  if (tatType.includes('CURTO')) {
    return {
      label: 'Curto',
      backgroundColor: '#b65f07',
      color: '#ffffff',
    };
  }

  return null;
};

export interface FlightListItemProps {
  flight: Flight;
  selected: boolean;
  colors: PanelColors;
  onSelectFlight?: (flightId: string) => void;
  isLast: boolean;
}

export const FlightListItem = React.memo<FlightListItemProps>(
  ({ flight, selected, colors, onSelectFlight, isLast }) => {
    const viewModel = useMemo<FlightViewModel>(
      () => createFlightViewModel(flight),
      [flight],
    );
    const { statusType } = viewModel;
    const flightNumber = flight.numberDeparture || flight.flightId;
    const arrivalNumber = flight.numberArrival ?? '';
    const origin = flight.origin ?? '';
    const destination = flight.destination ?? '';
    const aircraftPrefix = flight.aircraftPrefix || '--';
    const connectionLabel =
      [arrivalNumber, destination].filter(Boolean).join(' ') || '—';
    const mainTextColor = selected
      ? colors.interactionSoftDefault
      : colors.textPrimary;
    const statusBarColor = statusTypeToBarColor[statusType];
    const priorityTag = getPriorityTag(flight);
    const isCircularPriorityTag =
      priorityTag?.label === FUTURE_PRIORITY_BADGE_LABEL;
    const statusTag =
      statusType === 'neutral' ? null : statusTypeToTag[statusType];

    const borderWidth = selected ? 2 : 1;
    const outerRadius = 8;
    const innerRadius = outerRadius - borderWidth;

    return (
      <AppPressable
        onPress={() => onSelectFlight?.(flight.flightId)}
        style={{
          ...styles.cardPressable,
          marginBottom: isLast ? 0 : 12,
          borderWidth,
          borderColor: selected ? colors.borderInfo : colors.borderPrimary,
          borderRadius: outerRadius,
        }}
      >
        <View
          style={{
            ...styles.itemInner,
            borderRadius: innerRadius,
            backgroundColor: colors.surfacePrimary,
          }}
        >
          <View
            style={{
              ...styles.itemStatusBar,
              backgroundColor: statusBarColor,
              borderTopLeftRadius: innerRadius,
              borderBottomLeftRadius: innerRadius,
            }}
          />
          <View style={styles.itemBodyColumn}>
            <View style={styles.itemFlightNumberRow}>
              <Text variant="heading-xs" style={{ color: mainTextColor }}>
                {flightNumber}
              </Text>
              <Text
                variant="label-xs"
                style={{ fontSize: 12, color: mainTextColor }}
              >
                {destination || '—'}
              </Text>
            </View>
            <View style={styles.itemConnectionRow}>
              <FlightLanding size={14} color={colors.textPrimary} />
              <Text variant="label-xs" style={{ color: mainTextColor }}>
                {arrivalNumber}
              </Text>
              <Text
                align="center"
                variant="label-xs"
                style={{ fontSize: 12, color: mainTextColor }}
              >
                {origin || '—'}
              </Text>
            </View>
          </View>
          <View style={styles.itemRightColumn}>
            <View style={styles.itemTopBadges}>
              <View
                style={{
                  ...styles.itemAircraftTag,
                  borderColor: colors.borderPrimary,
                }}
              >
                <Text
                  variant="label-xs"
                  style={{ color: colors.textPrimary, fontSize: 12 }}
                >
                  {aircraftPrefix}
                </Text>
              </View>
              {priorityTag ? (
                <View
                  style={{
                    ...styles.itemPriorityTag,
                    ...(isCircularPriorityTag
                      ? {
                          width: 24,
                          height: 24,
                          minHeight: 24,
                          paddingHorizontal: 0,
                          paddingVertical: 0,
                          borderRadius: 999,
                        }
                      : null),
                    backgroundColor: priorityTag.backgroundColor,
                  }}
                >
                  <Text
                    variant="label-xs"
                    align="center"
                    style={{
                      color: priorityTag.color,
                      fontSize: isCircularPriorityTag ? 12 : 12,
                      lineHeight: isCircularPriorityTag ? 14 : undefined,
                      fontWeight: isCircularPriorityTag ? '700' : '600',
                    }}
                  >
                    {priorityTag.label}
                  </Text>
                </View>
              ) : null}
            </View>
            <View>
              <Text
                variant="label-xs"
                style={{ color: colors.textPrimary, fontSize: 12 }}
                bold={selected}
              >
                ETA {flight.etaTime ?? '--:--'} - STD{' '}
                {flight.stdTime ?? '--:--'}
              </Text>
            </View>
          </View>
        </View>
      </AppPressable>
    );
  },
);

FlightListItem.displayName = 'FlightListItem';
