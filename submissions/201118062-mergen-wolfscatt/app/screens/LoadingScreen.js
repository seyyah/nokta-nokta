import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import SectionCard from "../components/SectionCard";
import SectionTitle from "../components/SectionTitle";
import { colors, radius, spacing, typography } from "../constants/theme";

function SkeletonLine({ width }) {
  return <View style={[styles.skeletonLine, { width }]} />;
}

export default function LoadingScreen({ idea }) {
  return (
    <ScreenContainer centered contentContainerStyle={styles.content}>
      <SectionCard style={styles.card}>
        <View style={styles.iconWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>

        <SectionTitle
          align="center"
          eyebrow="Yapay zeka özeti hazırlanıyor"
          title="Özet hazırlanıyor"
          description={`"${idea}" fikri için cevaplar birleştiriliyor. Birkaç saniye içinde tek sayfalık sonuç ekrana gelecek.`}
        />

        <View style={styles.preview}>
          <Text style={styles.previewLabel}>Hazırlanan bölümler</Text>
          <SkeletonLine width="88%" />
          <SkeletonLine width="72%" />
          <SkeletonLine width="94%" />
          <SkeletonLine width="68%" />
        </View>
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: "center"
  },
  card: {
    alignItems: "center",
    gap: spacing.lg,
    paddingVertical: spacing.xxl
  },
  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  },
  preview: {
    width: "100%",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm
  },
  previewLabel: {
    ...typography.caption,
    color: colors.textMuted
  },
  skeletonLine: {
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft
  }
});
