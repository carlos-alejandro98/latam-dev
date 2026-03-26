import {
  StarOutlined,
  SearchOutlined,
  HomeOutlined,
  BellOutlined,
  ArrowForwardOutlined,
  ArrowBackOutlined,
  CallOutlined,
} from '@hangar/react-native-icons/core/interaction';
import React from 'react';

import type { IconProps } from './icon.types';

const iconMap = {
  StarOutlined,
  SearchOutlined,
  HomeOutlined,
  BellOutlined,
  ArrowForwardOutlined,
  ArrowBackOutlined,
  CallOutlined,
};

export const Icon = ({ name, size = 24, color }: IconProps) => {
  const Component = iconMap[name];
  return <Component size={size} color={color} />;
};
