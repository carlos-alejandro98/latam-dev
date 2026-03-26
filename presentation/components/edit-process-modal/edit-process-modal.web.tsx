// This modal is native-only (mobile/tablet APKs).
// On web the CommentsDrawer handles process editing instead.

export type EditProcessModalProps = {
  visible: boolean;
  processName: string;
  startTime: string;
  endTime: string;
  onClose: () => void;
  onSave: (startTime: string, endTime: string, comment: string) => void;
  onReset: () => void;
};

export const EditProcessModal = (_props: EditProcessModalProps): null => null;
