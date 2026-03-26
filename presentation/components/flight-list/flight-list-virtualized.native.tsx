import React, { useMemo } from 'react';
import { FlatList, type ListRenderItem } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { DEFAULT_FLATLIST_CONFIG } from '@/shared/constants/flatlist-config';

/** Debe coincidir con styles.separator (flight-list.styles). */
const SEPARATOR_HEIGHT = 24;

export interface FlightListVirtualizedProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T) => string;
  itemSeparator?: React.ComponentType;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  itemHeight?: number;
  /** Altura por ítem en px. En native se usa para getItemLayout (scroll y métricas correctas con ítems de altura variable). */
  getItemHeight?: (index: number, item: T) => number;
  height?: number;
}

/**
 * Implementación mobile basada en FlatList.
 * Usa virtualización nativa optimizada.
 * Con getItemHeight se construye getItemLayout para ítems de altura variable.
 */
export function FlightListVirtualized<T>({
  data,
  renderItem,
  keyExtractor,
  itemSeparator: ItemSeparatorComponent,
  contentContainerStyle,
  style,
  getItemHeight,
  // itemHeight, height: solo para .web
}: FlightListVirtualizedProps<T>) {
  const listStyle = useMemo<StyleProp<ViewStyle>>(
    () => (style ? [style, { flex: 1 }] : { flex: 1 }),
    [style],
  );

  const getItemLayout = useMemo(() => {
    if (getItemHeight == null) return undefined;
    return (_: unknown, index: number) => {
      let offset = 0;
      for (let i = 0; i < index; i++) {
        offset += getItemHeight(i, data[i]) + SEPARATOR_HEIGHT;
      }
      const length = getItemHeight(index, data[index]);
      return { length, offset, index };
    };
  }, [data, getItemHeight]);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ItemSeparatorComponent={ItemSeparatorComponent}
      contentContainerStyle={contentContainerStyle}
      style={listStyle}
      getItemLayout={getItemLayout}
      {...DEFAULT_FLATLIST_CONFIG}
    />
  );
}
