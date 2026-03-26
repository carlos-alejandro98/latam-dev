import { ThemeProvider } from 'styled-components';

import { appTheme } from './index';
import type { AppThemeProviderProps } from './app-theme-provider.types';

/**
 * Web Theme Provider using Hangar Web theme.
 * Centralized to maintain consistency.
 */
export const AppThemeProvider = ({ children }: AppThemeProviderProps) => {
  return <ThemeProvider theme={appTheme}>{children}</ThemeProvider>;
};
