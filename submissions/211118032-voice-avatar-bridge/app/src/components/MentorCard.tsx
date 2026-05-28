import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MentorProfile } from '../types';
import { Colors, FontSize, Radius, Spacing, FontWeight } from '../constants/theme';

type Props = {
  mentor: MentorProfile;
  compact?: boolean;
};

export default function MentorCard({ mentor, compact }: Props) {
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{mentor.avatarInitials}</Text>
        </View>
        {mentor.isOnline && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{mentor.name}</Text>
        <Text style={styles.expertise}>{mentor.expertise}</Text>
        <View style={styles.statusRow}>
          <View style={styles.onlinePill}>
            <View style={styles.onlinePillDot} />
            <Text style={styles.onlineText}>Çevrimiçi</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardCompact: {
    padding: Spacing.sm,
    marginVertical: 0,
    elevation: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
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
    gap: Spacing.md,
  },
  left: {
    position: 'relative',
    width: 52,
    height: 52,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: Colors.green,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  expertise: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  statusRow: {
    marginTop: 4,
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: Colors.greenLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  onlinePillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.green,
  },
  onlineText: {
    fontSize: FontSize.xs,
    color: Colors.green,
    fontWeight: FontWeight.semibold,
  },
});
