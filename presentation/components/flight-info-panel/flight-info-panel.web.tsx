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

// Minimum width (px) for the main content area below which the two flight
// cards (ARRIVAL + DEPARTURE) stack vertically instead of side-by-side.
// Each card needs ~320px minimum to display cleanly, plus ~110px for PREFIXO
// and ~170px for TEMPO, so we need ~920px total to keep them horizontal.
const COMPACT_BREAKPOINT = 920;

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
@keyframes _tdFade {
  from { opacity: 0.3; transform: translateY(-3px) scale(0.96); }
  to   { opacity: 1;   transform: translateY(0)    scale(1); }
}
@keyframes _tdPulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.55; }
}
._td-digit {
  display: inline-block;
  animation: _tdFade 0.2s ease-out forwards;
  will-change: transform, opacity;
}
._td-pulse {
  animation: _tdPulse 1.6s ease-in-out infinite;
}
`;

const WARNING_SECONDS = 5 * 60;

/**
 * Computes seconds remaining until today's STD time.
 *
 * The countdown always uses TODAY's local date combined with the STD time
 * (HH:mm from stdTime). This is intentional: the operator sees "time left
 * until departure" relative to the current day — regardless of which date
 * the flight record was created on.
 *
 * Positive  = STD is still in the future → black countdown, decreasing.
 * Negative  = STD has passed today       → red, absolute value shown.
 */
const computeSecondsToStd = (
  _stdDate: string | null,  // kept for API compatibility, not used for date resolution
  stdTime: string | null,
  nowMs: number,
): number | null => {
  if (!stdTime) return null;
  const [hStr, mStr] = stdTime.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;

  // Always anchor to today's local date so the countdown is always meaningful.
  const now = new Date(nowMs);
  const stdMs = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    h,
    m,
    0,
    0,
  ).getTime();

  return Math.round((stdMs - nowMs) / 1000);
};

/**
 * Formats absolute seconds as "HH:MM:SS" — no sign, always positive display.
 * The caller decides the color (red = overdue, black = remaining).
 */
const formatHHMMSS = (totalSeconds: number): string => {
  const abs = Math.abs(totalSeconds);
  const hh = Math.floor(abs / 3600);
  const mm = Math.floor((abs % 3600) / 60);
  const ss = abs % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
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
      <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.04em', fontFamily: 'monospace, Arial', color: '#3a3a3a' }}>
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
      style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.04em', fontFamily: 'monospace, Arial', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}
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
        {/* ── Top header bar ─────────────────────────────────────────────── */}
        <Box style={styles.wrapperSupScroll}>
          {/* Row 1: ARRIVAL | PREFIXO | DEPARTURE | TEMPO DISPONÍVEL */}
          {/* When compact: cards stack vertically; PREFIXO becomes a horizontal divider row */}
          <Box style={{ ...styles.wrapperSup, flexDirection: isCompact ? 'column' : 'row' }}>
            {/* ARRIVAL */}
            <Box style={{ ...styles.column, borderRight: isCompact ? 'none' : '1px solid #D9D9D9', borderBottom: isCompact ? '1px solid #D9D9D9' : 'none' }}>
              <Box style={styles.headerInfo}>
                <Box style={styles.topInfoLeft}>
                  <Text variant="label-xs" color="tertiary">{viewModel.arrival.title}</Text>
                  <Text variant="label-md">{viewModel.arrival.flightNumber}</Text>
                  <Tag variant="base" type="indigo" label={viewModel.arrival.dateLabel} />
                  {viewModel.arrival.status ? (
                    <StatusTag
                      variant="feedback"
                      type={viewModel.arrival.status.type}
                      label={viewModel.arrival.status.label}
                    />
                  ) : null}
                </Box>
                <Box style={styles.topInfoRight}>
                  <SeatEconomy size={18} color={colors.textTertiary} />
                  <Text variant="label-xs" color="tertiary">{viewModel.arrival.passengerCount}</Text>
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
                  <Box style={styles.pushInBox}>
                    <Text variant="label-xs" color="secondary">{viewModel.arrival.actionTime.label}</Text>
                    <Text variant="label-sm">{viewModel.arrival.actionTime.value}</Text>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* PREFIXO / FLOTA — center gray separator (horizontal row when compact) */}
            <Box style={{
              ...styles.midBox,
              flexDirection: isCompact ? 'row' : 'column',
              gap: isCompact ? 16 : 2,
              flex: isCompact ? '1 1 auto' : '0 0 110px',
              borderRight: isCompact ? 'none' : '1px solid #D9D9D9',
              borderBottom: isCompact ? '1px solid #D9D9D9' : 'none',
              justifyContent: isCompact ? 'flex-start' : 'center',
            }}>
              <Text variant="label-xs" color="secondary">PREFIXO</Text>
              <Text variant="label-sm">{viewModel.summary.prefix}</Text>
              <Text variant="label-xs" color="secondary">FLOTA</Text>
              <Text variant="label-xs">{viewModel.summary.fleetLabel}</Text>
            </Box>

            {/* DEPARTURE */}
            <Box style={{ ...styles.columnR, borderRight: isCompact ? 'none' : '1px solid #D9D9D9', borderBottom: isCompact ? '1px solid #D9D9D9' : 'none' }}>
              <Box style={styles.headerInfo}>
                <Box style={styles.topInfoLeft}>
                  <Text variant="label-xs" color="tertiary">{viewModel.departure.title}</Text>
                  <Text variant="label-md">{viewModel.departure.flightNumber}</Text>
                  <Tag variant="base" type="indigo" label={viewModel.departure.dateLabel} />
                </Box>
                <Box style={styles.topInfoRight}>
                  <SeatEconomy size={18} color={colors.textTertiary} />
                  <Text variant="label-xs" color="tertiary">{viewModel.departure.passengerCount}</Text>
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
                    <Text variant="label-xs" color="secondary">{viewModel.departure.actionTime.label}</Text>
                    <Text variant="label-sm">{viewModel.departure.actionTime.value}</Text>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* TEMPO DISPONÍVEL — live hh:mm:ss countdown */}
            <Box style={{
              ...styles.estimatedTime,
              // When compact: fill full width and remove left border
              flex: isCompact ? '1 1 auto' : '0 0 170px',
              borderLeft: isCompact ? 'none' : '1px solid #D9D9D9',
              borderTop: isCompact ? '1px solid #D9D9D9' : 'none',
            }}>
              <Text variant="label-xs" color="secondary">TEMPO DISPONÍVEL</Text>
              <TempoDisponivelLive
                stdDate={viewModel.summary.stdDate}
                stdTime={viewModel.summary.stdTime}
                allTasksCompleted={viewModel.summary.allTasksCompleted}
              />
              <Text variant="label-xs" color="secondary" style={{ marginTop: 2 }}>
                {viewModel.summary.mtdLabel}
              </Text>
            </Box>
          </Box>

          {/* Row 2: Gray sub-bar — PNAE / Pax CNX / Bags CNX + route type + Tempo Plan */}
          <Box style={styles.subBar}>
            <Box style={styles.subBarLeft}>
              <Text variant="label-xs" color="secondary">PNAE: <Text variant="label-xs">{viewModel.subBar.pnaeArrival}</Text></Text>
              <Box style={styles.subBarDivider} />
              <Text variant="label-xs" color="secondary">Pax CNX: <Text variant="label-xs">{viewModel.subBar.paxCnxArrival}</Text></Text>
              <Box style={styles.subBarDivider} />
              <Text variant="label-xs" color="secondary">Bags CNX: <Text variant="label-xs">{viewModel.subBar.bagsCnxArrival}</Text></Text>
            </Box>
            {viewModel.subBar.routeType ? (
              <Box style={styles.subBarCenter}>
                <Box style={styles.routeTypeBadge}>
                  <Text variant="label-xs" style={{ color: '#3a3a3a', fontWeight: 600 }}>
                    {viewModel.subBar.routeType}
                  </Text>
                </Box>
              </Box>
            ) : null}
            <Box style={styles.subBarRight}>
              <Text variant="label-xs" color="secondary">PNAE: <Text variant="label-xs">{viewModel.subBar.pnaeDeparture}</Text></Text>
              <Box style={styles.subBarDivider} />
              <Text variant="label-xs" color="secondary">Pax CNX: <Text variant="label-xs">{viewModel.subBar.paxCnxDeparture}</Text></Text>
              <Box style={styles.subBarDivider} />
              <Text variant="label-xs" color="secondary">Bags CNX: <Text variant="label-xs">{viewModel.subBar.bagsCnxDeparture}</Text></Text>
              {viewModel.subBar.tempoPlan ? (
                <>
                  <Box style={styles.subBarDivider} />
                  <Box style={styles.tempoPlanBadge}>
                    <Text variant="label-xs" style={{ color: '#3a3a3a' }}>
                      Tempo Plan: {viewModel.subBar.tempoPlan}
                    </Text>
                  </Box>
                </>
              ) : null}
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
