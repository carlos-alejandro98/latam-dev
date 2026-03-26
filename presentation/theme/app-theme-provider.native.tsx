import { ThemeProvider } from 'styled-components/native';

import { appTheme } from './index';
import type { AppThemeProviderProps } from './app-theme-provider.types';

/**
 * Native Theme Provider using Hangar Mobile theme.
 * Centralized to avoid theme leakage across the app.
 */
export const AppThemeProvider = ({ children }: AppThemeProviderProps) => {
  return <ThemeProvider theme={appTheme}>{children}</ThemeProvider>;
};
