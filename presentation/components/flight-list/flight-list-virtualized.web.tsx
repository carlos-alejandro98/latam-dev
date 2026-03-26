import React from 'react';
import { List } from 'react-window';

import './flight-list-virtualized.web.css';

export interface FlightListVirtualizedProps<T> {
  data: T[];
  renderItem: (params: { item: T; index: number }) => React.ReactNode;
  keyExtractor: (item: T) => string;
  itemSeparator?: React.ComponentType;
  contentContainerStyle?: unknown;
  style?: unknown;
  /** Altura por ítem en px. Si no se pasa, se usa getItemHeight. */
  itemHeight?: number;
  /** Función que devuelve la altura en px para cada ítem. Usado cuando los ítems tienen alturas distintas. */
  getItemHeight?: (index: number, item: T) => number;
  height?: number;
}

interface RowProps<T> {
  data: T[];
  renderItem: (params: { item: T; index: number }) => React.ReactNode;
}

function RowComponent<T>({
  index,
  style,
  data,
  renderItem,
  ariaAttributes,
}: RowProps<T> & {
  index: number;
  style: React.CSSProperties;
  ariaAttributes: {
    'aria-posinset': number;
    'aria-setsize': number;
    role: 'listitem';
  };
}) {
  return (
    <div style={style} {...ariaAttributes}>
      {renderItem({ item: data[index], index })}
    </div>
  );
}

/**
 * Implementación web basada en react-window (List).
 * Soporta alturas variables por ítem vía getItemHeight.
 * Si no se pasa getItemHeight se usa itemHeight fijo (retrocompatible).
 */
export function FlightListVirtualized<T>({
  data,
  renderItem,
  itemHeight = 100,
  getItemHeight,
  height = 600,
  // contentContainerStyle, style, itemSeparator: ignored on web
}: FlightListVirtualizedProps<T>) {
  const rowProps: RowProps<T> = { data, renderItem };

  const rowHeight =
    getItemHeight != null
      ? (index: number, props: RowProps<T>) =>
          getItemHeight(index, props.data[index])
      : itemHeight;

  return (
    <List<RowProps<T>>
      className="flight-list-virtualized-scroll"
      rowCount={data.length}
      rowHeight={rowHeight}
      rowComponent={RowComponent}
      rowProps={rowProps}
      style={{ height, width: '100%' }}
    />
  );
}
