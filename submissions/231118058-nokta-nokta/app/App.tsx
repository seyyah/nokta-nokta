import React, { useState, useRef } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, Text, View } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { MainNavigator } from './src/navigation';
import { theme } from './src/theme';
import { ThemeProvider } from './src/context/ThemeContext';

// Audit Imports
import { AuditWidget } from './src/audit';
import { auditStorage } from './src/audit/auditStorage';
import { captureScreen, captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

const navigationRef = createNavigationContainerRef();

function App(): React.JSX.Element {
  const [currentScreen, setCurrentScreen] = useState('Dashboard');

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer
          ref={navigationRef}
          onReady={() => {
            const name = navigationRef.getCurrentRoute()?.name;
            if (name) setCurrentScreen(name);
          }}
          onStateChange={() => {
            const currentRouteName = navigationRef.getCurrentRoute()?.name;
            if (currentRouteName) {
              setCurrentScreen(currentRouteName);
            }
          }}
        >
          <StatusBar
            backgroundColor={theme.colors.background}
            barStyle="dark-content"
          />
          <MainNavigator />
          
          <AuditWidget
            appName="OkbilApp"
            deps={{
              captureScreen: () => captureScreen({ format: 'png', result: 'data-uri' }),
              captureRef: (ref) => captureRef(ref, { format: 'png', result: 'data-uri' }),
              writeFile: async (filename, content) => {
                const uri = (FileSystem.documentDirectory || '') + filename;
                await FileSystem.writeAsStringAsync(uri, content);
                
                // host computer bridge to write directly to submissions/231118058-nokta-nokta/
                // Running in background asynchronously so it never blocks the UI on timeout!
                const host = '192.168.1.101'; 
                fetch(`http://${host}:3000/save-report`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ filename, content })
                }).catch(() => {
                  // Fallback for simulator
                  fetch(`http://localhost:3000/save-report`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename, content })
                  }).catch(() => {});
                });
                
                return uri;
              },
              writeFileBinary: async (filename, base64) => {
                const uri = (FileSystem.documentDirectory || '') + filename;
                await FileSystem.writeAsStringAsync(uri, base64, {
                  encoding: FileSystem.EncodingType.Base64,
                });
                return uri;
              },
              readFile: async () => {
                const result = await DocumentPicker.getDocumentAsync({
                  type: '*/*',
                  copyToCacheDirectory: true,
                });
                if (!result.canceled && result.assets && result.assets[0]) {
                  const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
                  return content;
                }
                return null;
              },
              shareFile: (uri) => Sharing.shareAsync(uri),
              storage: auditStorage,
              currentScreen: currentScreen,
              reporterId: 'vgodak', // Example reporter ID
              BugIcon: (
                <View style={{
                  backgroundColor: '#e53e3e',
                  paddingHorizontal: 12,
                  height: 52,
                  borderRadius: 26,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4.65,
                  elevation: 8,
                  borderWidth: 2,
                  borderColor: 'rgba(255,255,255,0.3)'
                }}>
                  <ShieldCheck color="white" size={24} />
                  <Text style={{ 
                    color: 'white', 
                    fontWeight: 'bold', 
                    marginLeft: 6,
                    fontSize: 12,
                    letterSpacing: 0.5
                  }}>AUDIT</Text>
                </View>
              ),
            }}
            initialPosition={{ bottom: 100, right: 20 }}
          />
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
