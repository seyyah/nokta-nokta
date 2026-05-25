import { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { AppHeader } from './src/components/AppHeader';
import { BottomTabs, type AppScreen } from './src/components/BottomTabs';
import { MirrorScreen } from './src/screens/MirrorScreen';
import { useVoiceMeter } from './src/hooks/useVoiceMeter';
import { colors } from './src/theme';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('mirror');
  const voice = useVoiceMeter();

  return (
    <SafeAreaView style={styles.safe}>
      <ExpoStatusBar style="dark" />
      <View style={styles.container}>
        <AppHeader screen={screen} />
        {screen === 'mirror' ? (
          <MirrorScreen voice={voice} />
        ) : (
          <View style={styles.pending}>
            <Text style={styles.pendingTitle}>{screen.toUpperCase()}</Text>
            <Text style={styles.pendingText}>Bu modul bir sonraki forge adiminda baglanacak.</Text>
          </View>
        )}
      </View>
      <BottomTabs active={screen} onChange={setScreen} />
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
  pending: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  pendingTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '800',
  },
  pendingText: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
