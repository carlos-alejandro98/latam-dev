import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';

import { useFlightCommentsStoreAdapter } from '@/presentation/adapters/redux/flight-comments-store-adapter';
import { useAuthSelector } from '@/presentation/adapters/redux/use-auth-selector';

import { useCommentsDrawerController } from './use-comments-drawer-controller';

jest.mock(
  '@/presentation/adapters/redux/flight-comments-store-adapter',
  () => ({
    useFlightCommentsStoreAdapter: jest.fn(),
  }),
);

jest.mock('@/presentation/adapters/redux/use-auth-selector', () => ({
  useAuthSelector: jest.fn(),
}));

describe('useCommentsDrawerController', () => {
  const loadCommentsMock = jest.fn();
  const sendCommentMock = jest.fn();
  const clearCommentsMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useFlightCommentsStoreAdapter as jest.Mock).mockReturnValue({
      comments: [],
      loading: false,
      submitting: false,
      error: undefined,
      loadComments: loadCommentsMock,
      sendComment: sendCommentMock,
      clearComments: clearCommentsMock,
    });

    (useAuthSelector as jest.Mock).mockReturnValue({
      session: null,
      role: 'controller',
      userName: '',
      userPhotoUrl: '',
    });
  });

  it('prevents viewers from submitting comments', () => {
    (useAuthSelector as jest.Mock).mockReturnValue({
      session: null,
      role: 'viewer',
      userName: '',
      userPhotoUrl: '',
    });

    const { result } = renderHook(() =>
      useCommentsDrawerController('task-instance-1'),
    );

    act(() => {
      result.current.changeDraftComment('Comentario viewer');
    });

    expect(result.current.canComment).toBe(false);
    expect(result.current.canSubmitComment).toBe(false);

    act(() => {
      result.current.submitComment();
    });

    expect(sendCommentMock).not.toHaveBeenCalled();
  });

  it('allows non-viewers to submit comments', () => {
    const { result } = renderHook(() =>
      useCommentsDrawerController('task-instance-1'),
    );

    act(() => {
      result.current.changeDraftComment('  Comentario controller  ');
    });

    expect(result.current.canComment).toBe(true);
    expect(result.current.canSubmitComment).toBe(true);

    act(() => {
      result.current.submitComment();
    });

    expect(sendCommentMock).toHaveBeenCalledWith({
      taskInstanceId: 'task-instance-1',
      message: 'Comentario controller',
    });
  });
});
