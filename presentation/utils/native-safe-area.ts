import { Platform } from 'react-native';

/**
 * Adds a minimum native bottom cushion so content does not sit flush against
 * the home indicator / system navigation gesture area.
 */
export const getBottomSystemSpacing = (bottomInset: number): number => {
  if (Platform.OS === 'android') {
    return Math.max(bottomInset, 20);
  }

  if (Platform.OS === 'ios') {
    return Math.max(bottomInset, 12);
  }

  return 0;
};
