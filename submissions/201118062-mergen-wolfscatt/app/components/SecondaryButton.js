import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../constants/theme";

export default function SecondaryButton({ title, onPress, disabled = false }) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.text}>{title}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong
  },
  content: {
    alignItems: "center",
    justifyContent: "center"
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
    transform: [{ scale: 0.992 }]
  },
  disabled: {
    opacity: 0.56
  },
  text: {
    ...typography.label,
    color: colors.text
  }
});
