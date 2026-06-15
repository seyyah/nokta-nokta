import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Escalation } from '../types';
import StatusBadge from './StatusBadge';
import { Colors, FontSize, Radius, Spacing, FontWeight } from '../constants/theme';

type Props = {
  escalation: Escalation;
  onPress?: () => void;
  showAction?: boolean;
  actionLabel?: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const MENTOR_TYPE_LABEL: Record<string, string> = {
  algoritma: 'Algoritma Uzmanı',
  girisim: 'Girişim Mentoru',
  yazilim: 'Yazılım Mimarı',
  database: 'Veritabanı Uzmanı',
  guvenlik: 'Güvenlik Uzmanı',
  hukuk: 'Hukuk Danışmanı',
  saglik: 'Sağlık Uzmanı',
  default: 'Genel Danışman',
};

export default function EscalationCard({
  escalation,
  onPress,
  showAction = false,
  actionLabel = 'Görüşmeye Git',
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.topicRow}>
          <Text style={styles.topicIcon}>📌</Text>
          <Text style={styles.topic} numberOfLines={2}>
            {escalation.topic}
          </Text>
        </View>
        <StatusBadge status={escalation.status} />
      </View>

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Mentor Tipi</Text>
          <Text style={styles.metaValue}>
            {MENTOR_TYPE_LABEL[escalation.mentorType] ?? MENTOR_TYPE_LABEL['default']}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Tarih</Text>
          <Text style={styles.metaValue}>{formatDate(escalation.createdAt)}</Text>
        </View>
      </View>

      {showAction && onPress && (
        <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.8}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: Spacing.sm,
    gap: 6,
  },
  topicIcon: {
    fontSize: FontSize.md,
    marginTop: 1,
  },
  topic: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  meta: {
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  metaValue: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    flexShrink: 1,
    textAlign: 'right',
    maxWidth: '60%',
  },
  actionBtn: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
  },
  actionLabel: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
});
