import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../constants/theme";

export default function SectionTitle({ eyebrow, title, description, align = "left" }) {
  return (
    <View style={styles.wrapper}>
      {eyebrow ? (
        <Text style={[styles.eyebrow, align === "center" && styles.centerText]}>{eyebrow}</Text>
      ) : null}
      <Text style={[styles.title, align === "center" && styles.centerText]}>{title}</Text>
      {description ? (
        <Text style={[styles.description, align === "center" && styles.centerText]}>
          {description}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.primary
  },
  title: {
    ...typography.titleMd,
    color: colors.text
  },
  description: {
    ...typography.bodySm,
    color: colors.textMuted
  },
  centerText: {
    textAlign: "center"
  }
});
