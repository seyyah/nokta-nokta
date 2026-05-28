import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ExampleIdeaCard from "../components/ExampleIdeaCard";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import SectionCard from "../components/SectionCard";
import SectionTitle from "../components/SectionTitle";
import SecondaryButton from "../components/SecondaryButton";
import TextAreaField from "../components/TextAreaField";
import { colors, radius, spacing, typography } from "../constants/theme";

const EXAMPLE_IDEA =
  "Kampüste öğrencilerin boş sınıf bulmasını kolaylaştıran ve uygun saatleri gösteren mobil uygulama";

const HIGHLIGHTS = ["4 kısa soru", "Tek sayfalık özet", "Odaklı MVP çıktısı"];

export default function HomeScreen({ initialIdea, onStart, onOpenVoiceAvatar, onOpenBridge }) {
  const [idea, setIdea] = useState(initialIdea || "");
  const [error, setError] = useState("");
  const hasIdea = idea.trim().length > 0;

  const handleIdeaChange = (value) => {
    setIdea(value);

    if (error) {
      setError("");
    }
  };

  const handleUseExample = (value) => {
    setIdea(value);
    setError("");
  };

  const handleClearIdea = () => {
    setIdea("");
    setError("");
  };

  const handleContinue = () => {
    const trimmed = idea.trim();

    if (!trimmed) {
      setError("Devam etmek için önce ham fikrini yaz.");
      return;
    }

    if (trimmed.length < 10) {
      setError("Fikri biraz daha aç. Bir iki kelimeden fazlası yeterli.");
      return;
    }

    setError("");
    onStart(trimmed);
  };

  return (
    <ScreenContainer scroll contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroTopRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Track A teslimi</Text>
          </View>

          <Text style={styles.helperLabel}>Nokta Capture</Text>
        </View>

        <SectionTitle
          title="Ham fikrini birkaç dakikada daha net bir ürüne dönüştür."
          description="Aklındaki uygulama veya girişim fikrini kısa bir metin olarak yaz. Sonraki adımda uygulama sana 4 netleştirici soru soracak ve sonunda paylaşılabilir bir ürün özeti hazırlayacak."
        />

        <View style={styles.highlightRow}>
          {HIGHLIGHTS.map((item) => (
            <View key={item} style={styles.highlightChip}>
              <View style={styles.highlightDot} />
              <Text style={styles.highlightText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.trackActionRow}>
          <SecondaryButton title="Ayna: Ses + Avatar" onPress={onOpenVoiceAvatar} />
          <SecondaryButton title="Uzmana Bağlan" onPress={onOpenBridge} />
        </View>
      </View>

      <SectionCard style={styles.mainCard}>
        <View style={styles.inputHeader}>
          <SectionTitle
            eyebrow="Başlangıç"
            title="Fikrini yaz"
            description="Mükemmel olmak zorunda değil. Kısa, ham ve dağınık bir giriş bile yeterli."
          />

          <View style={styles.emptyStateBox}>
            <Text style={styles.emptyStateTitle}>Ne yazabilirim?</Text>
            <Text style={styles.emptyStateText}>
              Sorun, kullanıcı veya çözüm fikrinden biriyle başlaman yeterli. Geri kalan netleştirme
              bir sonraki adımda yapılacak.
            </Text>
          </View>
        </View>

        <TextAreaField
          label="Ham fikir"
          value={idea}
          onChangeText={handleIdeaChange}
          placeholder="Örnek: öğrenciler için ortak ders çalışma planlama uygulaması"
          error={error}
          hint="Ne kadar net yazarsan, çıktı o kadar kullanışlı olur."
          minHeight={160}
        />

        {hasIdea ? (
          <View style={styles.quickActionRow}>
            <Pressable onPress={handleClearIdea} style={({ pressed }) => [styles.clearAction, pressed && styles.clearActionPressed]}>
              <Text style={styles.clearActionText}>Fikri Temizle</Text>
            </Pressable>
          </View>
        ) : null}

        <ExampleIdeaCard
          title="Hızlı başlamak istersen"
          description="Örnek bir fikir seçip akışı birkaç saniyede deneyebilirsin."
          exampleText={EXAMPLE_IDEA}
          onPress={handleUseExample}
        />

        <View style={styles.ctaBlock}>
          <View style={styles.ctaCopy}>
            <Text style={styles.ctaTitle}>Bir sonraki adımda ne olacak?</Text>
            <Text style={styles.ctaText}>
              Problem, hedef kullanıcı, ilk sürüm kapsamı ve risk üzerine 4 kısa soru göreceksin.
            </Text>
          </View>

          <PrimaryButton title="Devam Et" onPress={handleContinue} />
        </View>
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl
  },
  hero: {
    gap: spacing.lg,
    paddingTop: spacing.xs
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft
  },
  badgeText: {
    ...typography.caption,
    color: colors.primary
  },
  helperLabel: {
    ...typography.caption,
    color: colors.textSoft
  },
  highlightRow: {
    gap: spacing.sm
  },
  highlightChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  highlightDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.accent
  },
  highlightText: {
    ...typography.caption,
    color: colors.text
  },
  trackActionRow: {
    gap: spacing.sm
  },
  mainCard: {
    gap: spacing.lg
  },
  inputHeader: {
    gap: spacing.md
  },
  emptyStateBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border
  },
  emptyStateTitle: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.xs
  },
  emptyStateText: {
    ...typography.bodySm,
    color: colors.textMuted
  },
  ctaBlock: {
    gap: spacing.md,
    marginTop: spacing.xs
  },
  quickActionRow: {
    alignItems: "flex-end",
    marginTop: -spacing.xs
  },
  clearAction: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.dangerSoft
  },
  clearActionPressed: {
    opacity: 0.72
  },
  clearActionText: {
    ...typography.caption,
    color: colors.danger
  },
  ctaCopy: {
    gap: spacing.xs
  },
  ctaTitle: {
    ...typography.label,
    color: colors.text
  },
  ctaText: {
    ...typography.bodySm,
    color: colors.textMuted
  },
  footerNote: {
    gap: spacing.xs
  },
  noteTitle: {
    ...typography.titleSm,
    color: colors.text
  },
  noteText: {
    ...typography.bodySm,
    color: colors.textMuted
  }
});
