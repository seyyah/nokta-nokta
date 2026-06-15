import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, shadows, spacing, typography } from "../constants/theme";

export default function PrimaryButton({ title, onPress, disabled = false, loading = false }) {
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles.primaryButton,
        pressed && !disabled && !loading && styles.primaryPressed,
        (disabled || loading) && styles.disabledButton
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={[styles.text, styles.primaryText]}>{title}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    justifyContent: "center"
  },
  content: {
    alignItems: "center",
    justifyContent: "center"
  },
  primaryButton: {
    backgroundColor: colors.primary,
    ...shadows.button
  },
  primaryPressed: {
    backgroundColor: colors.primaryPressed,
    transform: [{ scale: 0.992 }]
  },
  disabledButton: {
    opacity: 0.56
  },
  text: {
    ...typography.label
  },
  primaryText: {
    color: "#FFFFFF"
  }
});
