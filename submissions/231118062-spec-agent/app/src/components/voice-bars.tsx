import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

const BAR_COUNT = 32;

type VoiceBarsProps = {
  level: number;
  mode?: 'bars' | 'wave';
};

export function VoiceBars({ level, mode = 'bars' }: VoiceBarsProps) {
  const bars = useMemo(
    () =>
      Array.from({ length: BAR_COUNT }, (_, index) => {
        const centerFalloff = 1 - Math.abs(index - BAR_COUNT / 2) / (BAR_COUNT / 2);
        const ripple = Math.sin(index * 0.9 + level * 7) * 0.18 + 0.82;
        return Math.max(0.08, level * centerFalloff * ripple + 0.05);
      }),
    [level]
  );

  return (
    <View style={[styles.wrap, mode === 'wave' && styles.waveWrap]}>
      {bars.map((height, index) => (
        <View
          key={index}
          style={[
            styles.bar,
            mode === 'wave' && styles.waveBar,
            {
              height: 12 + height * 124,
              opacity: 0.32 + height * 0.68,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    height: 164,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  waveWrap: {
    borderBottomColor: 'rgba(255,255,255,0.18)',
    borderBottomWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
    borderTopWidth: 1,
  },
  bar: {
    backgroundColor: '#58f0d5',
    borderRadius: 8,
    width: 6,
  },
  waveBar: {
    backgroundColor: '#f5f0a6',
    width: 5,
  },
});
