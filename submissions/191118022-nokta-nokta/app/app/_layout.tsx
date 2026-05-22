import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuditMount } from '../components/AuditMount';
import { palette } from '../lib/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: palette.canvas },
          headerShadowVisible: false,
          headerTintColor: palette.ink,
          contentStyle: { backgroundColor: palette.canvas },
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Nokta Nokta' }} />
        <Stack.Screen name="voice" options={{ title: 'Voice Mirror' }} />
        <Stack.Screen name="avatar" options={{ title: 'Avatar' }} />
        <Stack.Screen name="bridge" options={{ title: 'Bridge' }} />
        <Stack.Screen name="backlog" options={{ title: 'Backlog' }} />
        <Stack.Screen name="insights" options={{ title: 'Insights' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      </Stack>
      <AuditMount />
    </>
  );
}
