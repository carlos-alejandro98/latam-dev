import React from 'react';
import { View } from 'react-native';

import { AppPressable } from '@/presentation/components/common/app-pressable';
import {
  ChevronDownOutlined,
  ChevronUpOutlined,
  FlightAirport,
  FlightTop,
} from '@/presentation/components/flight-list/icons';
import type { PanelColors } from '@/presentation/components/flight-list/flight-list.types';
import type { SectionId } from '@/presentation/hooks/use-flight-virtualized-data';
import { MobileText as Text } from '@/presentation/components/mobile/mobile-text';

import { styles } from './mobile-flight-list.styles';

interface MobileFlightListSectionHeaderProps {
  label: string;
  sectionId: SectionId;
  count: number;
  expanded: boolean;
  colors: PanelColors;
  onToggle: (sectionId: SectionId) => void;
}

const getSectionIcon = (sectionId: SectionId, colors: PanelColors) => {
  if (sectionId === 'mine') {
    return <FlightTop size={22} color={colors.iconInfo} />;
  }

  return <FlightAirport size={22} color={colors.iconInfo} />;
};

export const MobileFlightListSectionHeader =
  React.memo<MobileFlightListSectionHeaderProps>(
    ({ label, sectionId, count, expanded, colors, onToggle }) => {
      const ToggleIcon = expanded ? ChevronUpOutlined : ChevronDownOutlined;

      return (
        <AppPressable
          onPress={() => onToggle(sectionId)}
          style={{ width: '100%' }}
          accessibilityRole="button"
        >
          <View
            style={{
              ...styles.sectionHeader,
              borderBottomColor: colors.borderPrimary,
            }}
          >
            <View style={styles.sectionHeaderLeft}>
              {getSectionIcon(sectionId, colors)}
              <Text
                variant="heading-xs"
                style={{ color: colors.interactionSoftDefault }}
              >
                {label}
              </Text>
            </View>

            <View style={styles.sectionHeaderRight}>
              <View
                style={{
                  ...styles.sectionCount,
                  backgroundColor: '#e6e7fb',
                }}
              >
                <Text
                  variant="label-sm"
                  style={{ color: colors.interactionSoftDefault }}
                >
                  {String(count)}
                </Text>
              </View>
              <ToggleIcon size={18} color={colors.interactionSoftDefault} />
            </View>
          </View>
        </AppPressable>
      );
    },
  );

MobileFlightListSectionHeader.displayName = 'MobileFlightListSectionHeader';
