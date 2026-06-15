import { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { VoiceBars } from '@/src/components/voice-bars';
import { useMicrophoneLevel } from '@/src/hooks/use-microphone-level';

export default function VoiceScreen() {
  const [mode, setMode] = useState<'bars' | 'wave'>('bars');
  const { error, isListening, level, start, stop } = useMicrophoneLevel();
  const latencyLabel = useMemo(() => (isListening ? '< 200ms hedef' : 'hazir'), [isListening]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Phase A</Text>
          <Text style={styles.title}>Voice visualizer</Text>
          <Text style={styles.subtitle}>
            Mikrofon RMS metering sessizlikte soner, konusunca bar ve dalga animasyonunu canlandirir.
          </Text>
        </View>

        <View style={styles.panel}>
          <VoiceBars level={level} mode={mode} />
          <View style={styles.meterRow}>
            <Text style={styles.meterLabel}>RMS</Text>
            <Text style={styles.meterValue}>{Math.round(level * 100)}%</Text>
            <Text style={styles.meterHint}>{latencyLabel}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, isListening && styles.controlButtonStop]}
            onPress={isListening ? stop : start}>
            <Text style={styles.controlText}>{isListening ? 'Durdur' : 'Mikrofonu Ac'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setMode((current) => (current === 'bars' ? 'wave' : 'bars'))}>
            <Text style={styles.secondaryText}>{mode === 'bars' ? 'Wave' : 'Bars'}</Text>
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.auditCard}>
          <Text style={styles.auditTitle}>Dikte audit notu</Text>
          <Text style={styles.auditText}>
            Konusunca barlar aninda ziplasin, sessizlikte koyu zemine geri donsun. Bu rapor
            forge cycle 005 icin inputtur.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0d1118',
    flex: 1,
  },
  content: {
    gap: 18,
    padding: 20,
    paddingBottom: 48,
  },
  header: {
    gap: 8,
  },
  eyebrow: {
    color: '#58f0d5',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#f7fafc',
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: '#aab4c2',
    fontSize: 15,
    lineHeight: 22,
  },
  panel: {
    backgroundColor: '#141a24',
    borderColor: 'rgba(255,255,255,0.11)',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  meterRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  meterLabel: {
    color: '#7f8da3',
    fontWeight: '700',
  },
  meterValue: {
    color: '#f7fafc',
    fontSize: 20,
    fontWeight: '800',
  },
  meterHint: {
    color: '#58f0d5',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: '#58f0d5',
    borderRadius: 8,
    flex: 1,
    paddingVertical: 14,
  },
  controlButtonStop: {
    backgroundColor: '#ff776d',
  },
  controlText: {
    color: '#0d1118',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#58f0d5',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  secondaryText: {
    color: '#58f0d5',
    fontWeight: '800',
  },
  error: {
    color: '#ffb0aa',
  },
  auditCard: {
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    padding: 16,
  },
  auditTitle: {
    color: '#141a24',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  auditText: {
    color: '#344055',
    fontSize: 15,
    lineHeight: 21,
  },
});
