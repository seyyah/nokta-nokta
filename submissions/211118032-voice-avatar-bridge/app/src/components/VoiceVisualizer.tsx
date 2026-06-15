import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Colors, Radius, Spacing } from '../constants/theme';
import { voiceMeter } from '../services/voiceMeter';

type Props = {
  /**
   * Bar adedi (varsayılan 24).
   * Performans: çok yüksek değerler 60fps'i tehdit eder; 16-32 sweet spot.
   */
  barCount?: number;
  height?: number;
  active: boolean;
};

/**
 * Tek dBFS değerinden çoklu bar oluşturmak için her bar'a hafif fazlanmış
 * sinüs + jitter uyguluyoruz. Görsel olarak FFT izlenimi verir, gerçek FFT
 * yok (expo-av sample buffer açmıyor) — fakat anlamlı: hangi bar ne kadar
 * yüksek bizim için önemli değil, "konuşuyor mu?" semantiği önemli.
 */
export default function VoiceVisualizer({
  barCount = 24,
  height = 120,
  active,
}: Props) {
  const bars = useRef(
    Array.from({ length: barCount }, () => new Animated.Value(0.06)),
  ).current;
  const tickRef = useRef(0);
  const [, force] = useState(0); // re-render trigger for idle pulse

  useEffect(() => {
    const unsub = voiceMeter.subscribe((amplitude) => {
      tickRef.current += 1;
      const t = tickRef.current;

      bars.forEach((bar, i) => {
        // Per-bar phase + jitter, anchored around current amplitude
        const phase = Math.sin((t / 6) + i * 0.45) * 0.5 + 0.5;
        const jitter = Math.random() * 0.18 - 0.09;
        const target = Math.max(0.06, amplitude * (0.55 + phase * 0.55) + jitter);

        Animated.timing(bar, {
          toValue: Math.min(1, target),
          duration: 90,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }).start();
      });
    });
    return unsub;
  }, [bars]);

  // Idle breathing animation when mic off
  useEffect(() => {
    if (active) return;
    let raf: number;
    const start = Date.now();
    const tick = () => {
      const elapsed = (Date.now() - start) / 1000;
      const pulse = 0.05 + 0.04 * (Math.sin(elapsed * 1.5) * 0.5 + 0.5);
      bars.forEach((bar, i) => {
        bar.setValue(pulse + (i % 3) * 0.01);
      });
      force((x) => (x + 1) % 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, bars]);

  return (
    <View style={[styles.row, { height }]} pointerEvents="none">
      {bars.map((bar, i) => {
        const heightPct = bar.interpolate({
          inputRange: [0, 1],
          outputRange: ['6%', '100%'],
        });
        const opacity = bar.interpolate({
          inputRange: [0, 0.2, 1],
          outputRange: [0.25, 0.55, 1],
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.bar,
              {
                height: heightPct,
                opacity,
                backgroundColor: active ? Colors.primary : Colors.textMuted,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    gap: 3,
  },
  bar: {
    flex: 1,
    minWidth: 3,
    borderRadius: Radius.sm,
  },
});
