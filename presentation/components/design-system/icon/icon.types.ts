/**
 * Unified icon contract for Web and Mobile.
 * Only expose icon names — never raw components.
 */

export type IconName =
  | 'StarOutlined'
  | 'SearchOutlined'
  | 'HomeOutlined'
  | 'BellOutlined'
  | 'UserOutlined'
  | 'ArrowForwardOutlined'
  | 'ArrowBackOutlined';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}
