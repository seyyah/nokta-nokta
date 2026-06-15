import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, radius, shadows, spacing } from "../constants/theme";

export default function Surface({ children, style, tone = "default", padded = true }) {
  return (
    <View
      style={[
        styles.base,
        tone === "muted" && styles.muted,
        tone === "tint" && styles.tint,
        padded && styles.padded,
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card
  },
  padded: {
    padding: spacing.lg
  },
  muted: {
    backgroundColor: colors.surfaceMuted
  },
  tint: {
    backgroundColor: colors.surfaceTint,
    borderColor: colors.primarySoft
  }
});
