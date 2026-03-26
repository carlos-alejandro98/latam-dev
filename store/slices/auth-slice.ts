import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { AuthSession } from '@/domain/entities/auth-session';

export type AuthRole =
  | 'admin'
  | 'viewer'
  | 'controller'
  | 'above_the_wing'  // Display: Embarque
  | 'below_the_wing'; // Display: DOT

interface AuthState {
  session: AuthSession | null;
  /** null means the user authenticated but had no recognised app role. */
  role: AuthRole | null;
  userName: string;
  /** Base64 data URL of the user profile photo fetched from Microsoft Graph */
  userPhotoUrl: string;
}

const initialState: AuthState = {
  session: null,
  role: null,
  userName: '',
  userPhotoUrl: '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<AuthSession | null>) => {
      state.session = action.payload;
      state.userName = action.payload?.userName ?? state.userName;
      state.userPhotoUrl = action.payload?.userPhotoUrl ?? state.userPhotoUrl;
    },
    clearSession: (state) => {
      state.session = null;
      state.userName = '';
      state.userPhotoUrl = '';
    },
    setRole: (state, action: PayloadAction<AuthRole | null>) => {
      state.role = action.payload;
    },
    setUserName: (state, action: PayloadAction<string>) => {
      state.userName = action.payload;
    },
    setUserPhotoUrl: (state, action: PayloadAction<string>) => {
      state.userPhotoUrl = action.payload;
    },
  },
});

export const { setSession, clearSession, setRole, setUserName, setUserPhotoUrl } = authSlice.actions;
export default authSlice.reducer;
