import { Pressable, StyleSheet, Text, View } from "react-native";
import { useVoiceAmplitude } from "../audioAmplitude";
import { AvatarStage } from "./AvatarStage";

export function VoiceAvatarPanel() {
  const voice = useVoiceAmplitude();
  const levelPercent = Math.round(voice.amplitude * 100);

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <View>
          <Text style={styles.label}>Ayna</Text>
          <Text style={styles.heading}>Voice avatar</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={voice.isListening ? voice.stop : voice.start}
          style={({ pressed }) => [styles.micButton, voice.isListening && styles.micButtonActive, pressed && styles.pressed]}
        >
          <Text style={[styles.micButtonText, voice.isListening && styles.micButtonTextActive]}>
            {voice.isListening ? "Stop" : "Mic"}
          </Text>
        </Pressable>
      </View>

      <AvatarStage amplitude={voice.amplitude} />

      <View style={styles.meterRow}>
        {voice.bars.map((bar, index) => (
          <View key={`${index}-${bar.toFixed(3)}`} style={styles.barSlot}>
            <View style={[styles.bar, { height: 6 + bar * 54, opacity: 0.42 + bar * 0.58 }]} />
          </View>
        ))}
      </View>

      <View style={styles.telemetryRow}>
        <Text style={styles.telemetry}>Level {levelPercent}%</Text>
        <Text style={styles.telemetry}>Latency {voice.lastLatencyMs}ms</Text>
        <Text style={styles.telemetry}>{voice.permission === "denied" ? "Mic denied" : voice.isListening ? "Live" : "Idle"}</Text>
      </View>
      {voice.error ? <Text style={styles.error}>{voice.error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D7DEE8",
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    padding: 14
  },
  panelHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  label: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 16,
    textTransform: "uppercase"
  },
  heading: {
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 26
  },
  micButton: {
    alignItems: "center",
    backgroundColor: "#0F172A",
    borderRadius: 8,
    height: 42,
    justifyContent: "center",
    minWidth: 74,
    paddingHorizontal: 14
  },
  micButtonActive: {
    backgroundColor: "#B91C1C"
  },
  micButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 18
  },
  micButtonTextActive: {
    color: "#FFFFFF"
  },
  pressed: {
    opacity: 0.72
  },
  meterRow: {
    alignItems: "flex-end",
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    height: 76,
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 8
  },
  barSlot: {
    alignItems: "center",
    flex: 1,
    height: 58,
    justifyContent: "flex-end"
  },
  bar: {
    backgroundColor: "#2563EB",
    borderRadius: 3,
    minHeight: 6,
    width: "100%"
  },
  telemetryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  telemetry: {
    backgroundColor: "#E2E8F0",
    borderRadius: 6,
    color: "#334155",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 16,
    paddingHorizontal: 8,
    paddingVertical: 5
  },
  error: {
    color: "#B91C1C",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17
  }
});
