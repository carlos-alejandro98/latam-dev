import type { FlightGanttTask } from "@/domain/entities/flight-gantt";

export interface TimelineBarRange {
  endMinute: number;
  startMinute: number;
}

export interface TimelineDomain {
  maxMinute: number;
  minMinute: number;
  stdMinute: number | null;
  timelineStartDateMs: number;
}

export interface TimelineMarker {
  color: string;
  id: string;
  label: string;
  labelBackgroundColor?: string;
  labelTextColor?: string;
  labelVariant?: "filled" | "outlined";
  lineStyle: "dashed" | "solid";
  minute: number;
}

export interface TimelineTaskRowData {
  calculatedRange: TimelineBarRange | null;
  estado: string;
  isDelayed: boolean;
  realRange: TimelineBarRange | null;
  task: FlightGanttTask;
}

export interface GanttSavedBar {
  taskName: string;
  startTime: string; // "HH:mm" absolute
  endTime: string;   // "HH:mm" absolute
  comment: string;
}
