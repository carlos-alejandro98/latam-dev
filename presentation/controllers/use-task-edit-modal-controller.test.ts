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

  it('prefills planned start and end times for tasks without real times', () => {
    (useAuthSelector as jest.Mock).mockReturnValue({
      session: null,
      role: 'controller',
      userName: '',
      userPhotoUrl: '',
    });

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
        plannedStartTime: '10:00',
        plannedEndTime: '10:15',
      });
    });

    expect(result.current.startTime).toBe('10:00');
    expect(result.current.endTime).toBe('10:15');
    expect(result.current.canPerformPrimaryAction).toBe(true);
  });

  it('prefills the hito time with the marked time or planned time when opening the modal', () => {
    (useAuthSelector as jest.Mock).mockReturnValue({
      session: null,
      role: 'controller',
      userName: '',
      userPhotoUrl: '',
    });

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
        instanceId: 'hito-1',
        title: 'Push Back',
        statusTone: 'completed',
        statusLabel: 'Finalizado',
        startTimeLabel: '11:05',
        endTimeLabel: '--:--',
        plannedStartTime: '11:00',
        plannedEndTime: '11:00',
        tipoEvento: 'HITO',
      });
    });

    expect(result.current.isHito).toBe(true);
    expect(result.current.endTime).toBe('11:05');
  });

  it('enables only the start field for pending tasks and only the end field for in-progress tasks', () => {
    (useAuthSelector as jest.Mock).mockReturnValue({
      session: null,
      role: 'controller',
      userName: '',
      userPhotoUrl: '',
    });

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
        instanceId: 'task-pending',
        title: 'Inicio task',
        statusTone: 'pending',
        statusLabel: 'Pendiente',
        startTimeLabel: '--:--',
        endTimeLabel: '--:--',
        plannedStartTime: '10:00',
        plannedEndTime: '10:15',
      });
    });

    expect(result.current.isStartEditable).toBe(true);
    expect(result.current.isEndEditable).toBe(false);

    act(() => {
      result.current.open({
        instanceId: 'task-progress',
        title: 'Termino task',
        statusTone: 'in_progress',
        statusLabel: 'En progreso',
        startTimeLabel: '10:00',
        endTimeLabel: '--:--',
        plannedStartTime: '10:00',
        plannedEndTime: '10:15',
      });
    });

    expect(result.current.isStartEditable).toBe(false);
    expect(result.current.isEndEditable).toBe(true);
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
