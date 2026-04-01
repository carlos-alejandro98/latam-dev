import React from 'react';

import { AppPressable } from '@/presentation/components/common/app-pressable';
import { Box, Tag } from '@/presentation/components/design-system';

import type { PanelColors } from './flight-list.types';
import {
  DoubleCaretRightOutlined,
  FlightAirport,
  FlightTop,
  SearchOutlined,
} from './icons';
import { styles } from './flight-list.styles';

export interface FlightListCollapsedProps {
  colors: PanelColors;
  mineCount: number;
  othersCount: number;
  onToggleCollapse: () => void;
}

const collapsedHeaderStyle = (colors: PanelColors) => ({
  ...styles.collapsedHeader,
  backgroundColor: colors.surfacePrimary,
  borderBottomColor: colors.borderPrimary,
});

const collapsedIconStyle = (colors: PanelColors) => ({
  ...styles.collapsedIconButton,
  backgroundColor: colors.surfacePrimary,
  borderColor: colors.borderPrimary,
});

export const FlightListCollapsed = React.memo<FlightListCollapsedProps>(
  function FlightListCollapsed({
    colors,
    mineCount,
    othersCount,
    onToggleCollapse,
  }) {
    return (
      <Box style={styles.collapsedContainer}>
        <Box style={collapsedHeaderStyle(colors)}>
          <AppPressable
            onPress={onToggleCollapse}
            style={
              styles.toggleButton as React.ComponentProps<
                typeof AppPressable
              >['style']
            }
            accessibilityLabel="Expandir menu de voos"
          >
            <DoubleCaretRightOutlined size={32} />
          </AppPressable>
        </Box>
        <Box style={styles.collapsedIcons}>
          <Box style={styles.collapsedIconBlock}>
            <Box style={collapsedIconStyle(colors)}>
              <SearchOutlined size={32} color={colors.textTertiary} />
            </Box>
          </Box>
          <Box style={styles.collapsedIconBlock}>
            <Box style={collapsedIconStyle(colors)}>
              <FlightTop size={32} color={colors.iconInfo} />
            </Box>
            <Tag variant="base" type="indigo" label={String(mineCount)} />
          </Box>
          <Box style={styles.collapsedIconBlock}>
            <Box style={collapsedIconStyle(colors)}>
              <FlightAirport size={32} color={colors.iconInfo} />
            </Box>
            <Tag variant="base" type="indigo" label={String(othersCount)} />
          </Box>
        </Box>
      </Box>
    );
  },
);
