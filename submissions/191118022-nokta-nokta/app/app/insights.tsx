import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { palette, spacing } from '../lib/theme';

const phases = [
  { label: 'READ', body: 'Audit markdown is parsed into a concrete screen and intent.', tone: '#dbeee7' },
  { label: 'REPAIR', body: 'The agent edits only the smallest surface that explains the bug.', tone: '#ffe0cf' },
  { label: 'VERIFY', body: 'Visual checks confirm the highlighted region now matches the note.', tone: '#e8ddff' },
] as const;

export default function InsightsScreen() {
  return (
    <ScreenScaffold
      title="Cycle insights"
      subtitle="This screen turns the week-2 forge ledger into the final-week rhythm: audit input, repair attempt, ratchet result, and bridge trigger if the loop gets stuck."
    >
      <View style={styles.summary}>
        <Text style={styles.summaryValue}>20 min</Text>
        <Text style={styles.summaryLabel}>cycle time-box</Text>
      </View>

      <View style={styles.timeline}>
        {phases.map((phase) => (
          <View key={phase.label} style={styles.phaseRow}>
            <View style={[styles.phaseBadge, { backgroundColor: phase.tone }]}>
              <Text style={styles.phaseBadgeText}>{phase.label}</Text>
            </View>
            <Text style={styles.phaseBody}>{phase.body}</Text>
          </View>
        ))}
      </View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  summary: {
    backgroundColor: palette.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.card,
    gap: 8,
  },
  summaryValue: {
    fontSize: 34,
    fontWeight: '800',
    color: palette.ink,
  },
  summaryLabel: {
    fontSize: 15,
    color: palette.muted,
    fontWeight: '600',
  },
  timeline: {
    gap: 12,
  },
  phaseRow: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.card,
    gap: 10,
  },
  phaseBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  phaseBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: palette.ink,
  },
  phaseBody: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 22,
  },
});
