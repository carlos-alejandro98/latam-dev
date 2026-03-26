/**
 * Abstracción de lista virtualizada por plataforma.
 * Resuelve a .native.tsx (FlatList) o .web.tsx (react-window) según el bundler.
 * Este archivo es fallback; Expo/Metro usa flight-list-virtualized.native.tsx o .web.tsx.
 */
export { FlightListVirtualized, type FlightListVirtualizedProps } from './flight-list-virtualized.native';
