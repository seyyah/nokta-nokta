import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { palette, spacing } from '../lib/theme';

type ScreenScaffoldProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function ScreenScaffold({ title, subtitle, children }: ScreenScaffoldProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>NOKTA-NOKTA FINAL</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.canvas,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.page,
    paddingBottom: 110,
    gap: spacing.section,
  },
  hero: {
    gap: 8,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: palette.accent,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: palette.ink,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: palette.muted,
  },
});
