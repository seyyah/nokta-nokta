import { ReactNode, RefObject, useMemo, useState } from 'react';
import { Alert, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Bug } from 'lucide-react-native';
import * as MobileAudit from '@xtatistix/mobile-audit';
import type { AuditNote, AuditStorage } from '@xtatistix/mobile-audit';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { captureRef, captureScreen } from 'react-native-view-shot';
import { AppHeader } from './src/components/AppHeader';
import { BottomTabs, type AppScreen } from './src/components/BottomTabs';
import { MirrorScreen } from './src/screens/MirrorScreen';
import { AuditScreen } from './src/screens/AuditScreen';
import { ForgeScreen } from './src/screens/ForgeScreen';
import { BridgeScreen } from './src/screens/BridgeScreen';
import { useVoiceMeter } from './src/hooks/useVoiceMeter';
import { colors } from './src/theme';

type WidgetDeps = {
  captureScreen: () => Promise<string>;
  captureRef: (ref: RefObject<any>) => Promise<string>;
  writeFile: (filename: string, content: string) => Promise<string>;
  writeFileBinary: (filename: string, base64: string) => Promise<string>;
  shareFile: (uri: string) => Promise<void>;
  storage: AuditStorage;
  currentScreen: string;
  reporterId: string;
  BugIcon: ReactNode;
};

const labels: Record<AppScreen, string> = {
  audit: 'Audit Notu',
  bridge: 'Uzman Koprusu',
  forge: 'Forge Ratchet',
  mirror: 'Voice Avatar',
};

let auditNotes: AuditNote[] = [];
const auditStorage: AuditStorage = {
  async loadNotes() {
    return auditNotes;
  },
  async saveNotes(notes) {
    auditNotes = notes;
  },
};

function fileUri(filename: string) {
  const root = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
  if (!root) {
    throw new Error('Writable directory missing.');
  }
  return `${root}${filename}`;
}

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('mirror');
  const voice = useVoiceMeter();
  const auditDeps = useMemo<WidgetDeps>(
    () => ({
      BugIcon: <Bug color="#ffffff" size={22} />,
      captureRef: (ref) => captureRef(ref, { format: 'png', quality: 0.9, result: 'tmpfile' }),
      captureScreen: () => captureScreen({ format: 'png', quality: 0.9, result: 'tmpfile' }),
      currentScreen: labels[screen],
      reporterId: '231118040',
      shareFile: async (uri) => {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
          return;
        }
        Alert.alert('Rapor olustu', uri);
      },
      storage: auditStorage,
      writeFile: async (filename, content) => {
        const uri = fileUri(filename);
        await FileSystem.writeAsStringAsync(uri, content);
        return uri;
      },
      writeFileBinary: async (filename, base64) => {
        const uri = fileUri(filename);
        await FileSystem.writeAsStringAsync(uri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return uri;
      },
    }),
    [screen],
  );

  function changeScreen(next: AppScreen) {
    if (next !== 'mirror' && voice.active) {
      void voice.stop();
    }
    setScreen(next);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ExpoStatusBar style="dark" />
      <View style={styles.container}>
        <AppHeader screen={screen} />
        {screen === 'mirror' ? (
          <MirrorScreen voice={voice} />
        ) : screen === 'audit' ? (
          <AuditScreen />
        ) : screen === 'forge' ? (
          <ForgeScreen openBridge={() => setScreen('bridge')} />
        ) : (
          <BridgeScreen />
        )}
      </View>
      <BottomTabs active={screen} onChange={changeScreen} />
      <MobileAudit.AuditWidget
        appName="Nokta Mirror Bridge"
        deps={auditDeps}
        initialPosition={{ bottom: 84, right: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.canvas,
    flex: 1,
    paddingTop: StatusBar.currentHeight ?? 0,
  },
  container: {
    flex: 1,
  },
});
