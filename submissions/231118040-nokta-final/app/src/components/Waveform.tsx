import { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

type Props = {
  active: boolean;
  decibels: number;
  level: number;
};

const BAR_COUNT = 19;

export function Waveform({ active, decibels, level }: Props) {
  const bars = useMemo(
    () => Array.from({ length: BAR_COUNT }, () => new Animated.Value(0.08)),
    [],
  );
  const phase = useRef(0);

  useEffect(() => {
    phase.current += 0.55;
    const energy = active ? Math.max(level, 0.04) : 0;
    bars.forEach((bar, index) => {
      const position = index / (BAR_COUNT - 1);
      const envelope = Math.sin(position * Math.PI) * 0.72 + 0.28;
      const motion = 0.63 + Math.abs(Math.sin(phase.current + index * 0.62)) * 0.37;
      const target = 0.08 + energy * envelope * motion;
      Animated.timing(bar, {
        duration: 62,
        toValue: target,
        useNativeDriver: true,
      }).start();
    });
  }, [active, bars, level]);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.label}>VOICE RMS</Text>
        <Text style={[styles.state, active && styles.stateLive]}>
          {active ? `${decibels.toFixed(1)} dB` : 'IDLE'}
        </Text>
      </View>
      <View style={styles.graph}>
        {bars.map((bar, index) => (
          <Animated.View
            key={index}
            style={[
              styles.bar,
              index % 3 === 0 && styles.barStrong,
              {
                transform: [{ scaleY: bar }],
              },
            ]}
          />
        ))}
      </View>
      <Text style={styles.caption}>50 ms sampling target / sessizlikte otomatik sonum</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  state: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  stateLive: {
    color: colors.voice,
  },
  graph: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    height: 88,
    justifyContent: 'center',
  },
  bar: {
    backgroundColor: '#82b4ff',
    borderRadius: 4,
    height: 84,
    width: 8,
  },
  barStrong: {
    backgroundColor: colors.accent,
  },
  caption: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 10,
  },
});
