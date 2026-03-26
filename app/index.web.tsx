import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';

import type { RootState } from '@/store';

/**
 * Web root route.
 * Redirects to /turnaround when an active session exists in Redux,
 * otherwise sends the user to /login.
 */
export default function WebIndexRoute() {
  const session = useSelector((state: RootState) => state.auth.session);

  if (session?.accessToken) {
    return <Redirect href={'/turnaround' as never} />;
  }

  return <Redirect href={'/login' as never} />;
}
