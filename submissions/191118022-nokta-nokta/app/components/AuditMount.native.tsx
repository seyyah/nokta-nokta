import React from 'react';
import { Text } from 'react-native';
import { usePathname } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { captureRef, captureScreen } from 'react-native-view-shot';
import { AuditWidget } from '@xtatistix/mobile-audit';
import { auditStorage } from '../lib/auditStorage';

export function AuditMount() {
  const pathname = usePathname();

  return (
    <AuditWidget
      appName="Nokta Nokta Final"
      deps={{
        captureScreen: () => captureScreen({ format: 'png', result: 'data-uri' }),
        captureRef: (ref) => captureRef(ref, { format: 'png', result: 'data-uri' }),
        writeFile: async (filename, content) => {
          const uri = `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory}${filename}`;
          await FileSystem.writeAsStringAsync(uri, content);
          return uri;
        },
        writeFileBinary: async (filename, base64) => {
          const uri = `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory}${filename}`;
          await FileSystem.writeAsStringAsync(uri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
          return uri;
        },
        shareFile: (uri) => Sharing.shareAsync(uri),
        storage: auditStorage,
        currentScreen: pathname,
        reporterId: '191118022-bahri',
        BugIcon: <Text style={{ fontSize: 13, fontWeight: '900' }}>AUD</Text>,
      }}
      initialPosition={{ bottom: 110, right: 18 }}
    />
  );
}
