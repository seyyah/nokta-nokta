import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../constants/theme";

export default function ExampleIdeaCard({ title, description, exampleText, onPress }) {
  return (
    <Pressable
      onPress={() => onPress(exampleText)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Örnek fikir</Text>
        </View>

        <View style={styles.actionPill}>
          <Text style={styles.actionText}>Dokun ve kullan</Text>
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      <View style={styles.exampleBox}>
        <Text style={styles.exampleText}>{exampleText}</Text>
      </View>

      <Text style={styles.hint}>Giriş alanı bu metinle otomatik doldurulur.</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTint,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    gap: spacing.sm
  },
  cardPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.996 }]
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surface
  },
  badgeText: {
    ...typography.caption,
    color: colors.primary
  },
  actionPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primary
  },
  actionText: {
    ...typography.caption,
    color: "#FFFFFF"
  },
  title: {
    ...typography.titleSm,
    color: colors.text
  },
  description: {
    ...typography.bodySm,
    color: colors.textMuted
  },
  exampleBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: colors.border
  },
  exampleText: {
    ...typography.bodyMd,
    color: colors.text
  },
  hint: {
    ...typography.caption,
    color: colors.primary
  }
});
