import type { ReactNode } from 'react';

/**
 * Cross-platform contract for AppThemeProvider.
 * This provider configures Hangar + styled-components theme.
 */
export interface AppThemeProviderProps {
  children: ReactNode;
}
