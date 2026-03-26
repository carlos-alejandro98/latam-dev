import { AXIS_HEIGHT, HEADER_HEIGHT, styles } from "./flight-gantt-timeline.styles";
import { formatAbsoluteMinute } from "./flight-gantt-timeline.utils";

import type { TimelineMarker } from "./flight-gantt-timeline.types";
import type { ReactNode } from "react";

type FlightGanttTimelineAxisProps = {
  markers: TimelineMarker[];
  ticks: number[];
  timelineWidth: number;
  xScale: (value: number) => number;
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

const buildTickLabels = (
  ticks: number[],
  xScale: (value: number) => number,
): ReactNode[] => {
  const labels: ReactNode[] = [];
  const lastIndex = ticks.length - 1;
  for (let i = 0; i < ticks.length; i++) {
    const tick = ticks[i];
    const x = xScale(tick);
    // First tick: anchor to start so it doesn't clip on the left edge
    // Last tick: anchor to end so it doesn't clip on the right edge
    // All others: centered on the tick line
    const anchor =
      i === 0 ? "start" : i === lastIndex ? "end" : "middle";
    labels.push(
      <text
        key={`axis-label-${tick}`}
        x={x}
        y={14}
        fill="#6f6f6f"
        fontFamily="Arial, sans-serif"
        fontSize={11}
        textAnchor={anchor}
      >
        {formatAbsoluteMinute(tick)}
      </text>,
    );
  }

  return labels;
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
        strokeDasharray={marker.lineStyle === "dashed" ? "4 4" : "0"}
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
    const isFilled = marker.labelVariant === "filled";
    const labelFill = isFilled
      ? marker.labelBackgroundColor ?? marker.color
      : "#ffffff";
    const labelStroke = isFilled ? labelFill : marker.color;
    const textFill = isFilled ? marker.labelTextColor ?? "#ffffff" : marker.color;
    labels.push(
      <g key={`axis-marker-label-${marker.id}`}>
        <rect
          x={rectX}
          y={24}
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
          y={35}
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

/**
 * Header axis for relative minutes in the gantt timeline.
 */
export const FlightGanttTimelineAxis = ({
  markers,
  ticks,
  timelineWidth,
  xScale,
}: FlightGanttTimelineAxisProps): ReactNode => {
  return (
    <div style={{ ...styles.axisContainer, width: timelineWidth }}>
      <div style={styles.axisBackground}>
        <svg width={timelineWidth} height={AXIS_HEIGHT}>
          {buildTickLines(ticks, xScale)}
          {buildMarkerLines(markers, xScale)}
          {buildTickLabels(ticks, xScale)}
          {buildMarkerLabels(markers, xScale)}
        </svg>
      </div>
    </div>
  );
};
