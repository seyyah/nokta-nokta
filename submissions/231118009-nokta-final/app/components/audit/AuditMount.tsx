import React from 'react';
import { Platform, Text } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { usePathname } from 'expo-router';
import { captureRef, captureScreen } from 'react-native-view-shot';

import { auditStorage } from './async-storage';
import { AuditWidget } from './AuditWidget';

function downloadTextFile(filename: string, content: string, type: string): string {
  const blob = new Blob([content], { type });
  const uri = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = uri;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  return uri;
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return buffer;
}

export function AuditMount() {
  const pathname = usePathname();

  return (
    <AuditWidget
      appName="Axon AI"
      deps={{
        captureScreen: () => captureScreen({ format: 'png', result: 'tmpfile' }),
        captureRef: ref => captureRef(ref, { format: 'png', result: 'tmpfile' }),
        writeFile: async (filename, content) => {
          if (Platform.OS === 'web') {
            return downloadTextFile(filename, content, 'text/markdown;charset=utf-8');
          }
          const uri = `${FileSystem.documentDirectory}${filename}`;
          await FileSystem.writeAsStringAsync(uri, content);
          return uri;
        },
        writeFileBinary: async (filename, base64) => {
          if (Platform.OS === 'web') {
            const blob = new Blob([base64ToArrayBuffer(base64)], {
              type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            });
            const uri = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = uri;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            return uri;
          }
          const uri = `${FileSystem.documentDirectory}${filename}`;
          await FileSystem.writeAsStringAsync(uri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
          return uri;
        },
        shareFile: async uri => {
          if (Platform.OS === 'web') {
            return;
          }
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri);
          }
        },
        storage: auditStorage,
        currentScreen: pathname || 'unknown',
        reporterId: 'qa-team',
        BugIcon: <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: '900' }}>!</Text>,
      }}
      initialPosition={{ bottom: 108, right: 16 }}
    />
  );
}
