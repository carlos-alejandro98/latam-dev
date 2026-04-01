import React from 'react';

import { MobileHomeScreen } from '@/presentation/screens/mobile/mobile-home-screen';

/**
 * Mobile turnaround view.
 * Used by the embarque role and as the default experience on mobile widths.
 */
export const MobileTurnaroundView: React.FC = () => {
  return <MobileHomeScreen />;
};
