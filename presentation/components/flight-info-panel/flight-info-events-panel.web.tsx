import { UnarchiveOutlined } from '@hangar/react-icons/core/interaction/UnarchiveOutlined';
import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type JSX,
} from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from 'styled-components';

import {
  DoubleCaretLeftOutlined,
  DoubleCaretRightOutlined,
  EditSquareOutlined,
} from '@/presentation/components/common/icons';
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
type PanelColors = {
  borderPrimary: string;
  interactionSoftDefault: string;
  surfaceSecondary: string;
  textPrimary: string;
  textSecondary: string;
};

const getPanelColors = (theme: ReturnType<typeof useTheme>): PanelColors => ({
  borderPrimary: theme?.tokens?.color?.border?.primary ?? '#d9d9d9',
  interactionSoftDefault:
    theme?.tokens?.color?.interaction?.softDefault ?? '#2c31c9',
  surfaceSecondary: theme?.tokens?.color?.surface?.secondary ?? '#f2f2f2',
  textPrimary: theme?.tokens?.color?.text?.primary ?? '#3a3a3a',
  textSecondary: theme?.tokens?.color?.text?.secondary ?? '#626262',
});

type TimelineRowItem = {
  id: string;
  leftTimeLabel: string;
  rightTimeLabel?: string | null;
  description: string;
  variant: 'default' | 'updated';
  previousTime?: string | null;
  nextTime?: string | null;
  isNew?: boolean;
};

const formatTimestampTimeLabel = (
  timestamp: number,
  fallback: string,
): string => {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
};

const mapViewModelItemToTimelineRow = (
  item: FlightInfoPanelEventItemViewModel,
): TimelineRowItem => ({
  id: item.id,
  leftTimeLabel: item.timeLabel,
  rightTimeLabel: item.timeLabel,
  description: item.description,
  variant: 'default',
});

const buildSessionTimelineRow = (
  ev: SessionEvent,
  isNew: boolean,
  fallbackPreviousTime?: string | null,
): TimelineRowItem => {
  if (ev.type === 'started') {
    return {
      id: ev.id,
      leftTimeLabel: formatTimestampTimeLabel(ev.timestamp, ev.time),
      rightTimeLabel: ev.time,
      description: `Início ${ev.taskName}`,
      variant: 'default',
      isNew,
    };
  }

  if (ev.type === 'finished') {
    return {
      id: ev.id,
      leftTimeLabel: formatTimestampTimeLabel(ev.timestamp, ev.time),
      rightTimeLabel: ev.time,
      description: `Fim ${ev.taskName}`,
      variant: 'default',
      isNew,
    };
  }

  return {
    id: ev.id,
    leftTimeLabel: formatTimestampTimeLabel(ev.timestamp, ev.time),
    description: `${ev.taskName} Atualizado`,
    variant: 'updated',
    previousTime: ev.previousTime ?? fallbackPreviousTime ?? null,
    nextTime: ev.nextTime ?? ev.time ?? null,
    isNew,
  };
};

const TimelineRow = ({
  item,
  colors,
}: {
  item: TimelineRowItem;
  colors: PanelColors;
}): JSX.Element => {
  const isUpdated = item.variant === 'updated';
  const showResolvedTime = !isUpdated && Boolean(item.rightTimeLabel);
  const showTimeChange =
    isUpdated &&
    item.previousTime &&
    item.nextTime &&
    item.previousTime !== item.nextTime;

  return (
    <Box
      style={{
        ...styles.timelineRow,
        animation: item.isNew
          ? 'hitoSlideIn 0.32s cubic-bezier(0.22, 1, 0.36, 1) both'
          : undefined,
      }}
    >
      <Text
        variant="label-sm"
        style={{
          ...styles.timelineTime,
          color: colors.textSecondary,
          fontWeight: '400',
        }}
      >
        {item.leftTimeLabel}
      </Text>

      <Box style={styles.timelineMarkerColumn}>
        {isUpdated ? (
          <EditSquareOutlined size={18} color={colors.textSecondary} />
        ) : (
          <Box
            style={{
              ...styles.timelineDot,
              backgroundColor: colors.interactionSoftDefault,
            }}
          />
        )}
      </Box>

      <Box style={styles.timelineContent}>
        <Text
          variant="label-sm"
          style={{
            ...styles.timelineDescription,
            color: colors.textPrimary,
            fontWeight: '400',
          }}
        >
          {item.description}
        </Text>

        {showTimeChange ? (
          <div style={styles.timelineChangeRow}>
            <Text
              variant="label-sm"
              style={{
                ...styles.timelineChangeTime,
                color: colors.textSecondary,
                fontWeight: '400',
              }}
            >
              {item.previousTime}
            </Text>
            <span
              style={{
                ...styles.timelineChangeArrow,
                color: colors.textPrimary,
              }}
            >
              →
            </span>
            <Text
              variant="label-sm"
              style={{
                ...styles.timelineChangeTime,
                color: colors.textPrimary,
                fontWeight: '700',
              }}
            >
              {item.nextTime}
            </Text>
          </div>
        ) : null}
      </Box>

      {showResolvedTime ? (
        <div style={styles.timelineResolvedTime}>
          <span
            style={{
              ...styles.timelineResolvedArrow,
              color: colors.textPrimary,
            }}
          >
            →
          </span>
          <Text
            variant="label-sm"
            style={{
              ...styles.timelineResolvedValue,
              color: colors.textPrimary,
              fontWeight: '700',
            }}
          >
            {item.rightTimeLabel}
          </Text>
        </div>
      ) : null}
    </Box>
  );
};

