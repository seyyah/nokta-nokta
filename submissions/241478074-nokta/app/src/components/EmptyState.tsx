import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  emoji?: string;
  message: string;
  ctaLabel?: string;
  onCta?: () => void;
}

/**
 * EmptyState — Cycle 2 forge çıktısı
 * Audit raporu: audit-002-home-empty-state.md
 * Commit: [FORGE: HomeScreen] EmptyState bileşeni eklendi — 2kg
 */
export function EmptyState({ emoji = '🌱', message, ctaLabel, onCta }: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.message}>{message}</Text>
      {ctaLabel && onCta && (
        <TouchableOpacity style={styles.cta} onPress={onCta}>
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emoji: { fontSize: 48, marginBottom: 16 },
  message: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  cta: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#1a1a1a', borderRadius: 10, borderWidth: 1, borderColor: '#2a2a2a' },
  ctaText: { color: '#c8a96e', fontWeight: '700', fontSize: 14 },
});
