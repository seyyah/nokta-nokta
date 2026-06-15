import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DictationCard } from '../components/DictationCard';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { VoiceBars } from '../components/VoiceBars';
import { palette, spacing } from '../lib/theme';
import { useDictation } from '../lib/useDictation';
import { useVoiceMeter } from '../lib/voiceMeter';

export default function VoiceScreen() {
  const meter = useVoiceMeter();
  const dictation = useDictation();

  return (
    <ScreenScaffold
      title="Voice mirror"
      subtitle="Microphone input is sampled with expo-av metering, shaped into RMS-like bins, and paired with dictated audit text for voice-to-markdown reports."
    >
      <VoiceBars
        active={meter.active}
        bins={meter.bins}
        level={meter.level}
        meteringDb={meter.meteringDb}
      />

      {meter.error ? <Text style={styles.error}>{meter.error}</Text> : null}

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          onPress={() => void (meter.active ? meter.stop() : meter.start())}
          style={({ pressed }) => [
            styles.primaryButton,
            meter.active ? styles.stopButton : null,
            pressed ? styles.pressed : null,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {meter.active ? 'Mikrofonu durdur' : 'Mikrofonu başlat'}
          </Text>
        </Pressable>
      </View>

      <DictationCard dictation={dictation} />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Audit burn-in yönergesi</Text>
        <Text style={styles.cardBody}>
          Bu ekranda önce mikrofona konuş, sonra audit FAB ile bar alanını işaretle.
          Notu dikte ettiğin metinden oluştur; markdown rapor voice kaynaklı kabul edilecek.
        </Text>
        {meter.recordingUri ? (
          <Text style={styles.uri}>Son kayıt: {meter.recordingUri}</Text>
        ) : null}
      </View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  controls: {
    alignItems: 'stretch',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: palette.accent,
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 18,
  },
  stopButton: {
    backgroundColor: palette.danger,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.82,
  },
  error: {
    color: palette.danger,
    fontSize: 13,
    fontWeight: '800',
  },
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: 26,
    borderWidth: 1,
    gap: 8,
    padding: spacing.card,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  cardBody: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 22,
  },
  uri: {
    color: palette.faint,
    fontSize: 12,
    fontWeight: '700',
  },
});
