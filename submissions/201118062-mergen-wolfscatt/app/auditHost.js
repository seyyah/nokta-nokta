import React from "react";
import { StyleSheet, Text } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { captureRef as captureViewRef, captureScreen as captureDeviceScreen } from "react-native-view-shot";

const baseDirectory = FileSystem.documentDirectory || FileSystem.cacheDirectory;
const auditDirectory = baseDirectory ? `${baseDirectory}audit-forge/` : null;
const exportsDirectory = auditDirectory ? `${auditDirectory}exports/` : null;
const notesFile = auditDirectory ? `${auditDirectory}notes.json` : null;

function requirePath(path, label) {
  if (!path) {
    throw new Error(`[auditHost] ${label} path is unavailable on this platform.`);
  }

  return path;
}

async function ensureDirectoryExists(directory) {
  const path = requirePath(directory, "directory");
  const info = await FileSystem.getInfoAsync(path);

  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(path, { intermediates: true });
  }

  return path;
}

const auditStorage = {
  async loadNotes() {
    await ensureDirectoryExists(auditDirectory);
    const path = requirePath(notesFile, "notes file");
    const info = await FileSystem.getInfoAsync(path);

    if (!info.exists) {
      return [];
    }

    const raw = await FileSystem.readAsStringAsync(path);

    if (!raw.trim()) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn("[auditHost] Failed to parse stored audit notes:", error);
      return [];
    }
  },

  async saveNotes(notes) {
    await ensureDirectoryExists(auditDirectory);
    const path = requirePath(notesFile, "notes file");
    await FileSystem.writeAsStringAsync(path, JSON.stringify(notes, null, 2));
  }
};

async function writeTextFile(filename, content) {
  const directory = await ensureDirectoryExists(exportsDirectory);
  const fileUri = `${directory}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, content);
  return fileUri;
}

async function writeBinaryFile(filename, base64) {
  const directory = await ensureDirectoryExists(exportsDirectory);
  const fileUri = `${directory}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64
  });
  return fileUri;
}

async function shareFile(uri) {
  const isAvailable = await Sharing.isAvailableAsync();

  if (!isAvailable) {
    console.warn("[auditHost] Sharing is unavailable on this platform. File saved at:", uri);
    return;
  }

  await Sharing.shareAsync(uri, {
    dialogTitle: "Export audit report"
  });
}

async function prepareNoteExport({ slug, markdownFilename, markdownContent, screenshotFilename, screenshotUri }) {
  if (!screenshotUri) {
    throw new Error("Screenshot URI is missing.");
  }

  const bundleDirectory = await ensureDirectoryExists(`${requirePath(exportsDirectory, "exports directory")}${slug}/`);
  const screenshotsDirectory = await ensureDirectoryExists(`${bundleDirectory}screenshots/`);
  const markdownUri = `${bundleDirectory}${markdownFilename}`;
  const screenshotExportUri = `${screenshotsDirectory}${screenshotFilename}`;

  await FileSystem.deleteAsync(markdownUri, { idempotent: true });
  await FileSystem.deleteAsync(screenshotExportUri, { idempotent: true });

  if (screenshotUri.startsWith("data:")) {
    const [, base64 = ""] = screenshotUri.split(",", 2);
    await FileSystem.writeAsStringAsync(screenshotExportUri, base64, {
      encoding: FileSystem.EncodingType.Base64
    });
  } else {
    await FileSystem.copyAsync({
      from: screenshotUri,
      to: screenshotExportUri
    });
  }

  await FileSystem.writeAsStringAsync(markdownUri, markdownContent);

  console.log("[auditHost] Prepared single-note export bundle:", {
    bundleDirectory,
    markdownUri,
    screenshotExportUri
  });

  return {
    markdownUri,
    screenshotUri: screenshotExportUri,
    markdownFilename,
    screenshotFilename,
    screenshotRelativePath: `./screenshots/${screenshotFilename}`,
    bundleDirectory
  };
}

const styles = StyleSheet.create({
  bugIcon: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 28
  }
});

export function createAuditDeps(currentScreen) {
  return {
    captureScreen: () =>
      captureDeviceScreen({
        format: "png",
        quality: 1,
        result: "tmpfile"
      }),
    captureRef: (ref) =>
      captureViewRef(ref, {
        format: "png",
        quality: 1,
        result: "tmpfile"
      }),
    writeFile: writeTextFile,
    writeFileBinary: writeBinaryFile,
    shareFile,
    prepareNoteExport,
    storage: auditStorage,
    currentScreen: currentScreen || "unknown",
    reporterId: "201118062-mergen-wolfscatt",
    BugIcon: <Text style={styles.bugIcon}>!</Text>
  };
}
