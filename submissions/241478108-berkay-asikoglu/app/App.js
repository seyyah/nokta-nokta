import * as React from 'react';
import { useState, useCallback } from 'react';
import { StatusBar, Text } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
let captureScreen, captureRef;
try {
  const viewShot = require('react-native-view-shot');
  captureScreen = viewShot.captureScreen;
  captureRef = viewShot.captureRef;
} catch (e) {
  // Expo Go fallback — native module not available in managed workflow
  const MOCK_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  captureScreen = () => Promise.resolve(MOCK_URI);
  captureRef = () => Promise.resolve(MOCK_URI);
}
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuditWidget } from '@xtatistix/mobile-audit';
import { ForgeProvider } from './src/context/ForgeContext';
import CaptureScreen from './src/screens/CaptureScreen';
import ProcessingScreen from './src/screens/ProcessingScreen';
import InsightScreen from './src/screens/InsightScreen';
import ClarifyScreen from './src/screens/ClarifyScreen';
import IdeaResultScreen from './src/screens/IdeaResultScreen';
import VoiceVisualizerScreen from './src/screens/VoiceVisualizerScreen';
import AvatarScreen from './src/screens/AvatarScreen';
import ExpertCallScreen from './src/screens/ExpertCallScreen';
import BridgeScreen from './src/screens/BridgeScreen';
import CartScreen from './src/screens/CartScreen';

const Stack = createNativeStackNavigator();

const EtherealTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#09090b',
    card: '#0a0a0c',
    text: '#ffffff',
    border: '#27272a',
    primary: '#a855f7',
  },
};

const STORAGE_KEY = 'audit_notes';

const auditStorage = {
  async loadNotes() {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  },
  async saveNotes(notes) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  },
};

function getActiveRouteName(state) {
  if (!state || !state.routes) return 'Unknown';
  const route = state.routes[state.index];
  if (route.state) return getActiveRouteName(route.state);
  return route.name;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Capture');

  const onStateChange = useCallback((state) => {
    const name = getActiveRouteName(state);
    if (name) setCurrentScreen(name);
  }, []);

  return (
    <ForgeProvider>
      <NavigationContainer theme={EtherealTheme} onStateChange={onStateChange}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Stack.Navigator
          initialRouteName="VoiceVisualizer"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="Capture" component={CaptureScreen} />
          <Stack.Screen name="Processing" component={ProcessingScreen} />
          <Stack.Screen name="Insight" component={InsightScreen} />
          <Stack.Screen name="Clarify" component={ClarifyScreen} options={{ presentation: 'transparentModal' }} />
          <Stack.Screen name="IdeaResult" component={IdeaResultScreen} />
          <Stack.Screen name="VoiceVisualizer" component={VoiceVisualizerScreen} />
          <Stack.Screen name="Avatar" component={AvatarScreen} />
          <Stack.Screen 
            name="ExpertCall" 
            component={ExpertCallScreen} 
            options={{ 
              headerShown: true, 
              title: "Nokta Expert Call", 
              headerStyle: { backgroundColor: '#09090b' },
              headerTintColor: '#00f5ff'
            }} 
          />
          <Stack.Screen name="Bridge" component={BridgeScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
        </Stack.Navigator>

        <AuditWidget
          appName="Nokta"
          deps={{
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
            reporterId: 'developer',
            BugIcon: <Text style={{ fontSize: 22 }}>🐛</Text>,
          }}
          initialPosition={{ bottom: 110, right: 16 }}
        />
      </NavigationContainer>
    </ForgeProvider>
  );
}
