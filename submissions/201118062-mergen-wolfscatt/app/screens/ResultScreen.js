import React from "react";
import { Alert, Share, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import SecondaryButton from "../components/SecondaryButton";
import SectionCard from "../components/SectionCard";
import SectionTitle from "../components/SectionTitle";
import { colors, radius, spacing, typography } from "../constants/theme";

function BulletList({ items }) {
  return (
    <View style={styles.list}>
      {items.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.listItem}>
          <View style={styles.bullet} />
          <Text selectable style={styles.listText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function SpecBlock({ index, title, children, tone = "default" }) {
  return (
    <SectionCard tone={tone} style={styles.specBlock}>
      <View style={styles.specHeader}>
        <View style={styles.specIndex}>
          <Text style={styles.specIndexText}>{index}</Text>
        </View>
        <Text style={styles.specTitle}>{title}</Text>
      </View>
      <View>{children}</View>
    </SectionCard>
  );
}

export default function ResultScreen({ spec, onRestart, onBackToQuestions }) {
  const handleShareSummary = async () => {
    if (!spec) {
      return;
    }

    const summaryLines = [
      "Nokta Capture - Urun Ozeti",
      "",
      `Fikir Ozeti: ${spec.ideaSummary}`,
      `Problem: ${spec.problem}`,
      `Hedef Kullanici: ${spec.targetUser}`,
      "MVP Kapsami:",
      ...spec.mvpItems.map((item) => `- ${item}`),
      `Kisit / Risk: ${spec.constraints}`,
      `Onerilen Ilk Adim: ${spec.firstStep}`
    ];

    try {
      await Share.share({
        title: "Nokta Capture Ozeti",
        message: summaryLines.join("\n")
      });
    } catch (error) {
      Alert.alert("Paylaşım başarısız", "Özet şu anda paylaşılamadı. Lütfen tekrar dene.");
      console.warn("[ResultScreen] share failed:", error);
    }
  };

  if (!spec) {
    return (
      <ScreenContainer centered contentContainerStyle={styles.emptyContainer}>
        <SectionCard style={styles.emptyCard}>
          <SectionTitle
            align="center"
            title="Henüz sonuç oluşmadı"
            description="Önce fikir girişini ve soru akışının tamamını bitirdiğinde burada bir ürün özeti göreceksin."
          />
          <PrimaryButton title="Başa Dön" onPress={onRestart} />
        </SectionCard>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>Hazır çıktı</Text>
          </View>
          <Text style={styles.heroMeta}>Nokta Capture sonucu</Text>
        </View>

        <SectionTitle
          title="Tek sayfalık ürün özeti"
          description="Fikir ve cevaplarından üretilen bu özet, MVP kapsamını daha net görmen için yapılandırıldı."
        />
      </View>

      <SectionCard tone="tint" style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Üst özet</Text>
        <Text selectable style={styles.summaryText}>{spec.ideaSummary}</Text>
      </SectionCard>

      <View style={styles.sectionStack}>
        <SpecBlock index="01" title="Fikir özeti">
          <Text selectable style={styles.bodyText}>{spec.ideaSummary}</Text>
        </SpecBlock>

        <SpecBlock index="02" title="Problem">
          <Text selectable style={styles.bodyText}>{spec.problem}</Text>
        </SpecBlock>

        <SpecBlock index="03" title="Hedef kullanıcı">
          <Text selectable style={styles.bodyText}>{spec.targetUser}</Text>
        </SpecBlock>

        <SpecBlock index="04" title="MVP kapsamı" tone="muted">
          <BulletList items={spec.mvpItems} />
        </SpecBlock>

        <SpecBlock index="05" title="Kısıt / risk">
          <Text selectable style={styles.bodyText}>{spec.constraints}</Text>
        </SpecBlock>

        <SpecBlock index="06" title="Önerilen ilk adım" tone="tint">
          <Text selectable style={styles.bodyTextStrong}>{spec.firstStep}</Text>
        </SpecBlock>
      </View>

      <SectionCard tone="muted" style={styles.actionsCard}>
        <Text style={styles.actionsTitle}>Sonraki adım</Text>
        <Text style={styles.actionsText}>
          İstersen özeti paylaşabilir, metinleri seçip kopyalayabilir, cevaplarını düzenleyip özeti yeniden üretebilir veya akışı baştan başlatabilirsin.
        </Text>

        <View style={styles.buttonGroup}>
          <SecondaryButton title="Özeti Paylaş" onPress={handleShareSummary} />
          <PrimaryButton title="Yeniden Başlat" onPress={onRestart} />
          <SecondaryButton title="Cevapları Düzenle" onPress={onBackToQuestions} />
        </View>
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    paddingBottom: spacing.xxxl
  },
  hero: {
    gap: spacing.md
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  heroBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft
  },
  heroBadgeText: {
    ...typography.caption,
    color: colors.primary
  },
  heroMeta: {
    ...typography.caption,
    color: colors.textSoft
  },
  summaryCard: {
    gap: spacing.sm
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.primary
  },
  summaryText: {
    ...typography.bodyLg,
    color: colors.text
  },
  sectionStack: {
    gap: spacing.md
  },
  specBlock: {
    gap: spacing.md
  },
  specHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  specIndex: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceStrong
  },
  specIndexText: {
    ...typography.caption,
    color: colors.primary
  },
  specTitle: {
    ...typography.titleSm,
    color: colors.text
  },
  bodyText: {
    ...typography.bodyMd,
    color: colors.textMuted
  },
  bodyTextStrong: {
    ...typography.bodyMd,
    color: colors.text
  },
  list: {
    gap: spacing.sm
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm
  },
  bullet: {
    width: 9,
    height: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    marginTop: 7
  },
  listText: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.textMuted
  },
  actionsCard: {
    gap: spacing.md
  },
  actionsTitle: {
    ...typography.titleSm,
    color: colors.text
  },
  actionsText: {
    ...typography.bodySm,
    color: colors.textMuted
  },
  buttonGroup: {
    gap: spacing.sm,
    marginTop: spacing.xs
  },
  emptyContainer: {
    justifyContent: "center"
  },
  emptyCard: {
    gap: spacing.lg
  }
});
