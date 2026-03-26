/**
 * Pure React Native icon implementations for the app header.
 * No external icon library dependencies — drawn with View primitives.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
}

/**
 * Hamburger / menu icon — three horizontal bars.
 */
export const HamburgerIcon: React.FC<IconProps> = ({ size = 22, color = '#fff' }) => {
  const barHeight = Math.round(size * 0.09);
  const barRadius = barHeight / 2;
  const gap = Math.round(size * 0.22);

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', gap }}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            width: '100%',
            height: barHeight,
            borderRadius: barRadius,
            backgroundColor: color,
          }}
        />
      ))}
    </View>
  );
};

/**
 * Help / question-mark icon — circle with "?" drawn as two Views.
 */
export const HelpIcon: React.FC<IconProps> = ({ size = 16, color = '#fff' }) => {
  const stroke = Math.max(1.5, size * 0.1);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: stroke,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Question mark stem */}
      <View
        style={{
          width: stroke,
          height: size * 0.28,
          backgroundColor: color,
          borderRadius: stroke / 2,
          marginTop: size * 0.04,
        }}
      />
      {/* Question mark dot */}
      <View
        style={{
          width: stroke,
          height: stroke,
          backgroundColor: color,
          borderRadius: stroke / 2,
          marginTop: size * 0.05,
        }}
      />
    </View>
  );
};

/**
 * Bell / notification icon — drawn as a rounded rectangle with a base arc.
 */
export const BellIcon: React.FC<IconProps> = ({ size = 20, color = '#fff' }) => {
  const bodyW = size * 0.55;
  const bodyH = size * 0.55;
  const stroke = Math.max(1.5, size * 0.08);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Bell body */}
      <View
        style={{
          width: bodyW,
          height: bodyH,
          borderRadius: bodyW * 0.3,
          borderWidth: stroke,
          borderColor: color,
          marginTop: size * 0.05,
        }}
      />
      {/* Bell clapper (dot at the bottom) */}
      <View
        style={{
          width: stroke * 2.5,
          height: stroke * 2.5,
          borderRadius: stroke * 1.25,
          backgroundColor: color,
          marginTop: -stroke,
        }}
      />
      {/* Bell handle (small bar at top center) */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            top: 0,
            alignItems: 'center',
          },
        ]}
      >
        <View
          style={{
            width: stroke * 2,
            height: stroke * 2.5,
            backgroundColor: color,
            borderRadius: stroke,
          }}
        />
      </View>
    </View>
  );
};
