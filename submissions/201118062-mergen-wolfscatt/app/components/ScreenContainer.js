import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../constants/theme";

export default function ScreenContainer({
  children,
  scroll = false,
  centered = false,
  contentContainerStyle,
  style,
  keyboardOffset = 0
}) {
  const body = scroll ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        centered && styles.centeredContent,
        contentContainerStyle
      ]}
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="always"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.glowTop} />
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.staticContent, centered && styles.centeredContent, contentContainerStyle]}>
      <View style={styles.glowTop} />
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, style]} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={keyboardOffset}
      >
        {body}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  keyboard: {
    flex: 1
  },
  scroll: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.lg
  },
  staticContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl
  },
  centeredContent: {
    justifyContent: "center"
  },
  glowTop: {
    position: "absolute",
    top: -96,
    right: -24,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: colors.backgroundGlow,
    opacity: 0.9
  }
});
