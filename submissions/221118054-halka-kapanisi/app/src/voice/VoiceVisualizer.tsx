// src/voice/VoiceVisualizer.tsx
// 24 çubuktan oluşan ses dalga görselleştirici.
// Mic level (0..1) bar yüksekliklerini sürer.
// OpenAI voice-mode estetiği: idle'da uçlardan ortaya doğru
// soluk solar; konuşunca dalga gibi yayılır.

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';

interface Props {
  level: number; // 0..1 from useMicAnalyzer
  active: boolean;
}

const BAR_COUNT = 24;
const BAR_WIDTH = 4;
const BAR_GAP = 4;
const MAX_HEIGHT = 80;
const MIN_HEIGHT = 6;

export function VoiceVisualizer({ level, active }: Props) {
  // Her bar için ayrı Animated.Value
  const barsRef = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(MIN_HEIGHT))
  ).current;

  useEffect(() => {
    // Bar yüksekliği: ortada en yüksek, kenarlarda alçak.
    // Her bar için farklı bir "phase" — dalga hissi.
    const animations = barsRef.map((bar, i) => {
      const center = BAR_COUNT / 2;
      const distFromCenter = Math.abs(i - center) / center; // 0..1
      const centerWeight = 1 - distFromCenter * 0.5; // 0.5..1

      const targetHeight = active
        ? MIN_HEIGHT + level * MAX_HEIGHT * centerWeight * (0.6 + Math.random() * 0.4)
        : MIN_HEIGHT + (Math.sin(Date.now() / 600 + i * 0.4) * 0.5 + 0.5) * 6; // idle breath pulse

      return Animated.timing(bar, {
        toValue: targetHeight,
        duration: 80,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      });
    });

    Animated.parallel(animations).start();
  }, [level, active, barsRef]);

  return (
    <View style={styles.container} testID="voice-visualizer">
      {barsRef.map((bar, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              height: bar,
              backgroundColor: active
                ? `hsl(${200 + level * 60}, 80%, ${50 + level * 20}%)`
                : '#334155',
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: MAX_HEIGHT + 20,
    gap: BAR_GAP,
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: 2,
  },
});
