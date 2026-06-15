import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import SecondaryButton from "../components/SecondaryButton";
import SectionCard from "../components/SectionCard";
import SectionTitle from "../components/SectionTitle";
import TextAreaField from "../components/TextAreaField";
import { colors, radius, spacing, typography } from "../constants/theme";

export default function QuestionsScreen({
  idea,
  questions,
  answers,
  currentIndex,
  onAnswerChange,
  onBack,
  onNext
}) {
  const [error, setError] = useState("");
  const currentQuestion = questions[currentIndex];
  const currentValue = answers[currentQuestion.id] || "";
  const isLastQuestion = currentIndex === questions.length - 1;
  const progressText = `${currentIndex + 1}/${questions.length}`;

  const helperText = useMemo(() => {
    if (currentQuestion.id === "problem") {
      return "Kullanıcının bugün yaşadığı net sorunu tarif etmeye çalış.";
    }

    if (currentQuestion.id === "user") {
      return "Tek bir ana kullanıcı grubuna odaklanmak sonucu daha güçlü yapar.";
    }

    if (currentQuestion.id === "scope") {
      return "Tüm ürünü değil, ilk sürümde vazgeçilmez olan parçayı yaz.";
    }

    return "Seni en çok zorlayacak şeyi yazman yeterli.";
  }, [currentQuestion.id]);

  const handleAnswerChange = (value) => {
    onAnswerChange(currentQuestion.id, value);

    if (error) {
      setError("");
    }
  };

  const handleNext = () => {
    if (!currentValue.trim()) {
      setError("Devam etmek için bu soruya bir cevap yaz.");
      return;
    }

    setError("");
    onNext();
  };

  return (
    <ScreenContainer scroll contentContainerStyle={styles.content} keyboardOffset={24}>
      <View style={styles.header}>
        <View style={styles.heroNote}>
          <Text style={styles.heroNoteText}>Ürün görüşmesi akışı</Text>
        </View>

        <SectionTitle
          eyebrow={`Takip soruları • ${progressText}`}
          title="Fikri netleştir"
          description="Her adım tek bir karar noktasına odaklanır. Kısa cevaplar yeterli."
        />
      </View>

      <SectionCard tone="muted" style={styles.ideaCard}>
        <Text style={styles.ideaLabel}>Üzerinde çalıştığın fikir</Text>
        <Text style={styles.ideaText}>{idea}</Text>
      </SectionCard>

      <SectionCard style={styles.questionCard}>
        <View style={styles.questionHeader}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>Soru {progressText}</Text>
          </View>

          <Text style={styles.questionTitle}>{currentQuestion.title}</Text>
          <Text style={styles.questionText}>{helperText}</Text>
        </View>

        <TextAreaField
          label="Yanıtın"
          value={currentValue}
          onChangeText={handleAnswerChange}
          placeholder={currentQuestion.placeholder}
          error={error}
          hint="Kısa, net ve ürün odaklı yazman yeterli."
          minHeight={172}
        />

        <View style={styles.validationBox}>
          <View style={styles.validationIcon} />
          <Text style={styles.validationText}>
            Bu cevap bir sonraki ekranda ürün özetine doğrudan yansıtılır.
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <View style={styles.buttonItem}>
            <SecondaryButton title={currentIndex === 0 ? "Fikre Dön" : "Geri"} onPress={onBack} />
          </View>

          <View style={styles.buttonItem}>
            <PrimaryButton
              title={isLastQuestion ? "Özeti Oluştur" : "Devam Et"}
              onPress={handleNext}
            />
          </View>
        </View>
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxxl
  },
  header: {
    gap: spacing.md
  },
  heroNote: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft
  },
  heroNoteText: {
    ...typography.caption,
    color: colors.primary
  },
  ideaCard: {
    gap: spacing.xs
  },
  ideaLabel: {
    ...typography.caption,
    color: colors.textSoft
  },
  ideaText: {
    ...typography.bodyLg,
    color: colors.text
  },
  questionCard: {
    gap: spacing.xl
  },
  questionHeader: {
    gap: spacing.sm
  },
  stepBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceTint
  },
  stepBadgeText: {
    ...typography.caption,
    color: colors.primary
  },
  questionTitle: {
    ...typography.titleLg,
    color: colors.text
  },
  questionText: {
    ...typography.bodySm,
    color: colors.textMuted
  },
  validationBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border
  },
  validationIcon: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.accent
  },
  validationText: {
    flex: 1,
    ...typography.bodySm,
    color: colors.textMuted
  },
  buttonRow: {
    marginTop: spacing.xs,
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center"
  },
  buttonItem: {
    flex: 1
  }
});
