import React from 'react';

import { TabletHomeScreen } from '@/presentation/screens/tablet/tablet-home-screen';

/**
 * Tablet turnaround view.
 * Used when the screen width matches tablet breakpoints.
 */
export const TabletTurnaroundView: React.FC = () => {
  return <TabletHomeScreen />;
};
