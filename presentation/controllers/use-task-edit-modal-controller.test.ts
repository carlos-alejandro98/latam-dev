import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';

import { useFlightCommentsStoreAdapter } from '@/presentation/adapters/redux/flight-comments-store-adapter';
import { useAuthSelector } from '@/presentation/adapters/redux/use-auth-selector';

import { useTaskEditModalController } from './use-task-edit-modal-controller';
import type { FlightTaskActionResult } from './use-flight-task-actions';

jest.mock(
  '@/presentation/adapters/redux/flight-comments-store-adapter',
  () => ({
    useFlightCommentsStoreAdapter: jest.fn(),
  }),
);

jest.mock('@/presentation/adapters/redux/use-auth-selector', () => ({
  useAuthSelector: jest.fn(),
}));

describe('useTaskEditModalController', () => {
  const sendCommentMock = jest.fn();
  const clearCommentsMock = jest.fn();
  const onStartTaskMock = jest.fn();
  const onFinishTaskMock = jest.fn();
  const onUpdateTaskMock = jest.fn();

  const startTaskHandler = onStartTaskMock as unknown as (
    task: {
      instanceId: string;
      title: string;
      statusTone: 'pending' | 'in_progress' | 'completed';
      statusLabel: string;
      startTimeLabel?: string | null;
      endTimeLabel?: string | null;
    },
    time: string,
  ) => Promise<FlightTaskActionResult>;

  const finishTaskHandler = onFinishTaskMock as unknown as (
    task: {
      instanceId: string;
      title: string;
      statusTone: 'pending' | 'in_progress' | 'completed';
      statusLabel: string;
      startTimeLabel?: string | null;
      endTimeLabel?: string | null;
    },
    time: string,
  ) => Promise<FlightTaskActionResult>;

  const updateTaskHandler = onUpdateTaskMock as unknown as (
    task: {
      instanceId: string;
      title: string;
      statusTone: 'pending' | 'in_progress' | 'completed';
      statusLabel: string;
      startTimeLabel?: string | null;
      endTimeLabel?: string | null;
    },
    startTime: string,
    endTime: string,
  ) => Promise<FlightTaskActionResult>;

  beforeEach(() => {
    jest.clearAllMocks();

    (useFlightCommentsStoreAdapter as jest.Mock).mockReturnValue({
      comments: [],
      loading: false,
      submitting: false,
      error: undefined,
      sendComment: sendCommentMock,
      clearComments: clearCommentsMock,
    });

    (useAuthSelector as jest.Mock).mockReturnValue({
      session: null,
      role: 'viewer',
      userName: '',
      userPhotoUrl: '',
    });
  });

  it('opens in read-only mode for viewers and blocks task changes', () => {
    const { result } = renderHook(() =>
      useTaskEditModalController({
        flightId: 'flight-1',
        onStartTask: startTaskHandler,
        onFinishTask: finishTaskHandler,
        onUpdateTask: updateTaskHandler,
      }),
    );

    act(() => {
      result.current.open({
        instanceId: 'task-1',
        title: 'Pushback',
        statusTone: 'pending',
        statusLabel: 'Pendiente',
        startTimeLabel: '--:--',
        endTimeLabel: '--:--',
      });
      result.current.changeDraftComment('Comentario');
      result.current.changeStartTime('10:00');
    });

    expect(result.current.isReadOnly).toBe(true);
    expect(result.current.canSendComment).toBe(false);
    expect(result.current.canPerformPrimaryAction).toBe(false);
    expect(result.current.canResetTask).toBe(false);
    expect(result.current.isStartEditable).toBe(false);
    expect(result.current.isEndEditable).toBe(false);

    act(() => {
      result.current.sendComment();
      result.current.performPrimaryAction();
      result.current.resetTask();
    });

    expect(sendCommentMock).not.toHaveBeenCalled();
    expect(onStartTaskMock).not.toHaveBeenCalled();
    expect(onFinishTaskMock).not.toHaveBeenCalled();
    expect(onUpdateTaskMock).not.toHaveBeenCalled();
  });
});
