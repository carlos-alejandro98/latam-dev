import React from 'react';

import { AppPressable } from '@/presentation/components/common/app-pressable';
import { Box, Tag, Text } from '@/presentation/components/design-system';
import type { SectionId } from '@/presentation/hooks/use-flight-virtualized-data';
import {
  ChevronDownOutlined,
  ChevronUpOutlined,
  FlightAirport,
  FlightTop,
} from './icons';

import type { PanelColors } from './flight-list.types';
import { styles } from './flight-list.styles';

export interface FlightSectionHeaderProps {
  label: string;
  sectionId: SectionId;
  count: number;
  expanded: boolean;
  onToggle: (sectionId: SectionId) => void;
  colors: PanelColors;
}

/**
 * Retorna el icono correspondiente al header de sección.
 */
const getSectionIcon = (
  label: string,
  colors: PanelColors,
): React.ReactNode => {
  if (label === 'Meus Voos') {
    return <FlightTop size={28} color={colors.iconInfo} />;
  }
  if (label === 'Otros Voos') {
    return <FlightAirport size={28} color={colors.iconInfo} />;
  }
  return null;
};

export const FlightSectionHeader = React.memo<FlightSectionHeaderProps>(
  function FlightSectionHeader({
    label,
    sectionId,
    count,
    expanded,
    onToggle,
    colors,
  }) {
    const icon = getSectionIcon(label, colors);
    const ToggleIcon = expanded ? ChevronUpOutlined : ChevronDownOutlined;

    return (
      <AppPressable
        onPress={() => onToggle(sectionId)}
        style={{ width: '100%' }}
        accessibilityRole="button"
      >
        <Box
          style={{
            ...styles.containerSectionVoosList,
            backgroundColor: colors.surfacePrimary,
          }}
        >
          <Box style={styles.sectionHeaderVoos}>
            <Box style={styles.sectionHeaderContentVoos}>
              <Box style={styles.sectionHeaderLeft}>
                {icon}
                <Text variant="heading-xs" color="tertiary">
                  {label}
                </Text>
              </Box>
              <Box style={styles.sectionHeaderRight}>
                <Tag variant="base" type="indigo" label={String(count)} />
                <ToggleIcon size={16} color={colors.iconInfo} />
              </Box>
            </Box>
          </Box>
        </Box>
      </AppPressable>
    );
  },
);
