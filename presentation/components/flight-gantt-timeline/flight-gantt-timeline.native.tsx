import { Text, View } from "react-native";

import type { FlightGanttTask } from "@/domain/entities/flight-gantt";
import type { TimelineTaskRowData } from "@/presentation/components/flight-gantt-timeline/flight-gantt-timeline.types";

import { styles } from "./flight-gantt-timeline.styles";

import type { ReactElement } from "react";

export type FlightGanttTimelineProps = {
  staDate?: string | null;
  staTime?: string | null;
  etaDate?: string | null;
  etaTime?: string | null;
  stdDate?: string | null;
  stdTime?: string | null;
  etdDate?: string | null;
  etdTime?: string | null;
  pushOutTime?: string | null;
  tatVueloMinutos?: number | null;
  tasks: FlightGanttTask[];
  onRowClick?: (rowData: TimelineTaskRowData) => void;
};

/**
 * Native fallback. The gantt timeline is only used on web.
 */
export const FlightGanttTimeline = (
  props: FlightGanttTimelineProps,
): ReactElement => {
  void props;
  return (
    <View style={styles.nativeFallbackContainer}>
      <Text style={styles.nativeFallbackText}>
        Flight gantt timeline is not available on native.
      </Text>
    </View>
  );
};
