import { useSelector } from 'react-redux';

import type { AuthSession } from '@/domain/entities/auth-session';
import type { RootState } from '@/store';
import type { AuthRole } from '@/store/slices/auth-slice';

export const useAuthSelector = (): {
  session: AuthSession | null;
  role: AuthRole | null;
  userName: string;
  userPhotoUrl: string;
} => {
  const session = useSelector((state: RootState) => state.auth.session);
  const role = useSelector((state: RootState) => state.auth.role);
  const userName = useSelector((state: RootState) => state.auth.userName);
  const userPhotoUrl = useSelector(
    (state: RootState) => state.auth.userPhotoUrl,
  );

  return { session, role, userName, userPhotoUrl };
};
