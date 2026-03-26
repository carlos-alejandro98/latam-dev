import React from 'react';

import { HomeScreen } from '@/presentation/screens/homeScreen/home-screen';

/**
 * Controller turnaround view.
 * Web-only behavior can be controlled inside this component.
 */
export const ControllerTurnaroundView: React.FC = () => {
  return <HomeScreen />;
};
