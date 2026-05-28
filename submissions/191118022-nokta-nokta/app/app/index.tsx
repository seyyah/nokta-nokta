import React from 'react';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { palette, spacing } from '../lib/theme';

const quickLinks = [
  { href: '/voice', title: 'Voice mirror', body: 'Speak into the mic and watch the RMS bars wake up.' },
  { href: '/avatar', title: 'Avatar mirror', body: 'Drive the lipsync fallback while avatar.glb is prepared.' },
  { href: '/bridge', title: 'Expert bridge', body: 'Trigger a human video bridge after repeated forge failures.' },
  { href: '/backlog', title: 'Audit backlog', body: 'Keep the week-2 audit widget flow alive.' },
] as const;

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < 420;

  return (
    <ScreenScaffold
      title="Halka kapanışı"
      subtitle="Voice visualizer, avatar lipsync, audit reports, forge repair cycles, and a human expert bridge live in one Expo + TypeScript host."
    >
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroTitle}>Phase A + B + C staging</Text>
          <Text style={styles.heroBadge}>TRACK A</Text>
        </View>
        <Text style={styles.heroBody}>
          Speak, see the waveform move, let the avatar mouth follow, capture issues
          with the audit widget, then escalate stuck forge cycles to a real person.
        </Text>
        <View style={[styles.heroActions, isCompact && styles.heroActionsCompact]}>
          <Link href="/voice" asChild>
            <Pressable style={[styles.primaryButton, isCompact && styles.actionButtonCompact]}>
              <Text style={styles.primaryButtonText}>Open voice mirror</Text>
            </Pressable>
          </Link>
          <Link href="/bridge" asChild>
            <Pressable style={[styles.secondaryButton, isCompact && styles.actionButtonCompact]}>
              <Text style={styles.secondaryButtonText}>Test expert bridge</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <View style={styles.metricRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Audit reports</Text>
          <Text style={styles.metricValue}>3 voice</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Forge cycles</Text>
          <Text style={styles.metricValue}>2+1</Text>
        </View>
      </View>

      <View style={styles.section}>
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href} asChild>
            <Pressable style={styles.linkCard}>
              <Text style={styles.linkTitle}>{link.title}</Text>
              <Text style={styles.linkBody}>{link.body}</Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: palette.surface,
    borderRadius: 28,
    padding: spacing.card,
    gap: 14,
    borderWidth: 1,
    borderColor: palette.line,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  heroTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: palette.ink,
  },
  heroBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: palette.accent,
    backgroundColor: palette.accentSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  heroBody: {
    fontSize: 15,
    lineHeight: 24,
    color: palette.muted,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 12,
  },
  heroActionsCompact: {
    flexDirection: 'column',
  },
  primaryButton: {
    minWidth: 168,
    backgroundColor: palette.accent,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  secondaryButton: {
    minWidth: 152,
    backgroundColor: palette.surfaceAlt,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: palette.line,
  },
  actionButtonCompact: {
    width: '100%',
    minWidth: 0,
  },
  secondaryButtonText: {
    color: palette.ink,
    fontWeight: '700',
    fontSize: 15,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: 22,
    padding: spacing.card,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 8,
  },
  metricLabel: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  metricValue: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: '800',
  },
  section: {
    gap: 12,
  },
  linkCard: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    padding: spacing.card,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 8,
  },
  linkTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.ink,
  },
  linkBody: {
    fontSize: 14,
    lineHeight: 22,
    color: palette.muted,
  },
});
