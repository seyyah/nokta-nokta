import React from 'react';
import { Stack, usePathname } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { captureScreen, captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Text } from 'react-native';
import { AuditWidget } from '@xtatistix/mobile-audit';
import { auditStorage } from '../src/storage/auditStorage';

/**
 * RootLayout — AuditWidget TEK burada mount edilir.
 *
 * Drop-in tersi testi:
 *   grep -r 'AuditWidget' app/
 *   → Tek sonuç: app/_layout.tsx (bu dosya)
 *
 * Widget kaldırıldığında (bu blok silindiğinde) uygulama
 * bozulmadan çalışmaya devam eder.
 */
export default function RootLayout() {
  const pathname = usePathname();

  // Expo Router pathname → okunabilir ekran adı
  const currentScreen = (() => {
    if (pathname === '/' || pathname === '/index') return 'HomeScreen';
    if (pathname.startsWith('/idea/')) return 'IdeaDetailScreen';
    if (pathname === '/ideas') return 'IdeaListScreen';
    if (pathname === '/onboarding') return 'OnboardingScreen';
    return pathname.replace('/', '').replace(/\//g, '_') || 'UnknownScreen';
  })();

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0f0f0f' },
          headerTintColor: '#f5f0e8',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen name="index"        options={{ title: 'Nokta' }} />
        <Stack.Screen name="ideas"        options={{ title: 'Fikirler' }} />
        <Stack.Screen name="idea/[id]"    options={{ title: 'Fikir Detayı' }} />
        <Stack.Screen name="onboarding"   options={{ title: 'Hoş Geldin', headerShown: false }} />
      </Stack>

      {/* ── AuditWidget: TEK MOUNT NOKTASI ── */}
      <AuditWidget
        appName="Nokta"
        deps={{
          captureScreen: () => captureScreen({ format: 'png', result: 'tmpfile' }),
          captureRef: (ref) => captureRef(ref, { format: 'png', result: 'tmpfile' }),
          writeFile: async (filename: string, content: string) => {
            const uri = (FileSystem.documentDirectory ?? '') + filename;
            await FileSystem.writeAsStringAsync(uri, content);
            return uri;
          },
          writeFileBinary: async (filename: string, base64: string) => {
            const uri = (FileSystem.documentDirectory ?? '') + filename;
            await FileSystem.writeAsStringAsync(uri, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });
            return uri;
          },
          shareFile: (uri: string) => Sharing.shareAsync(uri),
          storage: auditStorage,
          currentScreen,
          reporterId: 'track-b-tester',
          BugIcon: <Text style={{ fontSize: 20 }}>🐛</Text>,
        }}
        initialPosition={{ bottom: 120, right: 16 }}
      />
    </SafeAreaProvider>
  );
}
