import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { AuthSession } from '@/domain/entities/auth-session';
import type { AppDispatch, RootState } from '@/store';
import { clearSession, setRole, setSession } from '@/store/slices/auth-slice';
import type { AuthRole } from '@/store/slices/auth-slice';

export const useAuthStoreAdapter = () => {
  const dispatch = useDispatch<AppDispatch>();
  const session = useSelector((state: RootState) => state.auth.session);
  const role = useSelector((state: RootState) => state.auth.role);
  const handleSetSession = useCallback(
    (authSession: AuthSession) => dispatch(setSession(authSession)),
    [dispatch],
  );
  const handleClearSession = useCallback(() => dispatch(clearSession()), [dispatch]);
  const handleSetRole = useCallback(
    (authRole: AuthRole) => dispatch(setRole(authRole)),
    [dispatch],
  );

  return {
    session,
    role,
    setSession: handleSetSession,
    clearSession: handleClearSession,
    setRole: handleSetRole,
  };
};
