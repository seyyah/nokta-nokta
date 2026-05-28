import React from 'react';
import { Text } from 'react-native';
import { captureScreen, captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { AuditWidgetDeps } from '@xtatistix/mobile-audit';
import { auditStorage } from './auditStorage';

export function createAuditDeps(currentScreen: string): AuditWidgetDeps {
  return {
    captureScreen: () => captureScreen({ format: 'png', result: 'tmpfile' }),
    captureRef: (ref) => captureRef(ref, { format: 'png', result: 'tmpfile' }),
    writeFile: async (filename, content) => {
      const uri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(uri, content);
      return uri;
    },
    writeFileBinary: async (filename, base64) => {
      const uri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return uri;
    },
    shareFile: (uri) => Sharing.shareAsync(uri),
    storage: auditStorage,
    currentScreen,
    reporterId: '211118032',
    BugIcon: React.createElement(Text, { style: { fontSize: 22 } }, '🐛'),
  };
}
