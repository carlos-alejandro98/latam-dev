import { useRef, useState, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';

import { FlightRemoteBoarding } from '@hangar/react-icons/core/latam/Flight/FlightRemoteBoarding';
import { SeatEconomy } from '@hangar/react-icons/core/latam/Seat/SeatEconomy';

import { FlightGanttTimeline } from '@/presentation/components/flight-gantt-timeline';
import {
  Box,
  Spinner,
  Tag,
  Text,
} from '@/presentation/components/design-system';
import { FlightInfoEventsPanel } from './flight-info-events-panel';

import type { FlightInfoPanelProps } from './flight-info-panel.types';
import { styles } from './flight-info-panel.styles.web';

// Threshold below which cards stack vertically.
// At 1440px: left panel ~270px, right panel ~270px → mainContent ~900px with both open.
// We trigger compact when mainContent < 1100px so that even one open panel causes stacking.
const COMPACT_BREAKPOINT = 998;

// --- Styled components for the flight header row ---

const FlightCardsRow = styled.div<{ $compact: boolean }>`
  display: flex;
  flex-direction: ${({ $compact }) => ($compact ? 'column' : 'row')};
  align-items: stretch;
  border: 1px solid #d9d9d9;
  border-radius: 8px 8px 0 0;
  background: #fff;
  width: 100%;
  box-sizing: border-box;
  /* Suaviza el reflow cuando los hijos cambian de tamaño */
  transition: all 0.3s ease;
`;

/* Shared base for both flight cards */
const FlightCardBase = styled.div<{ $compact: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px 12px;
  gap: 6px;
  flex: 1 1 0;
  min-width: 0;
  border-left: 4px solid #0d12ab;
  border-right: 1px solid #d9d9d9;
  border-bottom: ${({ $compact }) => ($compact ? '1px solid #d9d9d9' : 'none')};
  box-sizing: border-box;
  transition: flex 0.3s ease, border 0.3s ease, opacity 0.25s ease;

  /* Force the date Tag to be a compact inline pill — never wrap or overflow */
  [data-tag],
  span[class*="Tag"],
  div[class*="Tag"] {
    white-space: nowrap;
    flex-shrink: 0;
    font-size: 11px !important;
    line-height: 1.4 !important;
    height: auto !important;
    min-height: unset !important;
  }
`;

const SavingOverlay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 16px;
  background: #f0f4ff;
  border-bottom: 1px solid #d9d9d9;
  font-style: italic;
`;

/* ARRIVAL — independent card div */
const ArrivalCard = styled(FlightCardBase)``;

/* DEPARTURE — independent card div */
const DepartureCard = styled(FlightCardBase)``;

const PrefixoBox = styled.div<{ $compact: boolean }>`
  display: flex;
  flex-direction: ${({ $compact }) => ($compact ? 'row' : 'column')};
  align-items: center;
  justify-content: center;
  gap: ${({ $compact }) => ($compact ? '16px' : '2px')};
  padding: 8px 14px;
  background: #f2f2f2;
  flex: ${({ $compact }) => ($compact ? '1 1 auto' : '0 0 100px')};
  border-right: 1px solid #d9d9d9;
  border-bottom: ${({ $compact }) => ($compact ? '1px solid #d9d9d9' : 'none')};
  box-sizing: border-box;
  white-space: nowrap;
  transition: flex 0.3s ease, flex-direction 0.3s ease, border 0.3s ease;
`;

/* TEMPO DISPONÍVEL — fixed width in row mode, fills width in compact */
const TempoBox = styled.div<{ $compact: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 16px;
  flex: ${({ $compact }) => ($compact ? '1 1 auto' : '0 0 160px')};
  min-width: 0;
  box-sizing: border-box;
  transition: flex 0.3s ease;
`;

/* Top row inside a card: label+flight+date on left, pax+station on right */
const CardHeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
`;

const CardHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 1;
  min-width: 0;
  overflow: hidden;
`;

const CardHeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  white-space: nowrap;
`;

/* Bottom row: info items on left, divider+tag+time on right */
const CardBottomRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
`;

const CardBottomLeft = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
  flex-shrink: 1;
  min-width: 0;
  flex-wrap: nowrap;
`;

const CardBottomRight = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
`;

type PanelColors = {
  borderPrimary: string;
  interactionSoftDefault: string;
  surfaceSecondary: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
};

type InfoItemProps = {
  label: string;
  value: string;
};

const getPanelColors = (theme: ReturnType<typeof useTheme>): PanelColors => {
  return {
    borderPrimary: theme?.tokens?.color?.border?.primary ?? '#d9d9d9',
    interactionSoftDefault:
      theme?.tokens?.color?.interaction?.softDefault ?? '#2c31c9',
    surfaceSecondary: theme?.tokens?.color?.surface?.secondary ?? '#f2f2f2',
    textPrimary: theme?.tokens?.color?.text?.primary ?? '#3a3a3a',
    textSecondary: theme?.tokens?.color?.text?.secondary ?? '#626262',
    textTertiary: theme?.tokens?.color?.text?.tertiary ?? '#070b64',
  };
};

const InfoItem = ({ label, value }: InfoItemProps) => {
  return (
    <Box style={styles.infoItem}>
      <Text variant="label-xs" color="secondary">
        {label}
      </Text>
      <Text variant="label-xs">{value}</Text>
    </Box>
  );
};

const StatusTag = styled(Tag)`
  svg {
    display: none;
  }
`;

export const FlightInfoPanel = ({
  viewModel,
  loading,
  error,
  onRowClick,
}: FlightInfoPanelProps) => {
  const theme = useTheme();
  const colors = getPanelColors(theme);

  // Observe the actual width of the center area to decide layout direction
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setIsCompact(entry.contentRect.width < COMPACT_BREAKPOINT);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (loading) {
    return (
      <Box style={styles.loadingWrapper}>
        <Box style={styles.loadingContent}>
          <Spinner size="normal" />
          <Text variant="label-sm" color="secondary">
            Cargando detalle del vuelo...
          </Text>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box style={styles.loadingWrapper}>
        <Box style={styles.loadingContent}>
          <Text variant="label-sm" color="secondary">
            No se pudo cargar el detalle del vuelo.
          </Text>
        </Box>
      </Box>
    );
  }

  if (!viewModel) {
    return null;
  }

  return (
    <Box style={styles.panelContainer}>
      <Box ref={wrapperRef} style={styles.mainContent}>
        <Box style={styles.wrapperSupScroll}>
          <FlightCardsRow $compact={isCompact}>
            {/* ARRIVAL — independent card */}
            <ArrivalCard $compact={isCompact}>
              <CardHeaderRow>
                <CardHeaderLeft>
                  <Text variant="label-xs" color="tertiary">
                    {viewModel.arrival.title}
                  </Text>
                  <Text variant="label-md">{viewModel.arrival.flightNumber}</Text>
                  <Tag variant="base" type="indigo" label={viewModel.arrival.dateLabel} />
                </CardHeaderLeft>
                <CardHeaderRight>
                  <SeatEconomy size={20} color={colors.textTertiary} />
                  <Text variant="label-xs" color="tertiary">
                    {viewModel.arrival.passengerCount}
                  </Text>
                  <Text variant="label-sm">{viewModel.arrival.station}</Text>
                </CardHeaderRight>
              </CardHeaderRow>
              <CardBottomRow>
                <CardBottomLeft>
                  {viewModel.arrival.infoItems.map((item) => (
                    <InfoItem key={item.label} label={item.label} value={item.value} />
                  ))}
                </CardBottomLeft>
                <CardBottomRight>
                  <Box style={styles.verticalDivider} />
                  {viewModel.arrival.status ? (
                    <Box style={styles.tagBox}>
                      <StatusTag
                        variant="feedback"
                        type={viewModel.arrival.status.type}
                        label={viewModel.arrival.status.label}
                      />
                    </Box>
                  ) : null}
                  <Box style={styles.pushInBox}>
                    <Text variant="label-xs" color="secondary">
                      {viewModel.arrival.actionTime.label}
                    </Text>
                    <Text variant="label-sm">
                      {viewModel.arrival.actionTime.value}
                    </Text>
                  </Box>
                </CardBottomRight>
              </CardBottomRow>
            </ArrivalCard>

            {/* PREFIXO / FLOTA — center separator box */}
            <PrefixoBox $compact={isCompact}>
              <Text variant="label-xs" color="secondary">PREFIXO</Text>
              <Text variant="label-sm">{viewModel.summary.prefix}</Text>
              <Text variant="label-xs" color="secondary">FLOTA</Text>
              <Text variant="label-xs">{viewModel.summary.fleetLabel}</Text>
            </PrefixoBox>

            {/* DEPARTURE — independent card */}
            <DepartureCard $compact={isCompact}>
              <CardHeaderRow>
                <CardHeaderLeft>
                  <Text variant="label-xs" color="tertiary">
                    {viewModel.departure.title}
                  </Text>
                  <Text variant="label-md">{viewModel.departure.flightNumber}</Text>
                  <Tag variant="base" type="indigo" label={viewModel.departure.dateLabel} />
                </CardHeaderLeft>
                <CardHeaderRight>
                  <SeatEconomy size={20} color={colors.textTertiary} />
                  <Text variant="label-xs" color="tertiary">
                    {viewModel.departure.passengerCount}
                  </Text>
                  <Text variant="label-sm">{viewModel.departure.station}</Text>
                </CardHeaderRight>
              </CardHeaderRow>
              <CardBottomRow>
                <CardBottomLeft>
                  {viewModel.departure.infoItems.map((item) => (
                    <InfoItem key={item.label} label={item.label} value={item.value} />
                  ))}
                </CardBottomLeft>
                <CardBottomRight>
                  <Box style={styles.verticalDivider} />
                  <Box style={styles.pushInBox}>
                    <Text variant="label-xs" color="secondary">
                      {viewModel.departure.actionTime.label}
                    </Text>
                    <Text variant="label-sm">
                      {viewModel.departure.actionTime.value}
                    </Text>
                  </Box>
                </CardBottomRight>
              </CardBottomRow>
            </DepartureCard>

            {/* TEMPO DISPONÍVEL box */}
            <TempoBox $compact={isCompact}>
              <Text variant="label-xs" color="secondary">TEMPO DISPONÍVEL</Text>
              <Text
                variant="heading-md"
                style={{
                  color: viewModel.summary.availableTimeDelayed ? '#C8001E' : colors.textPrimary,
                }}
              >
                {viewModel.summary.availableTime}
              </Text>
            </TempoBox>
          </FlightCardsRow>
        </Box>
        <FlightGanttTimeline
          staTime={viewModel.timeline.staTime}
          stdDate={viewModel.timeline.stdDate}
          stdTime={viewModel.timeline.stdTime}
          etdTime={viewModel.timeline.etdTime}
          pushOutTime={viewModel.timeline.pushOutTime}
          tasks={viewModel.timeline.tasks}
          tatVueloMinutos={viewModel.timeline.tatVueloMinutos}
          onRowClick={onRowClick}
        />
      </Box>
      <FlightInfoEventsPanel events={viewModel.events} />
    </Box>
  );
};
