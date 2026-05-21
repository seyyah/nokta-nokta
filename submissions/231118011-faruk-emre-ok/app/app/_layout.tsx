import { Slot, usePathname } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useMemo } from "react";
import { Platform, Text, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as MobileAudit from "@xtatistix/mobile-audit";
import type { AuditNote, AuditStorage } from "@xtatistix/mobile-audit";

const NOTE_FILE = "nokta-audit-notes.json";
const reporterId = process.env.EXPO_PUBLIC_REPORTER_ID ?? "231118011-track-a";
const FALLBACK_SCREENSHOT =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lbYoQwAAAABJRU5ErkJggg==";
let webNotes: AuditNote[] = [];

function storageUri() {
  const baseUri = FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? "";
  return `${baseUri}${NOTE_FILE}`;
}

function safeName(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function routeToScreen(pathname: string) {
  if (pathname === "/reports") {
    return "Reports";
  }

  if (pathname === "/forge") {
    return "Forge";
  }

  return "Capture";
}

const storage: AuditStorage = {
  async loadNotes(): Promise<AuditNote[]> {
    if (Platform.OS === "web") {
      return webNotes;
    }

    try {
      const uri = storageUri();
      const info = await FileSystem.getInfoAsync(uri);
      if (!info.exists) {
        return [];
      }

      const raw = await FileSystem.readAsStringAsync(uri);
      const notes = JSON.parse(raw);
      return Array.isArray(notes) ? notes : [];
    } catch {
      return [];
    }
  },
  async saveNotes(notes: AuditNote[]): Promise<void> {
    if (Platform.OS === "web") {
      webNotes = notes;
      return;
    }

    await FileSystem.writeAsStringAsync(storageUri(), JSON.stringify(notes, null, 2));
  }
};

async function captureHostScreen() {
  if (Platform.OS === "web") {
    return FALLBACK_SCREENSHOT;
  }

  try {
    const viewShot = await import("react-native-view-shot");
    return await viewShot.captureScreen({ format: "png", result: "tmpfile" });
  } catch {
    return FALLBACK_SCREENSHOT;
  }
}

async function captureHostRef(ref: unknown) {
  if (Platform.OS === "web") {
    return FALLBACK_SCREENSHOT;
  }

  try {
    const viewShot = await import("react-native-view-shot");
    return await viewShot.captureRef(ref as never, { format: "png", result: "tmpfile" });
  } catch {
    return FALLBACK_SCREENSHOT;
  }
}

export default function RootLayout() {
  const pathname = usePathname();
  const currentScreen = routeToScreen(pathname);

  const deps = useMemo(
    () => ({
      captureScreen: captureHostScreen,
      captureRef: captureHostRef,
      writeFile: async (filename: string, content: string) => {
        if (Platform.OS === "web") {
          return `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;
        }

        const uri = `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? ""}${safeName(filename)}`;
        await FileSystem.writeAsStringAsync(uri, content);
        return uri;
      },
      writeFileBinary: async (filename: string, base64: string) => {
        if (Platform.OS === "web") {
          return `data:application/octet-stream;base64,${base64}`;
        }

        const uri = `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? ""}${safeName(filename)}`;
        await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
        return uri;
      },
      shareFile: async (uri: string) => {
        if (Platform.OS === "web") {
          return;
        }

        await Sharing.shareAsync(uri);
      },
      storage,
      currentScreen,
      reporterId,
      BugIcon: <Text style={styles.auditIcon}>!</Text>
    }),
    [currentScreen]
  );

  return (
    <SafeAreaProvider>
      <Slot />
      <MobileAudit.AuditWidget appName="Nokta Halka" deps={deps} initialPosition={{ bottom: 96, right: 16 }} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  auditIcon: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 28
  }
});
