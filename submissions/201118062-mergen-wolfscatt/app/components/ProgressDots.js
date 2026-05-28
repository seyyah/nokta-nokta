import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../constants/theme";

export default function ProgressDots({ total, currentIndex }) {
  const progressPercent = ((currentIndex + 1) / total) * 100;

  return (
    <View style={styles.wrapper}>
      <View style={styles.topRow}>
        <Text style={styles.label}>İlerleme</Text>
        <Text style={styles.value}>
          {currentIndex + 1}/{total}
        </Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progressPercent}%` }]} />
      </View>

      <View style={styles.dotsRow}>
        {Array.from({ length: total }).map((_, index) => {
          const active = index === currentIndex;
          const completed = index < currentIndex;

          return (
            <View
              key={index}
              style={[styles.dot, completed && styles.completedDot, active && styles.activeDot]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  label: {
    ...typography.caption,
    color: colors.textSoft
  },
  value: {
    ...typography.label,
    color: colors.text
  },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.border
  },
  fill: {
    height: "100%",
    borderRadius: radius.pill,
    backgroundColor: colors.primary
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.xs
  },
  dot: {
    flex: 1,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.border
  },
  completedDot: {
    backgroundColor: colors.primarySoft
  },
  activeDot: {
    backgroundColor: colors.primary
  }
});
