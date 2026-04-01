import {
  AXIS_HEIGHT,
  HEADER_HEIGHT,
  styles,
} from './flight-gantt-timeline.styles';
import { formatAbsoluteMinute } from './flight-gantt-timeline.utils';

import type { TimelineMarker } from './flight-gantt-timeline.types';
import type { ReactNode } from 'react';

type FlightGanttTimelineAxisProps = {
  markers: TimelineMarker[];
  ticks: number[];
  timelineStartDateMs: number;
  timelineWidth: number;
  xScale: (value: number) => number;
};

interface TickLabelLayout {
  fontSize: number;
  minSpacing: number;
  y: number;
}

interface TickLabelNodeData {
  anchor: 'end' | 'middle' | 'start';
  key: string;
  label: string;
  x: number;
}

interface TimelineDateLabelData {
  label: string;
  minute: number;
}

const DATE_LABEL_HEIGHT = 10;
const DATE_LABEL_PADDING_X = 6;
const DATE_LABEL_Y = 5;

const formatCompactMinuteLabel = (absoluteMinute: number): string => {
  const wrapped = ((Math.round(absoluteMinute) % 1440) + 1440) % 1440;
  return String(wrapped % 60).padStart(2, '0');
};

const formatTimelineDateLabel = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleDateString('es-CL', { month: 'short' }).replace('.', '');
  return `${day} ${month}`;
};

const buildDateLabels = (
  ticks: number[],
  timelineStartDateMs: number,
): TimelineDateLabelData[] => {
  if (!ticks.length || !Number.isFinite(timelineStartDateMs)) {
    return [];
  }

  const firstVisibleMinute = ticks[0] ?? 0;
  const lastVisibleMinute = ticks[ticks.length - 1] ?? firstVisibleMinute;
  const firstBoundaryMinute =
    Math.ceil(firstVisibleMinute / 1440) * 1440;
  const labels: TimelineDateLabelData[] = [];

  for (
    let boundaryMinute = firstBoundaryMinute;
    boundaryMinute <= lastVisibleMinute;
    boundaryMinute += 1440
  ) {
    const labelDate = new Date(
      timelineStartDateMs + boundaryMinute * 60 * 1000,
    );
    labels.push({
      label: formatTimelineDateLabel(labelDate),
      minute: boundaryMinute,
    });
  }

  return labels;
};

const buildTickLines = (
  ticks: number[],
  xScale: (value: number) => number,
): ReactNode[] => {
  const lines: ReactNode[] = [];
  for (const tick of ticks) {
    const x = xScale(tick);
    lines.push(
      <line
        key={`axis-line-${tick}`}
        x1={x}
        x2={x}
        y1={0}
        y2={HEADER_HEIGHT}
        stroke="#e0e0e0"
        strokeWidth={1}
      />,
    );
  }

  return lines;
};

const getTickLabelLayout = (
  ticks: number[],
  xScale: (value: number) => number,
  labels: string[] = [],
): TickLabelLayout => {
  const tickSpacing =
    ticks.length > 1
      ? Math.abs(xScale(ticks[1]) - xScale(ticks[0]))
      : Number.POSITIVE_INFINITY;

  const compactLayout =
    tickSpacing <= 28
      ? { fontSize: 7, minSpacingFloor: 20, y: 23 }
      : tickSpacing <= 34
        ? { fontSize: 8, minSpacingFloor: 22, y: 23.5 }
        : tickSpacing <= 42
          ? { fontSize: 9, minSpacingFloor: 25, y: 24 }
          : tickSpacing <= 52
            ? { fontSize: 10, minSpacingFloor: 28, y: 24.5 }
            : tickSpacing <= 64
              ? { fontSize: 10.5, minSpacingFloor: 30, y: 25 }
              : { fontSize: 11, minSpacingFloor: 32, y: 25 };
  const widestLabelLength = labels.reduce((maxLength, label) => {
    return Math.max(maxLength, label.length);
  }, 2);

  return {
    fontSize: compactLayout.fontSize,
    minSpacing: Math.max(
      compactLayout.minSpacingFloor,
      widestLabelLength * compactLayout.fontSize * 0.54 + 4,
    ),
    y: compactLayout.y,
  };
};

const buildTickDisplayLabels = (
  ticks: number[],
  xScale: (value: number) => number,
): string[] => {
  if (!ticks.length) {
    return [];
  }

  const tickSpacing =
    ticks.length > 1
      ? Math.abs(xScale(ticks[1]) - xScale(ticks[0]))
      : Number.POSITIVE_INFINITY;

  if (tickSpacing > 28) {
    return ticks.map((tick) => formatAbsoluteMinute(tick));
  }

  return ticks.map((tick, index) => {
    const fullLabel = formatAbsoluteMinute(tick);
    const minuteLabel = formatCompactMinuteLabel(tick);
    const previousTick = ticks[index - 1];
    const isFirst = index === 0;
    const isLast = index === ticks.length - 1;
    const currentWrappedMinute = ((Math.round(tick) % 1440) + 1440) % 1440;
    const isHourBoundary = currentWrappedMinute % 60 === 0;

    if (isFirst || isLast || isHourBoundary || previousTick === undefined) {
      return fullLabel;
    }

    return minuteLabel;
  });
};

