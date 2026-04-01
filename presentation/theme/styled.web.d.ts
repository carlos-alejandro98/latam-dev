import 'styled-components';
import { appTheme } from './index.web';

type WebTheme = typeof appTheme;

declare module 'styled-components' {
  export interface DefaultTheme extends WebTheme {}
}
