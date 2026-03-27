import { useRef, useState, useEffect, useMemo } from 'react';
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

import { useSecondTimestamp } from '@/presentation/hooks/use-second-timestamp';

import type { FlightInfoPanelProps } from './flight-info-panel.types';
import { styles } from './flight-info-panel.styles.web';

// Threshold below which cards stack vertically.
// At 1440px: left panel ~270px, right panel ~270px → mainContent ~900px with both open.
// We trigger compact when mainContent < 1100px so that even one open panel causes stacking.
const COMPACT_BREAKPOINT = 998;

// --- Styled components ---

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

// ─── Tempo Disponível — animated countdown ───────────────────────────────────
const tempoStyles = `
@keyframes _tdSlideIn {
  from { transform: translateY(-6px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
@keyframes _tdPulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}
._td-digit {
  display: inline-block;
  animation: _tdSlideIn 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform, opacity;
}
._td-pulse {
  animation: _tdPulse 1.4s ease-in-out infinite;
}
`;

const WARNING_SECONDS = 5 * 60;

const computeSecondsToStd = (
  stdDate: string | null,
  stdTime: string | null,
  nowMs: number,
): number | null => {
  if (!stdDate || !stdTime) return null;
  const datePart = stdDate.split('T')[0] ?? '';
  const [hStr, mStr] = stdTime.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;

  let year: number, month: number, day: number;
  if (datePart.includes('-')) {
    [year, month, day] = datePart.split('-').map(Number) as [number, number, number];
  } else if (datePart.includes('/')) {
    [day, month, year] = datePart.split('/').map(Number) as [number, number, number];
  } else {
    return null;
  }

  const stdMs = new Date(year, month - 1, day, h, m, 0, 0).getTime();
  // Countdown: positive = time remaining until STD, negative = overdue
  return Math.round((stdMs - nowMs) / 1000);
};

