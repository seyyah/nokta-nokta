import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SessionSummary } from '../types';
import { Colors, FontSize, Radius, Spacing, FontWeight } from '../constants/theme';

type Props = {
  summary: SessionSummary;
  compact?: boolean;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function SummaryCard({ summary, compact = false }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>📋</Text>
        <View style={styles.headerText}>
          <Text style={styles.topic} numberOfLines={2}>
            {summary.topic}
          </Text>
          <Text style={styles.date}>{formatDate(summary.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.mentorRow}>
        <Text style={styles.mentorLabel}>Mentor: </Text>
        <Text style={styles.mentorName}>{summary.mentorName}</Text>
      </View>

      {!compact && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 Öneriler</Text>
            {summary.mentorRecommendations.map((rec, i) => (
              <View key={i} style={styles.listItem}>
                <View style={styles.bullet} />
                <Text style={styles.listText}>{rec}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚀 Sonraki Adımlar</Text>
            {summary.nextSteps.map((step, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.stepNumber}>{i + 1}.</Text>
                <Text style={styles.listText}>{step}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {compact && (
        <Text style={styles.compactHint}>
          {summary.mentorRecommendations.length} öneri · {summary.nextSteps.length} adım
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  headerIcon: {
    fontSize: FontSize.xl,
    marginTop: 1,
  },
  headerText: {
    flex: 1,
    gap: 3,
  },
  topic: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  date: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  mentorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  mentorLabel: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  mentorName: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  section: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    paddingLeft: 4,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 8,
    flexShrink: 0,
  },
  stepNumber: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
    marginTop: 1,
    flexShrink: 0,
  },
  listText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    flex: 1,
  },
  compactHint: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
});
