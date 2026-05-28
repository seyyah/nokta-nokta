import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius, spacing, typography } from "../constants/theme";

export default function TextAreaField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  hint,
  minHeight = 120
}) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = Boolean(value && value.trim().length > 0);

  return (
    <View style={styles.wrapper}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.meta}>{hasValue ? "Yanıt eklendi" : "Boş"}</Text>
        </View>
      ) : null}

      <TextInput
        multiline
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSoft}
        style={[
          styles.input,
          { minHeight },
          isFocused && styles.inputFocused,
          error ? styles.inputError : null
        ]}
        textAlignVertical="top"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {error ? (
        <View style={styles.feedbackError}>
          <View style={styles.feedbackDotError} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : hint ? (
        <View style={styles.feedbackHint}>
          <View style={styles.feedbackDotHint} />
          <Text style={styles.hintText}>{hint}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  label: {
    ...typography.label,
    color: colors.text
  },
  meta: {
    ...typography.caption,
    color: colors.textSoft
  },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.bodyMd,
    color: colors.text
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 1
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft
  },
  feedbackError: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs
  },
  feedbackHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs
  },
  feedbackDotError: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.danger
  },
  feedbackDotHint: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.accent
  },
  errorText: {
    flex: 1,
    ...typography.caption,
    color: colors.danger
  },
  hintText: {
    flex: 1,
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "600"
  }
});
