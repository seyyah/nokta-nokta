// src/audit/auditDeps.ts
// Önceki haftadan birebir taşınan host application boundary.
// AuditWidget'ın host'a değdiği tek noktadır.

import React from 'react';
import { Text } from 'react-native';
import { captureScreen, captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuditWidgetDeps, AuditStorage, AuditNote } from '@xtatistix/mobile-audit';

const STORAGE_KEY = 'halka_audit_notes';

const auditStorage: AuditStorage = {
  async loadNotes(): Promise<AuditNote[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  },
  async saveNotes(notes: AuditNote[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  },
};

export function buildAuditDeps(currentScreen: string): AuditWidgetDeps {
  return {
    captureScreen: () => captureScreen({ format: 'png', result: 'tmpfile' }),
    captureRef: (ref) => captureRef(ref, { format: 'png', result: 'tmpfile' }),
    writeFile: async (filename: string, content: string) => {
      const uri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(uri, content);
      return uri;
    },
    writeFileBinary: async (filename: string, base64: string) => {
      const uri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return uri;
    },
    shareFile: (uri: string) => Sharing.shareAsync(uri),
    storage: auditStorage,
    currentScreen,
    reporterId: 'qa-221118054',
    BugIcon: React.createElement(Text, { style: { fontSize: 22 } }, '🐛'),
  };
}
