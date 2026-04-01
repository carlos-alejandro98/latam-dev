import React from 'react';

import { HomeScreen } from '@/presentation/screens/homeScreen/home-screen';

/**
 * Desktop turnaround view.
 * Used when the screen width matches desktop breakpoints.
 */
export const DesktopTurnaroundView: React.FC = () => {
  return <HomeScreen />;
};
