import React from 'react';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { captureScreen, captureRef } from 'react-native-view-shot';
import { Text } from 'react-native';
import type { AuditWidgetDeps, AuditStorage } from './audit/index';

const NOTES_FILENAME = 'audit_notes.json';

const auditStorage: AuditStorage = {
  loadNotes: async () => {
    try {
      const file = new File(Paths.document, NOTES_FILENAME);
      if (!file.exists) return [];
      const raw = await file.text();
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },
  saveNotes: async (notes) => {
    const file = new File(Paths.document, NOTES_FILENAME);
    file.write(JSON.stringify(notes));
  },
};

export function buildAuditDeps(currentScreen: string): AuditWidgetDeps {
  return {
    captureScreen: () => captureScreen({ format: 'jpg', quality: 0.8 }),
    captureRef: (ref) => captureRef(ref, { format: 'jpg', quality: 0.85 }),
    writeFile: async (filename, content) => {
      const file = new File(Paths.document, filename);
      file.write(content);
      return file.uri;
    },
    writeFileBinary: async (filename, base64) => {
      const file = new File(Paths.document, filename);
      file.write(base64);
      return file.uri;
    },
    shareFile: async (uri) => {
      await Sharing.shareAsync(uri);
    },
    storage: auditStorage,
    currentScreen,
    BugIcon: <Text style={{ fontSize: 20 }}>🐛</Text>,
    reporterId: '9221118097',
  };
}
