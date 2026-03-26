import React, { useMemo } from 'react';
import { View } from 'react-native';

import type { Flight } from '@/domain/entities/flight';
import { AppPressable } from '@/presentation/components/common/app-pressable';
import { FlightLanding } from '@/presentation/components/flight-list/icons';
import type { PanelColors } from '@/presentation/components/flight-list/flight-list.types';
import { MobileText as Text } from '@/presentation/components/mobile/mobile-text';
import {
  createFlightViewModel,
  type FlightViewModel,
} from '@/presentation/view-models/flight-view-model';

import { styles } from './mobile-flight-list.styles';

const statusTypeToBarColor: Record<FlightViewModel['statusType'], string> = {
  success: '#0b6b62',
  warning: '#b65f07',
  error: '#c10f4b',
  neutral: '#0b6b62',
};

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

interface MobileFlightListItemProps {
  flight: Flight;
  selected: boolean;
  colors: PanelColors;
  onSelectFlight?: (flightId: string) => void;
}

export const MobileFlightListItem = React.memo<MobileFlightListItemProps>(
  ({ flight, selected, colors, onSelectFlight }) => {
    const viewModel = useMemo(() => createFlightViewModel(flight), [flight]);
    const mainTextColor = selected
      ? colors.interactionSoftDefault
      : colors.textPrimary;
    const statusBarColor = statusTypeToBarColor[viewModel.statusType];
    const priorityTag = getPriorityTag(flight);
    const isCircularPriorityTag =
      priorityTag?.label === FUTURE_PRIORITY_BADGE_LABEL;
    const aircraftPrefix = flight.aircraftPrefix || '--';

    return (
      <AppPressable
        onPress={() => onSelectFlight?.(flight.flightId)}
        style={styles.itemPressable}
      >
        <View
          style={{
            ...styles.itemCard,
            borderColor: selected ? colors.interactionSoftDefault : '#d3d3d3',
            borderWidth: selected ? 2 : 1,
          }}
        >
          <View
            style={{
              ...styles.itemStatusBar,
              backgroundColor: statusBarColor,
            }}
          />

          <View style={styles.itemContent}>
            <View style={styles.itemLeft}>
              <View style={styles.itemNumberRow}>
                <Text variant="heading-sm" style={{ color: mainTextColor }}>
                  {flight.numberDeparture || flight.flightId}
                </Text>
                <Text variant="label-sm" style={{ color: mainTextColor }}>
                  {flight.destination || '--'}
                </Text>
              </View>

              <View style={styles.itemConnectionRow}>
                <FlightLanding size={14} color={colors.textPrimary} />
                <Text
                  variant="label-sm"
                  style={{ color: colors.textPrimary, fontSize: 13 }}
                >
                  {flight.numberArrival || '--'}
                </Text>
                <Text
                  variant="label-sm"
                  style={{ color: colors.textPrimary, fontSize: 13 }}
                >
                  {flight.origin || '--'}
                </Text>
              </View>
            </View>

            <View style={styles.itemRight}>
              <View style={styles.itemTopBadges}>
                <View
                  style={{
                    ...styles.itemAircraftTag,
                    borderColor: colors.borderPrimary,
                  }}
                >
                  <Text
                    variant="label-sm"
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
                            width: 38,
                            height: 38,
                            minHeight: 38,
                            paddingHorizontal: 0,
                          }
                        : null),
                      backgroundColor: priorityTag.backgroundColor,
                    }}
                  >
                    <Text
                      variant={
                        isCircularPriorityTag ? 'heading-sm' : 'heading-xs'
                      }
                      style={{
                        color: priorityTag.color,
                        fontSize: isCircularPriorityTag ? 20 : undefined,
                        lineHeight: isCircularPriorityTag ? 22 : undefined,
                      }}
                    >
                      {priorityTag.label}
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text
                variant="label-sm"
                style={{ color: colors.textPrimary, fontSize: 13 }}
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

MobileFlightListItem.displayName = 'MobileFlightListItem';
