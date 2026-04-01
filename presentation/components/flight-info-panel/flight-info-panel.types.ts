import type { TimelineTaskRowData } from '@/presentation/components/flight-gantt-timeline/flight-gantt-timeline.types';
import type { FlightInfoPanelViewModel } from '@/presentation/view-models/flight-info-panel-view-model';

export interface FlightInfoPanelProps {
  viewModel: FlightInfoPanelViewModel | null;
  loading?: boolean;
  error?: string;
  onRowClick?: (rowData: TimelineTaskRowData) => void;
}
