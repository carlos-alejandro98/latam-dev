import { Platform } from 'react-native';

import { styles as nativeStyles } from './tablet-flight-list.styles';
import { styles as webStyles } from './tablet-flight-list.styles.web';

export const styles = Platform.OS === 'web' ? webStyles : nativeStyles;