const buildTickLabels = (
  ticks: number[],
  xScale: (value: number) => number,
): ReactNode[] => {
  const selectedLabels: TickLabelNodeData[] = [];
  const lastIndex = ticks.length - 1;
  const displayLabels = buildTickDisplayLabels(ticks, xScale);
  const layout = getTickLabelLayout(ticks, xScale, displayLabels);

  for (let i = 0; i < ticks.length; i++) {
    const tick = ticks[i];
    const x = xScale(tick);
    const label = displayLabels[i] ?? formatAbsoluteMinute(tick);
    const isFirst = i === 0;
    const isLast = i === lastIndex;

    // First tick: anchor to start so it doesn't clip on the left edge
    // Last tick: anchor to end so it doesn't clip on the right edge
    // All others: centered on the tick line
    const anchor = isFirst ? 'start' : isLast ? 'end' : 'middle';
    const previousLabel = selectedLabels[selectedLabels.length - 1];

    const requiredSpacing =
      Math.max(label.length, previousLabel?.label.length ?? 0) *
        layout.fontSize *
        0.58 +
      6;

    if (
      !isFirst &&
      !isLast &&
      previousLabel &&
      x - previousLabel.x < Math.max(layout.minSpacing, requiredSpacing)
    ) {
      continue;
    }

    if (
      isLast &&
      previousLabel &&
      x - previousLabel.x <
        Math.max(layout.minSpacing, requiredSpacing) &&
      selectedLabels.length > 1
    ) {
      selectedLabels.pop();
    }

    selectedLabels.push({
      anchor,
      key: `axis-label-${tick}`,
      label,
      x,
    });
  }

  return selectedLabels.map((tickLabel) => (
      <text
        key={tickLabel.key}
        x={tickLabel.x}
        y={layout.y}
        fill="#6f6f6f"
        fontFamily="Arial, sans-serif"
        fontSize={layout.fontSize}
        letterSpacing="-0.2px"
        textAnchor={tickLabel.anchor}
      >
        {tickLabel.label}
      </text>
    ));
};

const buildMarkerLines = (
  markers: TimelineMarker[],
  xScale: (value: number) => number,
): ReactNode[] => {
  const lines: ReactNode[] = [];
  for (const marker of markers) {
    const x = xScale(marker.minute);
    lines.push(
      <line
        key={`axis-marker-line-${marker.id}`}
        x1={x}
        x2={x}
        y1={0}
        y2={HEADER_HEIGHT}
        stroke={marker.color}
        strokeDasharray={marker.lineStyle === 'dashed' ? '4 4' : '0'}
        strokeWidth={1.8}
      />,
    );
  }

  return lines;
};

const buildMarkerLabels = (
  markers: TimelineMarker[],
  xScale: (value: number) => number,
): ReactNode[] => {
  const labels: ReactNode[] = [];
  for (const marker of markers) {
    const x = xScale(marker.minute);
    const labelWidth = Math.max(34, marker.label.length * 8 + 14);
    const rectX = x - labelWidth / 2;
    const isFilled = marker.labelVariant === 'filled';
    const labelFill = isFilled
      ? (marker.labelBackgroundColor ?? marker.color)
      : '#ffffff';
    const labelStroke = isFilled ? labelFill : marker.color;
    const textFill = isFilled
      ? (marker.labelTextColor ?? '#ffffff')
      : marker.color;
    labels.push(
      <g key={`axis-marker-label-${marker.id}`}>
        <rect
          x={rectX}
          y={29}
          width={labelWidth}
          height={15}
          fill={labelFill}
          rx={4}
          ry={4}
          stroke={labelStroke}
          strokeWidth={1}
        />
        <text
          x={x}
          y={40}
          fill={textFill}
          fontFamily="Arial, sans-serif"
          fontSize={10}
          fontWeight="700"
          textAnchor="middle"
        >
          {marker.label}
        </text>
      </g>,
    );
  }

  return labels;
};

const buildDateLabelNodes = (
  labels: TimelineDateLabelData[],
  timelineWidth: number,
  xScale: (value: number) => number,
): ReactNode[] => {
  const nodes: ReactNode[] = [];
  for (const labelData of labels) {
    const boundaryX = xScale(labelData.minute);
    const labelWidth = Math.max(
      44,
      labelData.label.length * 5.6 + DATE_LABEL_PADDING_X * 2,
    );
    const rectX = Math.max(
      0,
      Math.min(
        timelineWidth - labelWidth,
        boundaryX - labelWidth / 2,
      ),
    );
    nodes.push(
      <g key={`axis-date-${labelData.minute}`}>
        <rect
          x={rectX}
          y={DATE_LABEL_Y}
          width={labelWidth}
          height={DATE_LABEL_HEIGHT}
          fill="#ffffff"
          rx={2}
          ry={2}
          stroke="#d7d7d7"
          strokeWidth={1}
        />
        <text
          x={rectX + labelWidth / 2}
          y={DATE_LABEL_Y + DATE_LABEL_HEIGHT / 2}
          fill="#5f5f5f"
          fontFamily="Arial, sans-serif"
          fontSize={8}
          fontWeight="700"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {labelData.label}
        </text>
      </g>,
    );
  }

  return nodes;
};

/**
 * Header axis for relative minutes in the gantt timeline.
 */
export const FlightGanttTimelineAxis = ({
  markers,
  ticks,
  timelineStartDateMs,
  timelineWidth,
  xScale,
}: FlightGanttTimelineAxisProps): ReactNode => {
  const dateLabels = buildDateLabels(ticks, timelineStartDateMs);

  return (
    <div style={{ ...styles.axisContainer, width: timelineWidth }}>
      <div style={styles.axisBackground}>
        <svg width={timelineWidth} height={AXIS_HEIGHT}>
          {buildTickLines(ticks, xScale)}
          {buildDateLabelNodes(dateLabels, timelineWidth, xScale)}
          {buildMarkerLines(markers, xScale)}
          {buildTickLabels(ticks, xScale)}
          {buildMarkerLabels(markers, xScale)}
        </svg>
      </div>
    </div>
  );
};
