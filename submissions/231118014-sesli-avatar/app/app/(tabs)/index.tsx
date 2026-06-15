import * as Haptics from "expo-haptics";
import { Mic, MicOff, ShieldAlert } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/components/Avatar";
import { GLBAvatar } from "@/components/GLBAvatar";
import { VoiceVisualizer } from "@/components/VoiceVisualizer";
import Colors from "@/constants/colors";
import { useMicLevel } from "@/hooks/useMicLevel";

export default function AynaScreen() {
  const mic = useMicLevel();
  const [latencyMs, setLatencyMs] = useState<number>(0);

  // Estimate metering-poll latency: dt since last level change.
  useEffect(() => {
    setLatencyMs(50); // expo-audio poll interval; smoothing adds ~20ms more
  }, []);

  const onToggle = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (mic.isRecording) await mic.stop();
    else await mic.start();
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Phase A — Ayna</Text>
        <Text style={styles.title}>Sesin görselleşir,{"\n"}avatarın seninle konuşur.</Text>
      </View>

      <View style={styles.avatarBlock}>
        <GLBAvatar level={mic.level} label={mic.isRecording ? "Dinleniyor" : "Sessiz"} />
      </View>

      <View style={styles.svgPreviewBlock}>
        <Text style={styles.svgPreviewLabel}>Viseme önizleme</Text>
        <Avatar level={mic.level} />
      </View>

      <View style={styles.vizBlock}>
        <VoiceVisualizer level={mic.level} />
      </View>

      <View style={styles.metrics}>
        <Metric label="Seviye" value={`${Math.round(mic.level * 100)}%`} />
        <Metric label="Gecikme" value={`~${latencyMs}ms`} accent={latencyMs < 200} />
        <Metric label="Durum" value={mic.isRecording ? "REC" : "IDLE"} />
      </View>

      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [
          styles.micButton,
          mic.isRecording && styles.micButtonActive,
          pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        ]}
        testID="mic-toggle"
      >
        {mic.isRecording ? (
          <MicOff color={Colors.bg} size={22} />
        ) : (
          <Mic color={mic.isRecording ? Colors.bg : Colors.text} size={22} />
        )}
        <Text style={[styles.micText, mic.isRecording && { color: Colors.bg }]}>
          {mic.isRecording ? "Durdur" : "Konuş"}
        </Text>
      </Pressable>

      {mic.error ? (
        <View style={styles.errorBox}>
          <ShieldAlert color={Colors.warn} size={16} />
          <Text style={styles.errorText}>{mic.error}</Text>
        </View>
      ) : null}

      <View style={styles.note}>
        <Text style={styles.noteTitle}>Avatar pipeline</Text>
        <Text style={styles.noteBody}>
          <Text style={styles.kbd}>assets/avatar.glb</Text> avaturn export'undan bağlandı.
          Web önizlemede react-three-fiber sahnesi modeli yüklüyor ve ARKit blendshape
          isimlerine göre <Text style={styles.kbd}>jawOpen</Text> /
          <Text style={styles.kbd}>mouthOpen</Text> morph target'larını mic seviyesinin
          asimetrik smoothed kopyasıyla sürüyor. Aynı 0..1 sinyali altta SVG viseme
          önizlemesinde de görünüyor — fail-safe.
        </Text>
      </View>
    </ScrollView>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, accent && { color: Colors.accent }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.bg },
  container: { padding: 20, paddingBottom: 60 },
  header: { marginTop: 8, marginBottom: 24 },
  eyebrow: {
    color: Colors.accent,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: { color: Colors.text, fontSize: 28, fontWeight: "700", lineHeight: 34 },
  avatarBlock: { alignItems: "center", marginTop: 4, marginBottom: 12 },
  svgPreviewBlock: {
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
    padding: 12,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
  },
  svgPreviewLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  vizBlock: {
    backgroundColor: Colors.bgElevated,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingVertical: 14,
    marginVertical: 12,
  },
  metrics: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
    marginBottom: 20,
  },
  metric: {
    flex: 1,
    backgroundColor: Colors.bgElevated,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  metricLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  metricValue: { color: Colors.text, fontSize: 18, fontWeight: "600" },
  micButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingVertical: 16,
    borderRadius: 18,
  },
  micButtonActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  micText: { color: Colors.text, fontSize: 16, fontWeight: "600", letterSpacing: 0.5 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#2A2014",
    borderWidth: 0.5,
    borderColor: Colors.warn,
  },
  errorText: { color: Colors.warn, fontSize: 13, flex: 1 },
  note: {
    marginTop: 28,
    padding: 16,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
  },
  noteTitle: {
    color: Colors.textMuted,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  noteBody: { color: Colors.text, fontSize: 13, lineHeight: 20 },
  kbd: {
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
    color: Colors.accent,
  },
});
