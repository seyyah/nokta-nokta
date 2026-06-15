import React, { useState } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import ScreenContainer from "../components/ScreenContainer";
import SectionCard from "../components/SectionCard";
import SectionTitle from "../components/SectionTitle";
import { colors, spacing, typography } from "../constants/theme";

const JITSI_URL = "https://meet.jit.si/nokta-nokta-201118062-mergen-wolfscatt";

export default function BridgeScreen({ onBack }) {
  const [message, setMessage] = useState("");

  const openBridge = async () => {
    const canOpen = await Linking.canOpenURL(JITSI_URL);

    if (!canOpen) {
      setMessage("Jitsi linki bu cihazda acilamadi. URL'yi manuel tarayiciya kopyalayin.");
      return;
    }

    await Linking.openURL(JITSI_URL);
    setMessage("Jitsi odasi acildi. Demo kaydinda video, audio ve screen share akisini gosterin.");
  };

  return (
    <ScreenContainer scroll contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <SectionTitle
          eyebrow="Phase C"
          title="Uzmana Baglan"
          description="Video + audio + screen share icin Jitsi odasi acilir."
        />
        <SecondaryButton title="Ana Ekrana Don" onPress={onBack} />
      </View>

      <SectionCard style={styles.card}>
        <Text style={styles.url}>{JITSI_URL}</Text>
        <Text style={styles.copy}>
          Video + audio + screen share icin Jitsi odasi acilir. Demo kaydinda en az 60sn gorusme
          gosterilir.
        </Text>
        <PrimaryButton title="Uzmana Bağlan" onPress={openBridge} />
        {message ? <Text style={styles.message}>{message}</Text> : null}
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
  url: {
    ...typography.bodySm,
    color: colors.primary
  },
  copy: {
    ...typography.bodyMd,
    color: colors.textMuted
  },
  message: {
    ...typography.caption,
    color: colors.accent
  }
});
