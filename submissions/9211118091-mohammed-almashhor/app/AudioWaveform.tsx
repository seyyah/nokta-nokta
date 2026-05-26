import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const TOTAL_BARS = 18;
const WAVE_COLOR = '#A882FF';

const RANDOM_SCALES = Array.from({ length: TOTAL_BARS }, () => 0.4 + Math.random() * 0.8);

export default function AudioWaveform({ volume, active }: { volume: number, active: boolean }) {
  const animatedHeights = useRef(
    Array.from({ length: TOTAL_BARS }, () => new Animated.Value(5))
  ).current;

  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: active ? 1.0 : 0.3,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [active]);

  useEffect(() => {
    const clampedVol = Math.max(0, Math.min(1, volume));
    animatedHeights.forEach((animValue, idx) => {
      const targetHeight = 5 + (85 * clampedVol * RANDOM_SCALES[idx]);
      Animated.spring(animValue, {
        toValue: targetHeight,
        stiffness: 220,
        damping: 15,
        useNativeDriver: false,
      }).start();
    });
  }, [volume]);

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
      {animatedHeights.map((h, i) => (
        <Animated.View key={i} style={[styles.waveLine, { height: h }]} />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 90,
    marginVertical: 10,
  },
  waveLine: {
    width: 6,
    borderRadius: 3,
    backgroundColor: WAVE_COLOR,
    marginHorizontal: 3,
  },
});
