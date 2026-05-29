import AsyncStorage from "@react-native-async-storage/async-storage";
import { Slot, usePathname } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import React, { useMemo } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { captureRef, captureScreen } from "react-native-view-shot";
import * as MobileAudit from "@xtatistix/mobile-audit";
import type { AuditNote, AuditStorage } from "@xtatistix/mobile-audit";

const STORAGE_KEY = "nokta-audit-forge-notes";

const auditStorage: AuditStorage = {
  async loadNotes(): Promise<AuditNote[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuditNote[]) : [];
  },
  async saveNotes(notes: AuditNote[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }
};

const screenNameFromPath = (pathname: string) => {
  if (pathname === "/") {
    return "Capture";
  }

  return pathname
    .replace("/", "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export default function RootLayout() {
  const pathname = usePathname();
  const currentScreen = screenNameFromPath(pathname);

  const auditDeps = useMemo(
    () => ({
      captureScreen: () => captureScreen({ format: "png", result: "tmpfile" }),
      captureRef: (ref: Parameters<typeof captureRef>[0]) =>
        captureRef(ref, { format: "png", result: "tmpfile" }),
      writeFile: async (filename: string, content: string) => {
        const uri = `${FileSystem.documentDirectory ?? ""}${filename}`;
        await FileSystem.writeAsStringAsync(uri, content);
        return uri;
      },
      writeFileBinary: async (filename: string, base64: string) => {
        const uri = `${FileSystem.documentDirectory ?? ""}${filename}`;
        await FileSystem.writeAsStringAsync(uri, base64, {
          encoding: FileSystem.EncodingType.Base64
        });
        return uri;
      },
      shareFile: async (uri: string) => {
        await Sharing.shareAsync(uri);
      },
      storage: auditStorage,
      currentScreen,
      reporterId: process.env.EXPO_PUBLIC_AUDIT_REPORTER ?? "qa-sadelik-lab",
      BugIcon: <Text style={styles.bugMark}>!</Text>
    }),
    [currentScreen]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.shell}>
        <Slot />
      </View>
      <MobileAudit.AuditWidget appName="Nokta Audit Forge" deps={auditDeps} initialPosition={{ bottom: 96, right: 18 }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f4f5f2"
  },
  shell: {
    flex: 1
  },
  bugMark: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900"
  }
});
