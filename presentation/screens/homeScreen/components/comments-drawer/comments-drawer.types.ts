import type { FlightComment } from '@/domain/entities/flight-comment';

export type TaskStatus = 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | string;

export type SelectedProcess = {
  name: string;
  startTime: string;
  endTime: string;
  taskInstanceId: string;
  taskStatus: TaskStatus;
  /** Planned start time "HH:mm" from the calculated range — used to detect delays */
  plannedStartTime?: string;
  /** Planned end time "HH:mm" from the calculated range — used to detect delays */
  plannedEndTime?: string;
};

export type SavedBarData = {
  taskName: string;
  startTime: string;
  endTime: string;
  comment: string;
};

export type CommentsDrawerProps = {
  isOpen: boolean;
  drawerWidth: number;
  comments: FlightComment[];
  loading: boolean;
  submitting: boolean;
  draftComment: string;
  canComment: boolean;
  canSendComment: boolean;
  canManageTaskActions: boolean;
  error?: string;
  selectedProcess?: SelectedProcess | null;
  onClose: () => void;
  onChangeDraftComment: (value: string) => void;
  onSendComment: () => void;
  onSave?: (data: SavedBarData) => void;
  onChangeStartTime?: (value: string) => void;
  onChangeEndTime?: (value: string) => void;
  ganttLoading?: boolean;
  onStartTask?: (taskInstanceId: string, time: string) => Promise<void>;
  onFinishTask?: (taskInstanceId: string, time: string) => Promise<void>;
  onUpdateTask?: (
    taskInstanceId: string,
    startTime: string,
    endTime: string,
  ) => Promise<void>;
};
