import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  canCreateFlightTaskComments,
  canManageFlightTaskActions,
} from '@/domain/services/flight-task-permissions';
import type { FlightComment } from '@/domain/entities/flight-comment';
import { useFlightCommentsStoreAdapter } from '@/presentation/adapters/redux/flight-comments-store-adapter';
import { useAuthSelector } from '@/presentation/adapters/redux/use-auth-selector';

import type { FlightTaskActionResult } from './use-flight-task-actions';

const FALLBACK_TIME = '--:--';

export type TaskEditTarget = {
  instanceId: string;
  title: string;
  statusTone: 'pending' | 'in_progress' | 'completed';
  statusLabel: string;
  startTimeLabel?: string | null;
  endTimeLabel?: string | null;
  tipoEvento?: string;
};

export type TaskEditModalController<TTask extends TaskEditTarget> = {
  isOpen: boolean;
  task: TTask | null;
  startTime: string;
  endTime: string;
  draftComment: string;
  comments: FlightComment[];
  commentsLoading: boolean;
  commentsSubmitting: boolean;
  commentsError?: string;
  actionLoading: boolean;
  actionError?: string;
  isReadOnly: boolean;
  isHito: boolean;
  canSendComment: boolean;
  canPerformPrimaryAction: boolean;
  canResetTask: boolean;
  isStartEditable: boolean;
  isEndEditable: boolean;
  primaryActionLabel: string;
  taskStatusLabel: string;
  taskStatusTone: TTask['statusTone'] | 'pending' | 'in_progress' | 'completed';
  open: (task: TTask) => void;
  close: () => void;
  changeStartTime: (value: string) => void;
  changeEndTime: (value: string) => void;
  changeDraftComment: (value: string) => void;
  sendComment: () => void;
  performPrimaryAction: () => void;
  resetTask: () => void;
};

type UseTaskEditModalControllerOptions<TTask extends TaskEditTarget> = {
  flightId?: string | null;
  onStartTask: (task: TTask, time: string) => Promise<FlightTaskActionResult>;
  onFinishTask: (task: TTask, time: string) => Promise<FlightTaskActionResult>;
  onUpdateTask: (
    task: TTask,
    startTime: string,
    endTime: string,
  ) => Promise<FlightTaskActionResult>;
};

const getEditableTimeValue = (value?: string | null): string => {
  if (!value || value === FALLBACK_TIME) {
    return '';
  }

  return value;
};

/**
 * Normalises a raw keystroke sequence into a strict "HH:mm" mask.
 * Strips all non-digit characters, then re-inserts the colon at position 2.
 * The colon is never removed, so the value always stays in "HH:mm" format.
 */
const normalizeTimeInput = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
};

const getPrimaryActionLabel = (
  tone: TaskEditTarget['statusTone'],
  isHito: boolean,
): string => {
  if (isHito) {
    return tone === 'completed' ? 'Actualizar' : 'Completar';
  }

  if (tone === 'completed') {
    return 'Actualizar';
  }

  if (tone === 'in_progress') {
    return 'Finalizar';
  }

  return 'Iniciar';
};

const getResetTaskResult = (): FlightTaskActionResult => ({
  statusTone: 'pending',
  statusLabel: 'Pendiente',
  startTimeLabel: FALLBACK_TIME,
  endTimeLabel: FALLBACK_TIME,
  durationLabel: FALLBACK_TIME,
});

