import { Platform } from 'react-native';

import { styles as nativeStyles } from './tablet-flight-detail.styles';
import { styles as webStyles } from './tablet-flight-detail.styles.web';

export const styles = Platform.OS === 'web' ? webStyles : nativeStyles;