const TimelineList = ({
  items,
  emptyMessage,
  colors,
  autoScrollOnAppend = false,
}: {
  items: TimelineRowItem[];
  emptyMessage: string;
  colors: PanelColors;
  autoScrollOnAppend?: boolean;
}): JSX.Element => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const previousCountRef = useRef(items.length);

  useEffect(() => {
    if (!autoScrollOnAppend) {
      return;
    }

    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, [autoScrollOnAppend]);

  useEffect(() => {
    if (!autoScrollOnAppend) {
      return;
    }

    if (items.length > previousCountRef.current) {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    }

    previousCountRef.current = items.length;
  }, [autoScrollOnAppend, items.length]);

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
      ref={scrollRef}
      style={{
        ...styles.timelineList,
      }}
    >
      {items.map((item) => (
        <TimelineRow key={item.id} item={item} colors={colors} />
      ))}
    </div>
  );
};

// ─── HitosList ───────────────────────────────────────────────────────────────
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
  colors: PanelColors;
}): JSX.Element => {
  const previousSessionCountRef = useRef(filteredSessionEvents.length);
  const [newestSessionEventId, setNewestSessionEventId] = useState<string | null>(
    null,
  );

  const fallbackTimeByTaskInstanceId = useMemo(() => {
    const result = new Map<string, string>();

    for (const item of items) {
      if (item.taskInstanceId && !result.has(item.taskInstanceId)) {
        result.set(item.taskInstanceId, item.timeLabel);
      }
    }

    for (const item of hitoItems) {
      if (item.taskInstanceId && !result.has(item.taskInstanceId)) {
        result.set(item.taskInstanceId, item.timeLabel);
      }
    }

    return result;
  }, [hitoItems, items]);

  useEffect(() => {
    if (filteredSessionEvents.length > previousSessionCountRef.current) {
      setNewestSessionEventId(
        filteredSessionEvents[filteredSessionEvents.length - 1]?.id ?? null,
      );
    }

    previousSessionCountRef.current = filteredSessionEvents.length;
  }, [filteredSessionEvents]);

  const timelineItems = useMemo<TimelineRowItem[]>(() => {
    return [
      ...items.map(mapViewModelItemToTimelineRow),
      ...hitoItems.map(mapViewModelItemToTimelineRow),
      ...filteredSessionEvents.map((event) =>
        buildSessionTimelineRow(
          event,
          event.id === newestSessionEventId,
          event.taskInstanceId
            ? fallbackTimeByTaskInstanceId.get(event.taskInstanceId)
            : null,
        ),
      ),
    ];
  }, [
    fallbackTimeByTaskInstanceId,
    filteredSessionEvents,
    hitoItems,
    items,
    newestSessionEventId,
  ]);

  return (
    <TimelineList
      items={timelineItems}
      emptyMessage={emptyMessage}
      colors={colors}
      autoScrollOnAppend
    />
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
  colors: PanelColors;
}): JSX.Element => {
  const timelineItems = useMemo<TimelineRowItem[]>(
    () => items.map(mapViewModelItemToTimelineRow),
    [items],
  );

  return (
    <TimelineList
      items={timelineItems}
      emptyMessage={emptyMessage}
      colors={colors}
    />
  );
};

// ─── FlightInfoEventsPanel ───────────────────────────────────────────────────
export const FlightInfoEventsPanel = ({
  events,
}: FlightInfoEventsPanelProps): JSX.Element => {
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
          <DoubleCaretRightOutlined size={32} color={colors.textPrimary} />
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