const formatHHMMSS = (totalSeconds: number): string => {
  const abs = Math.abs(totalSeconds);
  const hh = Math.floor(abs / 3600);
  const mm = Math.floor((abs % 3600) / 60);
  const ss = abs % 60;
  const sign = totalSeconds < 0 ? '-' : '';
  return `${sign}${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
};

/** A single digit/char that re-animates only when its character changes. */
const AnimatedChar = ({ char, color }: { char: string; color: string }) => {
  const [key, setKey] = useState(0);
  const prev = useRef(char);
  useEffect(() => {
    if (char !== prev.current) {
      prev.current = char;
      setKey((k) => k + 1);
    }
  }, [char]);
  return (
    <span
      key={key}
      className="_td-digit"
      style={{ color, fontVariantNumeric: 'tabular-nums', display: 'inline-block', minWidth: char === ':' ? '0.3em' : '0.65em', textAlign: 'center' }}
    >
      {char}
    </span>
  );
};

type TempoDisponivelProps = {
  stdDate: string | null;
  stdTime: string | null;
  allTasksCompleted: boolean;
};

const TempoDisponivelLive = ({ stdDate, stdTime, allTasksCompleted }: TempoDisponivelProps) => {
  const nowMs = useSecondTimestamp();
  const seconds = useMemo(
    () => computeSecondsToStd(stdDate, stdTime, nowMs),
    [stdDate, stdTime, nowMs],
  );

  const [frozenSeconds, setFrozenSeconds] = useState<number | null>(null);
  useEffect(() => {
    if (allTasksCompleted && frozenSeconds === null && seconds !== null) {
      setFrozenSeconds(seconds);
    }
    if (!allTasksCompleted) setFrozenSeconds(null);
  }, [allTasksCompleted, seconds, frozenSeconds]);

  const displaySeconds = frozenSeconds ?? seconds;

  if (displaySeconds === null) {
    return (
      <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: '0.05em', fontFamily: 'monospace, Arial', color: '#3a3a3a' }}>
        --:--:--
      </span>
    );
  }

  const isRed = displaySeconds < 0;
  const isPulsing = !allTasksCompleted && displaySeconds >= 0 && displaySeconds <= WARNING_SECONDS;
  const color = isRed ? '#C8001E' : '#3a3a3a';
  const label = formatHHMMSS(displaySeconds);

  return (
    <span
      className={isPulsing ? '_td-pulse' : undefined}
      style={{ fontSize: 24, fontWeight: 700, letterSpacing: '0.04em', fontFamily: 'monospace, Arial', display: 'inline-flex', alignItems: 'center' }}
    >
      {label.split('').map((char, i) => (
        <AnimatedChar key={i} char={char} color={color} />
      ))}
    </span>
  );
};

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
      <style>{tempoStyles}</style>
      <Box ref={wrapperRef} style={styles.mainContent}>
        <Box style={styles.wrapperSupScroll}>
          <Box style={{ ...styles.wrapperSup, ...(isCompact ? styles.wrapperSupCompact : {}) }}>
            {/* ARRIVAL */}
            <Box style={{ ...styles.column, ...(isCompact ? styles.columnCompact : {}) }}>
              <Box style={styles.headerInfo}>
                <Box style={styles.topInfoLeft}>
                  <Text variant="label-xs" color="tertiary">
                    {viewModel.arrival.title}
                  </Text>
                  <Text variant="label-md">{viewModel.arrival.flightNumber}</Text>
                  <Tag variant="base" type="indigo" label={viewModel.arrival.dateLabel} />
                </Box>
                <Box style={styles.topInfoRight}>
                  <SeatEconomy size={20} color={colors.textTertiary} />
                  <Text variant="label-xs" color="tertiary">
                    {viewModel.arrival.passengerCount}
                  </Text>
                  <Text variant="label-sm">{viewModel.arrival.station}</Text>
                </Box>
              </Box>
              <Box style={styles.bottomInfo}>
                <Box style={styles.bottomInfoLeft}>
                  {viewModel.arrival.infoItems.map((item) => (
                    <InfoItem key={item.label} label={item.label} value={item.value} />
                  ))}
                </Box>
                <Box style={styles.bottomInfoRight}>
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
                </Box>
              </Box>
            </Box>

            {/* PREFIXO / FLOTA */}
            <Box style={{ ...styles.midBox, ...(isCompact ? styles.midBoxCompact : {}) }}>
              <Text variant="label-xs" color="secondary">PREFIXO</Text>
              <Text variant="label-sm">{viewModel.summary.prefix}</Text>
              <Text variant="label-xs" color="secondary">FLOTA</Text>
              <Text variant="label-xs">{viewModel.summary.fleetLabel}</Text>
            </Box>

            {/* DEPARTURE */}
            <Box style={{ ...styles.columnR, ...(isCompact ? styles.columnCompact : {}) }}>
              <Box style={styles.headerInfo}>
                <Box style={styles.topInfoLeft}>
                  <Text variant="label-xs" color="tertiary">
                    {viewModel.departure.title}
                  </Text>
                  <Text variant="label-md">{viewModel.departure.flightNumber}</Text>
                  <Tag variant="base" type="indigo" label={viewModel.departure.dateLabel} />
                </Box>
                <Box style={styles.topInfoRight}>
                  <SeatEconomy size={20} color={colors.textTertiary} />
                  <Text variant="label-xs" color="tertiary">
                    {viewModel.departure.passengerCount}
                  </Text>
                  <Text variant="label-sm">{viewModel.departure.station}</Text>
                </Box>
              </Box>
              <Box style={styles.bottomInfo}>
                <Box style={styles.bottomInfoLeft}>
                  {viewModel.departure.infoItems.map((item) => (
                    <InfoItem key={item.label} label={item.label} value={item.value} />
                  ))}
                </Box>
                <Box style={styles.bottomInfoRight}>
                  <Box style={styles.verticalDivider} />
                  <Box style={styles.pushInBox}>
                    <Text variant="label-xs" color="secondary">
                      {viewModel.departure.actionTime.label}
                    </Text>
                    <Text variant="label-sm">
                      {viewModel.departure.actionTime.value}
                    </Text>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* TEMPO DISPONÍVEL — live hh:mm:ss countdown */}
            <Box style={{ ...styles.estimatedTime, ...(isCompact ? styles.estimatedTimeCompact : {}) }}>
              <Text variant="label-xs" color="secondary">TEMPO DISPONÍVEL</Text>
              <TempoDisponivelLive
                stdDate={viewModel.summary.stdDate}
                stdTime={viewModel.summary.stdTime}
                allTasksCompleted={viewModel.summary.allTasksCompleted}
              />
            </Box>
          </Box>
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
