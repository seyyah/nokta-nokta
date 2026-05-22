import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DictationState } from '../lib/useDictation';
import { palette, spacing } from '../lib/theme';

type DictationCardProps = {
  dictation: DictationState;
};

export function DictationCard({ dictation }: DictationCardProps) {
  const hasTranscript = dictation.transcript.trim().length > 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>Voice to audit note</Text>
          <Text style={styles.title}>Dikte edilen rapor taslağı</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => void (dictation.listening ? dictation.stop() : dictation.start())}
          style={({ pressed }) => [
            styles.micButton,
            dictation.listening ? styles.micButtonLive : null,
            pressed ? styles.pressed : null,
          ]}
        >
          <Text style={styles.micButtonText}>{dictation.listening ? 'Durdur' : 'Dikte'}</Text>
        </Pressable>
      </View>

      <View style={styles.transcriptBox}>
        <Text style={[styles.transcript, !hasTranscript && styles.placeholder]}>
          {hasTranscript
            ? dictation.transcript
            : 'Mikrofona basıp audit notunu konuş. Bu metin rapora markdown input olarak taşınacak.'}
        </Text>
      </View>

      {dictation.error ? <Text style={styles.error}>{dictation.error}</Text> : null}

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          disabled={!hasTranscript}
          onPress={dictation.clear}
          style={({ pressed }) => [
            styles.secondaryButton,
            !hasTranscript ? styles.disabled : null,
            pressed && hasTranscript ? styles.pressed : null,
          ]}
        >
          <Text style={styles.secondaryButtonText}>Temizle</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 14,
    padding: spacing.card,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: palette.accent,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: palette.ink,
    fontSize: 19,
    fontWeight: '900',
  },
  micButton: {
    alignItems: 'center',
    backgroundColor: palette.ink,
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
  },
  micButtonLive: {
    backgroundColor: palette.danger,
  },
  micButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
  transcriptBox: {
    backgroundColor: '#fffdf8',
    borderColor: palette.line,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 118,
    padding: 14,
  },
  transcript: {
    color: palette.ink,
    fontSize: 15,
    lineHeight: 23,
  },
  placeholder: {
    color: palette.faint,
  },
  error: {
    color: palette.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  actions: {
    alignItems: 'flex-start',
  },
  secondaryButton: {
    backgroundColor: palette.surfaceAlt,
    borderColor: palette.line,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.8,
  },
});