export const useTaskEditModalController = <TTask extends TaskEditTarget>({
  flightId,
  onStartTask,
  onFinishTask,
  onUpdateTask,
}: UseTaskEditModalControllerOptions<TTask>): TaskEditModalController<TTask> => {
  const { comments, loading, submitting, error, sendComment, clearComments } =
    useFlightCommentsStoreAdapter();
  const { role } = useAuthSelector();

  const [editingTask, setEditingTask] = useState<TTask | null>(null);
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editComment, setEditComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | undefined>(undefined);
  const canManageTaskActions = canManageFlightTaskActions(role);
  const canComment = canCreateFlightTaskComments(role);
  const isReadOnly = !canManageTaskActions && !canComment;

  const close = useCallback(() => {
    setEditingTask(null);
    setEditStartTime('');
    setEditEndTime('');
    setEditComment('');
    setActionLoading(false);
    setActionError(undefined);
    clearComments();
  }, [clearComments]);

  useEffect(() => {
    close();
  }, [close, flightId]);

  const open = useCallback(
    (task: TTask) => {
      clearComments();
      setEditingTask(task);
      setEditStartTime(getEditableTimeValue(task.startTimeLabel));
      setEditEndTime(getEditableTimeValue(task.endTimeLabel));
      setEditComment('');
      setActionLoading(false);
      setActionError(undefined);
    },
    [clearComments],
  );

  const changeStartTime = useCallback((value: string) => {
    setEditStartTime(normalizeTimeInput(value));
  }, []);

  const changeEndTime = useCallback((value: string) => {
    setEditEndTime(normalizeTimeInput(value));
  }, []);

  const changeDraftComment = useCallback((value: string) => {
    setEditComment(value);
  }, []);

  const hasDraftComment = editComment.trim().length > 0;
  const canSendComment =
    canComment && Boolean(editingTask) && hasDraftComment && !submitting;

  const initialEditStartTime = editingTask
    ? getEditableTimeValue(editingTask.startTimeLabel)
    : '';
  const initialEditEndTime = editingTask
    ? getEditableTimeValue(editingTask.endTimeLabel)
    : '';
  const isCompleted = editingTask?.statusTone === 'completed';
  const isInProgress = editingTask?.statusTone === 'in_progress';
  const isHito =
    editingTask?.tipoEvento?.toUpperCase() === 'HITO';

  const isStartEditable = isHito
    ? false
    : Boolean(editingTask) &&
      canManageTaskActions &&
      !isInProgress &&
      !actionLoading;
  const isEndEditable = isHito
    ? Boolean(editingTask) && canManageTaskActions && !actionLoading
    : Boolean(editingTask) &&
      canManageTaskActions &&
      (isInProgress || isCompleted) &&
      !actionLoading;

  const hasTaskAction = isHito
    ? Boolean(editingTask) &&
      (isCompleted
        ? editEndTime !== initialEditEndTime
        : editEndTime.trim().length > 0)
    : Boolean(editingTask) &&
      (editingTask?.statusTone === 'pending'
        ? editStartTime.trim().length > 0
        : editingTask?.statusTone === 'in_progress'
          ? editEndTime.trim().length > 0
          : editStartTime !== initialEditStartTime ||
            editEndTime !== initialEditEndTime);
  const canPerformPrimaryAction =
    Boolean(editingTask) &&
    !actionLoading &&
    ((canManageTaskActions && hasTaskAction) ||
      (canComment && hasDraftComment));
  const canResetTask =
    Boolean(editingTask) &&
    canManageTaskActions &&
    !actionLoading &&
    (initialEditStartTime.length > 0 ||
      initialEditEndTime.length > 0 ||
      editingTask?.statusTone !== 'pending');

  const submitTaskComment = useCallback(async () => {
    if (!editingTask || !canComment || !hasDraftComment) {
      return;
    }

    await sendComment({
      taskInstanceId: editingTask.instanceId,
      message: editComment.trim(),
    });
    setEditComment('');
  }, [canComment, editComment, editingTask, hasDraftComment, sendComment]);

  const sendTaskComment = useCallback(() => {
    void submitTaskComment();
  }, [submitTaskComment]);

  const applyTaskResult = useCallback((result: FlightTaskActionResult) => {
    setEditingTask((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        statusTone: result.statusTone,
        statusLabel: result.statusLabel,
        startTimeLabel: result.startTimeLabel ?? current.startTimeLabel,
        endTimeLabel: result.endTimeLabel ?? current.endTimeLabel,
      };
    });
  }, []);

  const performPrimaryAction = useCallback(() => {
    if (!editingTask || !canPerformPrimaryAction || actionLoading) {
      return;
    }

    setActionLoading(true);
    setActionError(undefined);

    void (async () => {
      if (canManageTaskActions && hasTaskAction) {
        let result: FlightTaskActionResult;

        if (isHito) {
          if (isCompleted) {
            result = await onUpdateTask(editingTask, editEndTime, editEndTime);
          } else {
            await onStartTask(editingTask, editEndTime);
            result = await onFinishTask(
              { ...editingTask, startTimeLabel: editEndTime },
              editEndTime,
            );
          }
        } else {
          result =
            editingTask.statusTone === 'pending'
              ? await onStartTask(editingTask, editStartTime)
              : editingTask.statusTone === 'in_progress'
                ? await onFinishTask(editingTask, editEndTime)
                : await onUpdateTask(editingTask, editStartTime, editEndTime);
        }

        applyTaskResult(result);
      }

      if (canComment && hasDraftComment) {
        await submitTaskComment();
      }

      close();
    })()
      .catch((reason: unknown) => {
        const message =
          reason instanceof Error
            ? reason.message
            : 'No se pudo guardar la tarea. Intenta de nuevo.';
        setActionError(message);
      })
      .finally(() => {
        setActionLoading(false);
      });
  }, [
    actionLoading,
    applyTaskResult,
    canComment,
    canManageTaskActions,
    canPerformPrimaryAction,
    close,
    editEndTime,
    editStartTime,
    editingTask,
    hasDraftComment,
    hasTaskAction,
    onFinishTask,
    onStartTask,
    onUpdateTask,
    submitTaskComment,
  ]);

  const resetTask = useCallback(() => {
    if (
      !editingTask ||
      !canManageTaskActions ||
      !canResetTask ||
      actionLoading
    ) {
      return;
    }

    setActionLoading(true);
    setActionError(undefined);

    void onUpdateTask(editingTask, '', '')
      .then(async () => {
        applyTaskResult(getResetTaskResult());

        if (hasDraftComment) {
          await submitTaskComment();
        }

        close();
      })
      .catch((reason: unknown) => {
        const message =
          reason instanceof Error
            ? reason.message
            : 'No se pudo guardar la tarea. Intenta de nuevo.';
        setActionError(message);
      })
      .finally(() => {
        setActionLoading(false);
      });
  }, [
    actionLoading,
    applyTaskResult,
    canManageTaskActions,
    canResetTask,
    close,
    editingTask,
    hasDraftComment,
    onUpdateTask,
    submitTaskComment,
  ]);

  return useMemo(
    () => ({
      isOpen: Boolean(editingTask),
      task: editingTask,
      startTime: editStartTime,
      endTime: editEndTime,
      draftComment: editComment,
      comments,
      commentsLoading: loading,
      commentsSubmitting: submitting,
      commentsError: error,
      actionLoading,
      actionError,
      isReadOnly,
      isHito: Boolean(isHito),
      canSendComment,
      canPerformPrimaryAction,
      canResetTask,
      isStartEditable,
      isEndEditable,
      primaryActionLabel: getPrimaryActionLabel(
        editingTask?.statusTone ?? 'pending',
        Boolean(isHito),
      ),
      taskStatusLabel: editingTask?.statusLabel ?? 'Pendiente',
      taskStatusTone: editingTask?.statusTone ?? 'pending',
      open,
      close,
      changeStartTime,
      changeEndTime,
      changeDraftComment,
      sendComment: sendTaskComment,
      performPrimaryAction,
      resetTask,
    }),
    [
      actionError,
      actionLoading,
      canComment,
      canManageTaskActions,
      canPerformPrimaryAction,
      canResetTask,
      canSendComment,
      changeDraftComment,
      changeEndTime,
      changeStartTime,
      close,
      comments,
      editComment,
      editEndTime,
      editingTask,
      editStartTime,
      error,
      isEndEditable,
      isReadOnly,
      isStartEditable,
      loading,
      open,
      performPrimaryAction,
      resetTask,
      sendTaskComment,
      submitting,
    ],
  );
};
