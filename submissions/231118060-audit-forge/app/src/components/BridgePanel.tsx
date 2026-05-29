import { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { bridgeConfig } from "../bridge/bridgeConfig";

export function BridgePanel() {
  const [error, setError] = useState<string | null>(null);

  const openBridge = async () => {
    setError(null);

    try {
      const canOpen = await Linking.canOpenURL(bridgeConfig.roomUrl);

      if (!canOpen) {
        throw new Error("No handler is available for the bridge URL.");
      }

      await Linking.openURL(bridgeConfig.roomUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Bridge could not be opened.");
    }
  };

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>{bridgeConfig.escalationId}</Text>
          <Text style={styles.title}>Human bridge</Text>
        </View>
        <Text style={styles.provider}>{bridgeConfig.provider}</Text>
      </View>

      <View style={styles.capabilities}>
        {bridgeConfig.capabilities.map((capability) => (
          <Text style={styles.capability} key={capability}>
            {capability}
          </Text>
        ))}
      </View>

      <View style={styles.caseBlock}>
        <Text style={styles.caseTitle}>Escalation packet</Text>
        <Text style={styles.caseText}>
          The bridge carries the active route, latest audit note, selected bounds and voice/avatar
          symptom into the expert conversation.
        </Text>
      </View>

      <Pressable accessibilityRole="button" onPress={openBridge} style={styles.button}>
        <Text style={styles.buttonText}>Connect expert</Text>
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d7d0c3",
    backgroundColor: "#fffaf2",
    padding: 14,
    gap: 14
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12
  },
  kicker: {
    color: "#5f665d",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  title: {
    color: "#202020",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 2
  },
  provider: {
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#e6ede7",
    color: "#1d564d",
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  capabilities: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap"
  },
  capability: {
    overflow: "hidden",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cdd7d0",
    color: "#33423d",
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  caseBlock: {
    borderRadius: 8,
    backgroundColor: "#f3eee5",
    padding: 12,
    gap: 4
  },
  caseTitle: {
    color: "#202020",
    fontSize: 16,
    fontWeight: "900"
  },
  caseText: {
    color: "#57524c",
    fontSize: 14,
    lineHeight: 20
  },
  button: {
    minHeight: 46,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#245d55"
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900"
  },
  error: {
    color: "#b42318",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18
  }
});
