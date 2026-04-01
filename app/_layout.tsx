import { Stack } from 'expo-router';
import { Provider } from 'react-redux';

import { setupAuthInterceptor } from '@/infrastructure/interceptors/auth-interceptor';
import { AppThemeProvider } from '@/presentation/theme';
import { store } from '@/store';

setupAuthInterceptor();

/**
 * Root application layout.
 * Wraps Redux and theme providers.
 */
export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppThemeProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AppThemeProvider>
    </Provider>
  );
}
