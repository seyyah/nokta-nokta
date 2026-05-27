import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AvatarStage from '../components/AvatarStage';
import Waveform from '../components/Waveform';
import { useVoiceMeter } from '../hooks/useVoiceMeter';

const AVATAR_GLB: number | null = require('../../assets/avatar.glb');

export default function MirrorScreen() {
  const { amplitude, bars, isRecording, latencyMs, permissionGranted, start, stop } = useVoiceMeter();

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        stop();
      };
    }, [stop]),
  );

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const onToggle = async () => {
    if (isRecording) {
      await stop();
    } else {
      await start();
    }
  };

  const latencyColor = latencyMs > 0 && latencyMs < 200 ? '#22c55e' : latencyMs >= 200 ? '#ef4444' : '#64748b';

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Ayna</Text>
        <Text style={styles.subtitle}>Konuş, avatar konuşsun</Text>
      </View>

      <AvatarStage glbModule={AVATAR_GLB} mouthOpenness={amplitude} height={340} />

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Genlik</Text>
          <Text style={styles.metricValue}>{(amplitude * 100).toFixed(0)}%</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Latency</Text>
          <Text style={[styles.metricValue, { color: latencyColor }]}>
            {latencyMs > 0 ? `${latencyMs}ms` : '—'}
          </Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Hedef</Text>
          <Text style={styles.metricValue}>&lt;200ms</Text>
        </View>
      </View>

      <Waveform bars={bars} isActive={isRecording} height={96} />

      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [
          styles.micButton,
          isRecording && styles.micButtonActive,
          pressed && styles.micButtonPressed,
        ]}
      >
        <Text style={styles.micButtonText}>
          {isRecording ? '⏹  Durdur' : '🎙  Konuşmaya Başla'}
        </Text>
      </Pressable>

      {!permissionGranted && isRecording === false && (
        <Text style={styles.hint}>
          İlk kullanımda mikrofon izni isteyecek.
        </Text>
      )}

      {AVATAR_GLB == null ? (
        <Text style={styles.placeholderHint}>
          Placeholder avatar (sphere) gösteriliyor — avaturn.me .glb dosyası
          assets/avatar.glb'ye düşünce gerçek avatar binecek.
        </Text>
      ) : (
        <Text style={styles.placeholderHint}>
          Avatar: avaturn.me export · assets/avatar.glb
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  micButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  micButtonActive: {
    backgroundColor: '#ef4444',
  },
  micButtonPressed: {
    opacity: 0.8,
  },
  micButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  placeholderHint: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
