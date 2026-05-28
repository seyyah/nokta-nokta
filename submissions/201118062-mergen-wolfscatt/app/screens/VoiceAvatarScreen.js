import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import AvatarScene from "../components/AvatarScene";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import ScreenContainer from "../components/ScreenContainer";
import SectionCard from "../components/SectionCard";
import SectionTitle from "../components/SectionTitle";
import VoiceVisualizer from "../components/VoiceVisualizer";
import { colors, spacing, typography } from "../constants/theme";

export default function VoiceAvatarScreen({ onBack }) {
  const [voiceLevel, setVoiceLevel] = useState(0.08);
  const [demoPlaybackId, setDemoPlaybackId] = useState(0);

  return (
    <ScreenContainer scroll contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <SectionTitle
          eyebrow="Phase A"
          title="Ayna: Ses + Avatar"
          description="Mikrofon seviyesi bar animasyonuna ve head/shoulder avatar mouth hareketine baglanir."
        />
        <SecondaryButton title="Ana Ekrana Don" onPress={onBack} />
      </View>

      <SectionCard style={styles.card}>
        <AvatarScene voiceLevel={voiceLevel} demoPlaybackId={demoPlaybackId} />
        <PrimaryButton
          title="Demo Lipsync"
          onPress={() => setDemoPlaybackId((value) => value + 1)}
        />
        <View style={styles.latencyBox}>
          <Text style={styles.latencyTitle}>Hedef: mic-to-mouth &lt; 200ms</Text>
          <Text style={styles.latencyText}>
            Expo MVP, 100ms recording status update ve kisa animasyon easing ile bu hedefe gore
            tasarlandi; cihaz uzerinde demo kaydinda manuel dogrulanmalidir.
          </Text>
        </View>
      </SectionCard>

      <SectionCard style={styles.card}>
        <VoiceVisualizer onLevelChange={setVoiceLevel} />
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg
  },
  header: {
    gap: spacing.md
  },
  card: {
    gap: spacing.md
  },
  latencyBox: {
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.accentSoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#C2EFDF"
  },
  latencyTitle: {
    ...typography.label,
    color: colors.text
  },
  latencyText: {
    ...typography.bodySm,
    color: colors.textMuted
  }
});
