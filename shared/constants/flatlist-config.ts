import { IS_WEB } from '@/config/platform';

export const DEFAULT_FLATLIST_CONFIG = {
  removeClippedSubviews: !IS_WEB,
  initialNumToRender: 12,
  maxToRenderPerBatch: 8,
  windowSize: 5,
};
