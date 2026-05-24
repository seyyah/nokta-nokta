import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const BAR_COUNT = 20;
const BAR_WIDTH = 8;
const BAR_RADIUS = 4;
const MIN_HEIGHT = 4;
const MAX_HEIGHT = 96;
const BAR_COLOR = '#6c47ff';

const MULTIPLIERS = Array.from(
  { length: BAR_COUNT },
  () => 0.5 + Math.random()
);

interface Props {
  audioLevel: number;
  isRecording: boolean;
}

export default function VoiceBars({ audioLevel, isRecording }: Props) {
  const bars = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(MIN_HEIGHT))
  ).current;

  const opacityAnim = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: isRecording ? 1.0 : 0.25,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isRecording]);

  useEffect(() => {
    const level = Math.max(0, Math.min(1, audioLevel));
    bars.forEach((bar, i) => {
      const target = MIN_HEIGHT + (MAX_HEIGHT - MIN_HEIGHT) * level * MULTIPLIERS[i];
      Animated.spring(bar, {
        toValue: target,
        stiffness: 180,
        damping: 12,
        useNativeDriver: false,
      }).start();
    });
  }, [audioLevel]);

  return (
    <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
      {bars.map((bar, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            { height: bar },
          ]}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: MAX_HEIGHT,
    marginVertical: 12,
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: BAR_RADIUS,
    backgroundColor: BAR_COLOR,
    marginHorizontal: 2,
  },
});
