import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "@/store";
import {
  clearFlightComments,
  createFlightComment,
  fetchFlightComments,
} from "@/store/slices/flight-comments-slice";

type SendCommentInput = {
  taskInstanceId: string;
  message: string;
};

type FlightCommentsStoreAdapter = {
  comments: RootState["flightComments"]["data"];
  loading: RootState["flightComments"]["loading"];
  submitting: RootState["flightComments"]["submitting"];
  error: RootState["flightComments"]["error"];
  loadComments: (taskInstanceId: string) => Promise<void>;
  sendComment: (input: SendCommentInput) => Promise<void>;
  clearComments: () => void;
};

export const useFlightCommentsStoreAdapter = (): FlightCommentsStoreAdapter => {
  const dispatch = useDispatch<AppDispatch>();

  const comments = useSelector((state: RootState) => state.flightComments.data);
  const loading = useSelector((state: RootState) => state.flightComments.loading);
  const submitting = useSelector((state: RootState) => state.flightComments.submitting);
  const error = useSelector((state: RootState) => state.flightComments.error);

  const loadComments = useCallback(
    async (taskInstanceId: string): Promise<void> => {
      await dispatch(fetchFlightComments(taskInstanceId));
    },
    [dispatch],
  );

  const sendComment = useCallback(
    async ({ taskInstanceId, message }: SendCommentInput): Promise<void> => {
      await dispatch(createFlightComment({ taskInstanceId, message }));
    },
    [dispatch],
  );

  const clearComments = useCallback((): void => {
    dispatch(clearFlightComments());
  }, [dispatch]);

  return {
    comments,
    loading,
    submitting,
    error,
    loadComments,
    sendComment,
    clearComments,
  };
};
