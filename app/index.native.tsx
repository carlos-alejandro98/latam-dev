import { Redirect } from 'expo-router';

/**
 * Native root route.
 * Always redirects to login.
 */
export default function NativeIndexRoute() {
  return <Redirect href={"/login" as never} />;
}
