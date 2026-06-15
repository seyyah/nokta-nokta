// app/_layout.tsx
// Kök ağaç. AuditWidget tek satır mount edilir (önceki hafta drop-in
// disiplini korunur). 3 ana ekran: Ayna (index), Forge, Bridge.

import React from 'react';
import { Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuditWidget } from '@xtatistix/mobile-audit';
import { buildAuditDeps } from '../src/audit/auditDeps';

function useCurrentScreen(): string {
  const segments = useSegments();
  const last = segments[segments.length - 1];
  const map: Record<string, string> = {
    index: 'MirrorScreen',
    forge: 'ForgeScreen',
    bridge: 'BridgeScreen',
  };
  return map[last] ?? 'MirrorScreen';
}

export default function RootLayout() {
  const currentScreen = useCurrentScreen();
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0d1117' },
          headerTintColor: '#f0f6fc',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#0d1117' },
        }}
      >
        <Stack.Screen name="index" options={{ title: '🪞 Ayna · Voice + Avatar' }} />
        <Stack.Screen name="forge" options={{ title: '🔨 Forge Ledger' }} />
        <Stack.Screen
          name="bridge"
          options={{ title: '📞 Uzman Köprüsü', presentation: 'modal', headerShown: false }}
        />
      </Stack>

      {/* AuditWidget — tek mount satırı (drop-in disiplini) */}
      <AuditWidget
        appName="Halka Kapanisi"
        deps={buildAuditDeps(currentScreen)}
        initialPosition={{ bottom: 90, right: 16 }}
      />
    </>
  );
}
