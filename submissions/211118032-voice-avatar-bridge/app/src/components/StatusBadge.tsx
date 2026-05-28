import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EscalationStatus } from '../types';
import { Colors, FontSize, Radius, Spacing } from '../constants/theme';

type Props = {
  status: EscalationStatus;
};

const STATUS_CONFIG: Record<
  EscalationStatus,
  { label: string; bg: string; border: string; text: string }
> = {
  pending: {
    label: 'Bekliyor',
    bg: Colors.amberLight,
    border: Colors.amberBorder,
    text: Colors.amber,
  },
  accepted: {
    label: 'Kabul Edildi',
    bg: Colors.blueLight,
    border: Colors.blueBorder,
    text: Colors.blue,
  },
  resolved: {
    label: 'Tamamlandı',
    bg: Colors.greenLight,
    border: Colors.greenBorder,
    text: Colors.green,
  },
};

export default function StatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.text }]} />
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    gap: 5,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
