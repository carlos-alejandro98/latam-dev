import React from 'react';
import { Text as HangarText } from '@hangar/mobile-components';

import type { TextProps as MobileTextProps } from './mobile-text.types';

export const MobileText: React.FC<MobileTextProps> = (props) => {
  return <HangarText {...props} />;
};
