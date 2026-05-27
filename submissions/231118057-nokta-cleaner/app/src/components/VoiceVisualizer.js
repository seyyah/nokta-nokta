// Bars + mirror waveform that breathes with analyzer frames.
// Silence → bars collapse to a flat line. Speech → bars rise organically.

import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { BAND_COUNT } from '../lib/audioAnalyzer';

const BAR_GAP = 5;
const BAR_RADIUS = 99;
const MIN_HEIGHT = 4;
const MAX_HEIGHT = 110;
const TIMING = { duration: 70, easing: Easing.out(Easing.cubic) };

function Bar({ amp, color, width, top }) {
  const style = useAnimatedStyle(() => {
    const h = MIN_HEIGHT + amp.value * (MAX_HEIGHT - MIN_HEIGHT);
    return {
      height: h,
      opacity: 0.25 + 0.75 * amp.value,
    };
  });
  return (
    <Animated.View
      style={[
        {
          width,
          backgroundColor: color,
          borderRadius: BAR_RADIUS,
          alignSelf: top ? 'flex-end' : 'flex-start',
        },
        style,
      ]}
    />
  );
}

// Top-level fixed-length array of shared values — hooks order stable across renders.
function useBarAmps() {
  return Array.from({ length: BAND_COUNT }, () => useSharedValue(0)); // eslint-disable-line react-hooks/rules-of-hooks
}

export default function VoiceVisualizer({ analyzer, isActive, theme, width = 320 }) {
  const amps = useBarAmps();

  useEffect(() => {
    if (!analyzer) return;
    const unsub = analyzer.subscribe((frame) => {
      for (let i = 0; i < BAND_COUNT; i++) {
        amps[i].value = withTiming(frame.bands[i] ?? 0, TIMING);
      }
    });
    return () => {
      unsub();
      amps.forEach((v) => (v.value = withTiming(0, { duration: 220 })));
    };
  }, [analyzer]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isActive) {
      amps.forEach((v) => (v.value = withTiming(0, { duration: 260 })));
    }
  }, [isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  const barWidth = Math.max(3, (width - BAR_GAP * (BAND_COUNT - 1)) / BAND_COUNT);
  const color = theme?.text ?? '#000';

  return (
    <View style={{ width, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          flexDirection: 'row',
          gap: BAR_GAP,
          alignItems: 'flex-end',
          height: MAX_HEIGHT,
          width,
        }}
      >
        {amps.map((amp, i) => (
          <Bar key={`u-${i}`} amp={amp} color={color} width={barWidth} top />
        ))}
      </View>
      <View style={{ height: 1, width, backgroundColor: color, opacity: 0.15, marginVertical: 2 }} />
      <View
        style={{
          flexDirection: 'row',
          gap: BAR_GAP,
          alignItems: 'flex-start',
          height: MAX_HEIGHT,
          width,
        }}
      >
        {amps.map((amp, i) => (
          <Bar key={`l-${i}`} amp={amp} color={color} width={barWidth} top={false} />
        ))}
      </View>
    </View>
  );
}
