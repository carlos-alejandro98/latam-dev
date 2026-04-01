import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Dimensions, Platform } from "react-native";

import { container } from "@/dependencyInjection/container";
import type { FlightComment } from "@/domain/entities/flight-comment";
import {
  resolveFlightCommentAuthorLabel,
  type FlightCommentSurface,
} from "@/domain/services/flight-comment-author";
import type { RootState } from "@/store";

type CreateFlightCommentPayload = {
  taskInstanceId: string;
  message: string;
};

const NATIVE_TABLET_MIN_DIMENSION_DP = 600;

const resolveFlightCommentSurface = (): FlightCommentSurface => {
  if (Platform.OS === "web") {
    return "web";
  }

  const { width, height } = Dimensions.get("window");
  const minDimension = Math.min(width, height);
  const isTablet = Platform.OS === "ios"
    ? Boolean(Platform.isPad)
    : minDimension >= NATIVE_TABLET_MIN_DIMENSION_DP;

  return isTablet ? "tablet" : "mobile";
};

export const fetchFlightComments = createAsyncThunk(
  "flightComments/fetchByTaskInstanceId",
  async (taskInstanceId: string) => {
    return container.getFlightCommentsUseCase.execute(taskInstanceId);
  },
);

export const createFlightComment = createAsyncThunk(
  "flightComments/create",
  async (
    { taskInstanceId, message }: CreateFlightCommentPayload,
    { getState },
  ) => {
    const state = getState() as RootState;
    const createdBy = resolveFlightCommentAuthorLabel({
      role: state.auth.role,
      surface: resolveFlightCommentSurface(),
    });

    return container.createFlightCommentUseCase.execute({
      taskInstanceId,
      message,
      authorCode: createdBy,
      authorName: createdBy,
    });
  },
);

interface FlightCommentsState {
  data: FlightComment[];
  loading: boolean;
  submitting: boolean;
  error?: string;
  taskInstanceId?: string;
}

const initialState: FlightCommentsState = {
  data: [],
  loading: false,
  submitting: false,
};

const flightCommentsSlice = createSlice({
  name: "flightComments",
  initialState,
  reducers: {
    clearFlightComments: (state) => {
      state.data = [];
      state.error = undefined;
      state.taskInstanceId = undefined;
      state.loading = false;
      state.submitting = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFlightComments.pending, (state, action) => {
        state.loading = true;
        state.error = undefined;
        state.taskInstanceId = action.meta.arg;
      })
      .addCase(fetchFlightComments.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchFlightComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createFlightComment.pending, (state) => {
        state.submitting = true;
        state.error = undefined;
      })
      .addCase(createFlightComment.fulfilled, (state, action) => {
        state.submitting = false;
        const isAlreadyInState = state.data.some(
          (comment) => comment.id === action.payload.id,
        );

        if (!isAlreadyInState) {
          state.data = [action.payload, ...state.data];
        }
      })
      .addCase(createFlightComment.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.error.message;
      });
  },
});

export const { clearFlightComments } = flightCommentsSlice.actions;

export default flightCommentsSlice.reducer;
