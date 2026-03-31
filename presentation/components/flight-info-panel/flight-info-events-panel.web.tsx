import {
  DoubleCaretLeftOutlined,
  DoubleCaretRightOutlined,
} from '@hangar/react-icons/core/interaction';
import { UnarchiveOutlined } from '@hangar/react-icons/core/interaction/UnarchiveOutlined';
import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from 'styled-components';

import { Box, Text } from '@/presentation/components/design-system';
import type {
  FlightInfoPanelEventItemViewModel,
  FlightInfoPanelEventsViewModel,
} from '@/presentation/view-models/flight-info-panel-view-model';
import type { RootState } from '@/store';
import type { SessionEvent } from '@/store/slices/session-events-slice';

import { styles } from './flight-info-panel.styles.web';

// ─── Inject keyframe once ────────────────────────────────────────────────────
if (typeof document !== 'undefined') {
  const STYLE_ID = 'gantt-hito-keyframes';
  if (!document.getElementById(STYLE_ID)) {
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
      @keyframes hitoSlideIn {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0);    }
      }
    `;
    document.head.appendChild(el);
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────
type Tab = 'hitos' | 'alertas';

const TABS: { key: Tab; label: string }[] = [
  { key: 'hitos', label: 'Hitos' },
  { key: 'alertas', label: 'Alertas' },
];

type FlightInfoEventsPanelProps = {
  events: FlightInfoPanelEventsViewModel;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getPanelColors = (theme: ReturnType<typeof useTheme>) => ({
  borderPrimary: theme?.tokens?.color?.border?.primary ?? '#d9d9d9',
  interactionSoftDefault:
    theme?.tokens?.color?.interaction?.softDefault ?? '#2c31c9',
  surfaceSecondary: theme?.tokens?.color?.surface?.secondary ?? '#f2f2f2',
  surfaceInfoSoft: '#E7E8FD',
  textPrimary: theme?.tokens?.color?.text?.primary ?? '#3a3a3a',
  textSecondary: theme?.tokens?.color?.text?.secondary ?? '#626262',
});

/** Build the human-readable description for a session event */
const buildSessionDescription = (
  ev: SessionEvent,
): { text: string; delayed: boolean } => {
  const delay =
    ev.isDelayed && ev.delayMinutes > 0
      ? ` (${ev.delayMinutes} min de demora)`
      : '';
  const onTime = !ev.isDelayed ? ' a tiempo' : '';

  if (ev.type === 'started') {
    return {
      text: `Iniciado${onTime}${delay}: ${ev.taskName}`,
      delayed: ev.isDelayed,
    };
  }
  if (ev.type === 'finished') {
    return {
      text: `Finalizado${onTime}${delay}: ${ev.taskName}, se finalizó la tarea a las ${ev.time}`,
      delayed: ev.isDelayed,
    };
  }
  return { text: `Actualizado: ${ev.taskName}`, delayed: false };
};

// ─── SessionHitoRow ──────────────────────────────────────────────────────────
// Matches exactly the Hitos row layout: badge | time | description
// Animates in with CSS keyframe when isNew=true
const SessionHitoRow = ({
  event,
  isNew,
  colors,
}: {
  event: SessionEvent;
  isNew: boolean;
  colors: ReturnType<typeof getPanelColors>;
}) => {
  const { text, delayed } = buildSessionDescription(event);

  return (
    <Box
      style={{
        ...styles.eventItem,
        animation: isNew
          ? 'hitoSlideIn 0.32s cubic-bezier(0.22, 1, 0.36, 1) both'
          : undefined,
      }}
    >
      {/* Badge — same size/style as SIGA badges */}
      <Box
        style={{
          ...styles.eventBadge,
          backgroundColor: delayed ? '#FFF0F0' : '#E7F7EE',
        }}
      >
        <Text
          variant="label-xs"
          style={{ color: delayed ? '#C8001E' : '#07605B', fontWeight: '700' }}
        >
          {event.type === 'started'
            ? 'INICIO'
            : event.type === 'finished'
              ? 'FIN'
              : 'ACT.'}
        </Text>
      </Box>

      {/* Time + description */}
      <Box style={styles.eventMeta}>
        <Text
          variant="label-xs"
          style={{ ...styles.eventTime, color: colors.textSecondary }}
        >
          {event.time}
        </Text>
        <Text
          variant="label-xs"
          style={{
            ...styles.eventDescription,
            color: delayed ? '#C8001E' : colors.textPrimary,
          }}
        >
          {text}
        </Text>
      </Box>
    </Box>
  );
};

// ─── HitosList ───────────────────────────────────────────────────────────────
// Renders: 1) SIGA task list, 2) hito events (inicioReal/finReal), 3) filtered session events
const HitosList = ({
  items,
  hitoItems,
  filteredSessionEvents,
  emptyMessage,
  colors,
}: {
  items: FlightInfoPanelEventItemViewModel[];
  hitoItems: FlightInfoPanelEventItemViewModel[];
  filteredSessionEvents: SessionEvent[];
  emptyMessage: string;
  colors: ReturnType<typeof getPanelColors>;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLen = useRef(filteredSessionEvents.length);
  const newestId = useRef<string | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    });
  }, []);

  useEffect(() => {
    if (filteredSessionEvents.length > prevLen.current) {
      const newest =
        filteredSessionEvents[filteredSessionEvents.length - 1];
      newestId.current = newest?.id ?? null;
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    }
    prevLen.current = filteredSessionEvents.length;
  }, [filteredSessionEvents]);

  const hasContent =
    items.length > 0 ||
    hitoItems.length > 0 ||
    filteredSessionEvents.length > 0;

  if (!hasContent) {
    return (
      <Box style={styles.eventsEmptyState}>
        <Text variant="label-sm" color="secondary">
          {emptyMessage}
        </Text>
      </Box>
    );
  }

  return (
    <div
      ref={scrollRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 16,
        paddingRight: 16,
        boxSizing: 'border-box',
      }}
    >
      {/* SIGA tasks — full task list */}
      {items.map((item) => (
        <Box key={item.id} style={styles.eventItem}>
          {item.source && (
            <Box
              style={{
                ...styles.eventBadge,
                backgroundColor: colors.surfaceInfoSoft,
              }}
            >
              <Text
                variant="label-xs"
                style={{
                  color: colors.interactionSoftDefault,
                  fontWeight: '700',
                }}
              >
                {item.source}
              </Text>
            </Box>
          )}
          <Box style={styles.eventMeta}>
            <Text
              variant="label-xs"
              style={{ ...styles.eventTime, color: colors.textSecondary }}
            >
              {item.timeLabel}
            </Text>
            <Text
              variant="label-xs"
              style={{ ...styles.eventDescription, color: colors.textPrimary }}
            >
              {item.description}
            </Text>
          </Box>
        </Box>
      ))}

      {/* Hito events — persistent events from inicioReal/finReal */}
      {hitoItems.map((item) => (
        <Box key={item.id} style={styles.eventItem}>
          {item.source && (
            <Box
              style={{
                ...styles.eventBadge,
                backgroundColor: item.isDelayed ? '#FFF0F0' : '#E7F7EE',
              }}
            >
              <Text
                variant="label-xs"
                style={{
                  color: item.isDelayed ? '#C8001E' : '#07605B',
                  fontWeight: '700',
                }}
              >
                {item.source}
              </Text>
            </Box>
          )}
          <Box style={styles.eventMeta}>
            <Text
              variant="label-xs"
              style={{ ...styles.eventTime, color: colors.textSecondary }}
            >
              {item.timeLabel}
            </Text>
            <Text
              variant="label-xs"
              style={{
                ...styles.eventDescription,
                color: item.isDelayed ? '#C8001E' : colors.textPrimary,
              }}
            >
              {item.description}
            </Text>
          </Box>
        </Box>
      ))}

      {/* Session events — only those not yet synced to API, slide-in animation on newest */}
      {filteredSessionEvents.map((ev) => (
        <SessionHitoRow
          key={ev.id}
          event={ev}
          isNew={ev.id === newestId.current}
          colors={colors}
        />
      ))}
    </div>
  );
};

// ─── AlertasList ─────────────────────────────────────────────────────────────
const AlertasList = ({
  items,
  emptyMessage,
  colors,
}: {
  items: FlightInfoPanelEventItemViewModel[];
  emptyMessage: string;
  colors: ReturnType<typeof getPanelColors>;
}) => {
  if (!items.length) {
    return (
      <Box style={styles.eventsEmptyState}>
        <Text variant="label-sm" color="secondary">
          {emptyMessage}
        </Text>
      </Box>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 16,
        paddingRight: 16,
        boxSizing: 'border-box',
      }}
    >
      {items.map((item) => (
        <Box key={item.id} style={styles.eventItem}>
          {item.source && (
            <Box
              style={{
                ...styles.eventBadge,
                backgroundColor: colors.surfaceInfoSoft,
              }}
            >
              <Text
                variant="label-xs"
                style={{
                  color: colors.interactionSoftDefault,
                  fontWeight: '700',
                }}
              >
                {item.source}
              </Text>
            </Box>
          )}
          <Box style={styles.eventMeta}>
            <Text
              variant="label-xs"
              style={{ ...styles.eventTime, color: colors.textSecondary }}
            >
              {item.timeLabel}
            </Text>
            <Text
              variant="label-xs"
              style={{ ...styles.eventDescription, color: colors.textPrimary }}
            >
              {item.description}
            </Text>
          </Box>
        </Box>
      ))}
    </div>
  );
};

// ─── FlightInfoEventsPanel ───────────────────────────────────────────────────
export const FlightInfoEventsPanel = ({
  events,
}: FlightInfoEventsPanelProps) => {
  const theme = useTheme();
  const colors = getPanelColors(theme);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('hitos');

  const sessionEvents = useSelector(
    (state: RootState) => state.sessionEvents.events,
  );
  const prevCountRef = useRef(sessionEvents.length);

  const hitoItems = useMemo<FlightInfoPanelEventItemViewModel[]>(
    () => events.hitoItems ?? [],
    [events.hitoItems],
  );

  const filteredSessionEvents = useMemo(() => {
    const apiKeys = new Set(
      hitoItems
        .filter(
          (item) => item.taskInstanceId && item.eventType,
        )
        .map(
          (item) => `${item.taskInstanceId}-${item.eventType}`,
        ),
    );
    return sessionEvents.filter((ev) => {
      if (!ev.taskInstanceId) return true;
      return !apiKeys.has(`${ev.taskInstanceId}-${ev.type}`);
    });
  }, [hitoItems, sessionEvents]);

  useEffect(() => {
    if (sessionEvents.length > prevCountRef.current) {
      setIsExpanded(true);
      setActiveTab('hitos');
    }
    prevCountRef.current = sessionEvents.length;
  }, [sessionEvents.length]);

  const handleTabPress = useCallback((tab: Tab) => setActiveTab(tab), []);

  // ── Collapsed ─────────────────────────────────────────────────────────────
  if (!isExpanded) {
    return (
      <Box
        style={{
          ...styles.eventsPanelCollapsed,
          borderLeftColor: colors.borderPrimary,
        }}
      >
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          style={{
            ...styles.eventsPanelCollapsedHeader,
            background: 'none',
            border: 'none',
            borderBottom: `1px solid ${colors.borderPrimary}`,
            cursor: 'pointer',
            width: '100%',
          }}
          aria-label="Expandir eventos de vuelo"
        >
          <DoubleCaretLeftOutlined size={24} color={colors.textPrimary} />
        </button>
        <Box style={styles.eventsPanelCollapsedActions}>
          <Box style={styles.eventsPanelCollapsedAction}>
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              style={{
                ...styles.eventsPanelCollapsedIconButtonGhost,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              aria-label="Abrir eventos de vuelo"
            >
              <UnarchiveOutlined size={28} color={colors.textPrimary} />
            </button>
            <Box
              style={{
                ...styles.eventsPanelCollapsedCount,
                backgroundColor: colors.surfaceSecondary,
              }}
            >
              <Text
                variant="label-sm"
                style={{ color: colors.interactionSoftDefault }}
              >
                {events.items.length + hitoItems.length + filteredSessionEvents.length}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  // ── Expanded ──────────────────────────────────────────────────────────────
  return (
    <Box
      style={{ ...styles.eventsPanel, borderLeftColor: colors.borderPrimary }}
    >
      {/* Header */}
      <Box
        style={{
          ...styles.eventsPanelHeader,
          borderBottomColor: colors.borderPrimary,
        }}
      >
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          style={{
            ...styles.eventsPanelToggle,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label="Colapsar eventos de vuelo"
        >
          <DoubleCaretRightOutlined size={24} color={colors.textPrimary} />
        </button>
        <Text variant="heading-xs">{events.title}</Text>
      </Box>

      {/* Tabs — only Hitos and Alertas */}
      <Box
        style={{ ...styles.tabsBar, borderBottomColor: colors.borderPrimary }}
      >
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabPress(tab.key)}
              style={{
                ...styles.tabItem,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Text
                variant="label-sm"
                style={{
                  color: isActive
                    ? colors.interactionSoftDefault
                    : colors.textSecondary,
                  fontWeight: isActive ? '700' : '400',
                }}
              >
                {tab.label}
              </Text>
              {isActive && (
                <div
                  style={{
                    ...styles.tabActiveIndicator,
                    backgroundColor: colors.interactionSoftDefault,
                  }}
                />
              )}
            </button>
          );
        })}
      </Box>

      {/* Content */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {activeTab === 'hitos' ? (
          <HitosList
            items={events.items ?? []}
            hitoItems={hitoItems}
            filteredSessionEvents={filteredSessionEvents}
            emptyMessage={events.emptyMessage}
            colors={colors}
          />
        ) : (
          <AlertasList
            items={events.alertItems ?? []}
            emptyMessage={events.emptyMessage}
            colors={colors}
          />
        )}
      </div>
    </Box>
  );
};
