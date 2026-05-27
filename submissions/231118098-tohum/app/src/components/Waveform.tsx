import React from 'react';
import { StyleSheet, View } from 'react-native';

type WaveformProps = {
  bars: number[];
  isActive: boolean;
  height?: number;
  barColor?: string;
  idleColor?: string;
};

const MIN_BAR_HEIGHT = 4;

export default function Waveform({
  bars,
  isActive,
  height = 96,
  barColor = '#3B82F6',
  idleColor = '#334155',
}: WaveformProps) {
  return (
    <View style={[styles.container, { height }]}>
      {bars.map((value, index) => {
        const barHeight = MIN_BAR_HEIGHT + value * (height - MIN_BAR_HEIGHT);
        const opacity = isActive ? 0.45 + value * 0.55 : 0.25;
        return (
          <View
            key={index}
            style={[
              styles.bar,
              {
                height: barHeight,
                backgroundColor: isActive ? barColor : idleColor,
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 8,
  },
  bar: {
    width: 5,
    borderRadius: 3,
  },
});
