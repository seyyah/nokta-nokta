import { Pressable, StyleSheet, Text, View } from "react-native";
import { useMicrophoneLevel } from "../audio/useMicrophoneLevel";
import { AvatarStage } from "./AvatarStage";
import { VoiceBars } from "./VoiceBars";

export function VoiceAvatarPanel() {
  const meter = useMicrophoneLevel();
  const dbLabel = meter.decibels === null ? "-- dB" : `${Math.round(meter.decibels)} dB`;

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <View>
          <Text style={styles.kicker}>Live voice audit</Text>
          <Text style={styles.heading}>Mic to avatar response</Text>
        </View>
        <Text style={[styles.badge, meter.isSpeaking && styles.badgeActive]}>{meter.statusLabel}</Text>
      </View>

      <AvatarStage amplitude={meter.amplitude} />

      <View style={styles.meterRow}>
        <View style={styles.waveBox}>
          <VoiceBars amplitude={meter.amplitude} />
        </View>
        <View style={styles.readout}>
          <Text style={styles.readoutValue}>{Math.round(meter.amplitude * 100)}%</Text>
          <Text style={styles.readoutLabel}>{dbLabel}</Text>
        </View>
      </View>

      {meter.error ? <Text style={styles.error}>{meter.error}</Text> : null}

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          onPress={meter.isListening ? meter.stop : meter.start}
          style={[styles.button, meter.isListening && styles.buttonStop]}
        >
          <Text style={[styles.buttonText, meter.isListening && styles.buttonTextStop]}>
            {meter.isListening ? "Stop meter" : "Enable microphone"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d8d0c4",
    backgroundColor: "#fffaf2",
    padding: 14,
    gap: 14
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12
  },
  kicker: {
    color: "#6d5b44",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  heading: {
    color: "#202020",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 2
  },
  badge: {
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#ece5d9",
    color: "#4f5b57",
    fontSize: 12,
    fontWeight: "800",
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  badgeActive: {
    backgroundColor: "#d7f0e7",
    color: "#145247"
  },
  meterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  waveBox: {
    flex: 1,
    minHeight: 88,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dfd7ca",
    backgroundColor: "#f7f3ea",
    padding: 10,
    justifyContent: "center"
  },
  readout: {
    width: 88,
    minHeight: 88,
    borderRadius: 8,
    backgroundColor: "#1f2a27",
    alignItems: "center",
    justifyContent: "center"
  },
  readoutValue: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900"
  },
  readoutLabel: {
    color: "#c8d6d0",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4
  },
  error: {
    color: "#b42318",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
  },
  controls: {
    gap: 8
  },
  button: {
    minHeight: 46,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2f6f66"
  },
  buttonStop: {
    backgroundColor: "#fffaf2",
    borderWidth: 1,
    borderColor: "#2f6f66"
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900"
  },
  buttonTextStop: {
    color: "#245d55"
  },
});
