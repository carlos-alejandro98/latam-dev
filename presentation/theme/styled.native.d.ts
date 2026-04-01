import 'styled-components/native';
import { appTheme } from './index.native';

type NativeTheme = typeof appTheme;

declare module 'styled-components/native' {
  export interface DefaultTheme extends NativeTheme {}
}
