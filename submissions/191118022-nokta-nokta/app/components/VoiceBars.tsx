import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { palette } from '../lib/theme';

type VoiceBarsProps = {
  active: boolean;
  bins: number[];
  level: number;
  meteringDb: number | null;
};

export function VoiceBars({ active, bins, level, meteringDb }: VoiceBarsProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Mic RMS</Text>
          <Text style={styles.value}>{Math.round(level * 100)}%</Text>
        </View>
        <Text style={[styles.badge, active ? styles.badgeHot : styles.badgeIdle]}>
          {active ? 'LIVE' : 'IDLE'}
        </Text>
      </View>

      <View style={styles.bars}>
        {bins.map((bin, index) => (
          <View key={`${index}-${bins.length}`} style={styles.track}>
            <View
              style={[
                styles.bar,
                {
                  height: `${18 + bin * 82}%`,
                  opacity: 0.28 + bin * 0.72,
                },
              ]}
            />
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {meteringDb === null ? 'metering: waiting' : `metering: ${meteringDb.toFixed(1)} dB`}
        </Text>
        <Text style={styles.footerText}>
          Silence fades, speech pushes the wave.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#08111f',
    borderRadius: 30,
    padding: 18,
    gap: 18,
    borderWidth: 1,
    borderColor: '#183047',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: '#7dd3fc',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  value: {
    color: '#f8fafc',
    fontSize: 34,
    fontWeight: '900',
  },
  badge: {
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '900',
  },
  badgeHot: {
    backgroundColor: '#14b8a6',
    color: '#042f2e',
  },
  badgeIdle: {
    backgroundColor: '#1f2937',
    color: '#cbd5e1',
  },
  bars: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 150,
    justifyContent: 'center',
    gap: 7,
  },
  track: {
    alignItems: 'center',
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    borderRadius: 999,
    height: '100%',
    justifyContent: 'center',
    width: 8,
  },
  bar: {
    backgroundColor: palette.accentWarm,
    borderRadius: 999,
    minHeight: 14,
    width: 8,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  footerText: {
    color: '#a7b5c6',
    fontSize: 12,
    fontWeight: '700',
  },
});
