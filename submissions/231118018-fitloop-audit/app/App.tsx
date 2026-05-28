import React from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { captureRef } from 'react-native-view-shot';
import AuditWidget from './src/audit/AuditWidget';
import type { AuditWidgetDeps } from './src/audit/AuditWidget';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';

const auditDeps: AuditWidgetDeps = {
  captureView: (target) => captureRef(target, { format: 'png', quality: 0.9 }),
  copyFile: (from, to) => FileSystem.copyAsync({ from, to }),
  ensureDirectory: async (path) => {
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(path, { intermediates: true });
    }
  },
  getReportsDirectory: () => `${FileSystem.documentDirectory ?? ''}audit-reports/`,
  writeText: (path, content) => FileSystem.writeAsStringAsync(path, content),
};

export default function App() {
  const [currentScreen, setCurrentScreen] = React.useState('Startup');

  return (
    <AuditWidget deps={auditDeps} screenName={currentScreen}>
      <AppProvider>
        <AppNavigator onRouteChange={setCurrentScreen} />
      </AppProvider>
    </AuditWidget>
  );
}
