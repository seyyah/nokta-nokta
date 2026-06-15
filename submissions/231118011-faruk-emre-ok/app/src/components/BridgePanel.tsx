import { createElement } from "react";
import { Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";

const BRIDGE_ROOM = "https://meet.jit.si/Nokta231118011HalkaKapanisi#config.prejoinPageEnabled=false";

export function BridgePanel() {
  const openBridge = async () => {
    await Linking.openURL(BRIDGE_ROOM);
  };

  return (
    <View style={styles.panel}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.label}>HITL bridge</Text>
          <Text style={styles.heading}>Uzmana Baglan</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={openBridge} style={({ pressed }) => [styles.callButton, pressed && styles.pressed]}>
          <Text style={styles.callButtonText}>Call</Text>
        </Pressable>
      </View>

      <View style={styles.capabilityRow}>
        <Text style={styles.capability}>Video</Text>
        <Text style={styles.capability}>Audio</Text>
        <Text style={styles.capability}>Screen share</Text>
      </View>

      {Platform.OS === "web" ? (
        <View style={styles.frameWrap}>
          {/*
            Jitsi is intentionally embedded only on web. Native builds open the same room
            through the platform browser/Jitsi app so camera, mic, and share permissions stay native.
          */}
          {createJitsiFrame()}
        </View>
      ) : (
        <View style={styles.nativeBridgeBox}>
          <Text style={styles.nativeBridgeText}>Room: Nokta231118011HalkaKapanisi</Text>
        </View>
      )}
    </View>
  );
}

function createJitsiFrame() {
  return createElement("iframe", {
    allow: "camera; microphone; fullscreen; display-capture; autoplay; clipboard-write",
    src: BRIDGE_ROOM,
    style: webFrameStyle,
    title: "Nokta HITL bridge"
  });
}

const webFrameStyle = {
  border: 0,
  height: "100%",
  width: "100%"
};

const styles = StyleSheet.create({
  panel: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D7DEE8",
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    padding: 14
  },
  headerRow: {
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
  callButton: {
    alignItems: "center",
    backgroundColor: "#0F172A",
    borderRadius: 8,
    height: 42,
    justifyContent: "center",
    minWidth: 74,
    paddingHorizontal: 14
  },
  callButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 18
  },
  pressed: {
    opacity: 0.72
  },
  capabilityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  capability: {
    backgroundColor: "#DCFCE7",
    borderColor: "#86EFAC",
    borderRadius: 6,
    borderWidth: 1,
    color: "#166534",
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 16,
    paddingHorizontal: 8,
    paddingVertical: 5
  },
  frameWrap: {
    borderColor: "#CBD5E1",
    borderRadius: 8,
    borderWidth: 1,
    height: 360,
    overflow: "hidden"
  },
  nativeBridgeBox: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 76,
    justifyContent: "center",
    padding: 12
  },
  nativeBridgeText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18
  }
});
