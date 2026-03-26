import { useCallback, useEffect, useMemo, useState } from 'react';

import { canCreateFlightTaskComments } from '@/domain/services/flight-task-permissions';
import { useFlightCommentsStoreAdapter } from '@/presentation/adapters/redux/flight-comments-store-adapter';
import { useAuthSelector } from '@/presentation/adapters/redux/use-auth-selector';

type CommentsDrawerController = {
  comments: ReturnType<typeof useFlightCommentsStoreAdapter>['comments'];
  loading: boolean;
  error?: string;
  submitting: boolean;
  isOpen: boolean;
  draftComment: string;
  canComment: boolean;
  canSubmitComment: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  changeDraftComment: (value: string) => void;
  submitComment: () => void;
};

export const useCommentsDrawerController = (
  taskInstanceId?: string | null,
): CommentsDrawerController => {
  const {
    comments,
    loading,
    submitting,
    error,
    loadComments,
    sendComment,
    clearComments,
  } = useFlightCommentsStoreAdapter();
  const { role } = useAuthSelector();
  const [isOpen, setIsOpen] = useState(false);
  const [draftComment, setDraftComment] = useState('');
  const canComment = canCreateFlightTaskComments(role);

  // Load (or reload) comments whenever the drawer is open and the task changes.
  // Clearing before fetching prevents stale comments from a previous task
  // being visible while the new request is in-flight.
  useEffect(() => {
    if (!isOpen || !taskInstanceId) {
      return;
    }

    void clearComments();
    void loadComments(taskInstanceId);
  }, [isOpen, loadComments, clearComments, taskInstanceId]);

  const openDrawer = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    setDraftComment('');
    void clearComments();
  }, [clearComments]);

  const toggleDrawer = useCallback(() => {
    setIsOpen((current) => {
      if (current) {
        setDraftComment('');
        void clearComments();
      }

      return !current;
    });
  }, [clearComments]);

  const changeDraftComment = useCallback((value: string) => {
    setDraftComment(value);
  }, []);

  const submitComment = useCallback((): void => {
    const message = draftComment.trim();
    if (!canComment || !message || !taskInstanceId) {
      return;
    }

    void sendComment({
      taskInstanceId,
      message,
    });

    setDraftComment('');
  }, [canComment, draftComment, taskInstanceId, sendComment]);

  const canSubmitComment =
    canComment &&
    draftComment.trim().length > 0 &&
    !submitting &&
    !!taskInstanceId;

  return useMemo(
    () => ({
      comments,
      loading,
      error,
      submitting,
      isOpen,
      draftComment,
      canComment,
      canSubmitComment,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      changeDraftComment,
      submitComment,
    }),
    [
      canComment,
      comments,
      loading,
      error,
      submitting,
      isOpen,
      draftComment,
      canSubmitComment,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      changeDraftComment,
      submitComment,
    ],
  );
};
