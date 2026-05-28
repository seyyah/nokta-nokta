import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function AppNative() {
  const checklist = [
    "Voice visualizer demo is available in web demo",
    "Personal avatar.glb is included in the project",
    "Audit markdown reports are included",
    "Forge cycle logs are included",
    "STUCK expert bridge is documented",
    "Jitsi bridge URL is included",
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Student: 231118033 · Track: A</Text>
          <Text style={styles.title}>Nokta Nokta Voice Forge</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Status: Native APK fallback build</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Deliverables Checklist</Text>
          <View style={styles.list}>
            {checklist.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bullet}>✓</Text>
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Jitsi Bridge URL</Text>
          <View style={styles.urlContainer}>
            <Text style={styles.urlText}>
              https://meet.jit.si/231118033-nokta-nokta-bridge
            </Text>
          </View>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Important Note</Text>
          <Text style={styles.noteText}>
            “This APK fallback is provided for installable delivery. The full interactive voice/STT/TTS/avatar demo is shown in the web demo video.”
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#080B18",
  },
  container: {
    padding: 24,
    paddingBottom: 48,
  },
  header: {
    marginBottom: 24,
    alignItems: "flex-start",
  },
  kicker: {
    color: "#8EA4FF",
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 36,
    marginBottom: 12,
  },
  statusBadge: {
    backgroundColor: "rgba(142, 164, 255, 0.15)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#8EA4FF",
  },
  statusText: {
    color: "#8EA4FF",
    fontSize: 13,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#11162A",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#26304E",
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  bullet: {
    color: "#4ADE80",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
    marginTop: 1,
  },
  itemText: {
    color: "#B9C0D4",
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  urlContainer: {
    backgroundColor: "#080B18",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#26304E",
  },
  urlText: {
    color: "#8EA4FF",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  noteCard: {
    backgroundColor: "rgba(239, 68, 68, 0.05)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  noteTitle: {
    color: "#EF4444",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  noteText: {
    color: "#E2E8F0",
    fontSize: 14,
    lineHeight: 22,
    fontStyle: "italic",
  },
});
