import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text } from 'react-native';
import { captureScreen, captureRef } from 'react-native-view-shot';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuditWidget } from '@xtatistix/mobile-audit';
import type { AuditStorage, AuditNote } from '@xtatistix/mobile-audit';
import RoleSelectScreen from './src/screens/RoleSelectScreen';
import HomeScreen from './src/screens/HomeScreen';
import QuestionFlowScreen from './src/screens/QuestionFlowScreen';
import SpecOutputScreen from './src/screens/SpecOutputScreen';
import ExpertsScreen from './src/screens/ExpertsScreen';
import ExpertDetailScreen from './src/screens/ExpertDetailScreen';
import UserInboxScreen from './src/screens/UserInboxScreen';
import ExpertLoginScreen from './src/screens/ExpertLoginScreen';
import ExpertPanelScreen from './src/screens/ExpertPanelScreen';
import ConversationScreen from './src/screens/ConversationScreen';
import { QA } from './src/services/gemini';

const AUDIT_STORAGE_KEY = 'audit_notes';

const auditStorage: AuditStorage = {
  async loadNotes(): Promise<AuditNote[]> {
    const raw = await AsyncStorage.getItem(AUDIT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  },
  async saveNotes(notes: AuditNote[]): Promise<void> {
    await AsyncStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(notes));
  },
};

export type RootStackParamList = {
  RoleSelect: undefined;
  Home: undefined;
  Questions: { idea: string };
  Spec: { idea: string; qas: QA[] };
  Experts: { spec?: string };
  ExpertDetail: { expertId: string; spec?: string };
  UserInbox: undefined;
  ExpertLogin: undefined;
  ExpertPanel: { expertId: string };
  Conversation: { messageId: string; expertId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#0a0a0a' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '700' },
            cardStyle: { backgroundColor: '#0a0a0a' },
          }}
        >
          <Stack.Screen name="RoleSelect" component={RoleSelectScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="Questions"
            component={QuestionFlowScreen}
            options={{ title: 'Dot Capture' }}
          />
          <Stack.Screen
            name="Spec"
            component={SpecOutputScreen}
            options={{ title: 'Your Spec' }}
          />
          <Stack.Screen
            name="Experts"
            component={ExpertsScreen}
            options={{ title: 'Uzman Desteği' }}
          />
          <Stack.Screen
            name="ExpertDetail"
            component={ExpertDetailScreen}
            options={{ title: 'Uzman Detayı' }}
          />
          <Stack.Screen
            name="UserInbox"
            component={UserInboxScreen}
            options={{ title: 'Mesajlarım' }}
          />
          <Stack.Screen
            name="ExpertLogin"
            component={ExpertLoginScreen}
            options={{ title: 'Uzman Girişi' }}
          />
          <Stack.Screen
            name="ExpertPanel"
            component={ExpertPanelScreen}
            options={{ title: 'Uzman Paneli' }}
          />
          <Stack.Screen
            name="Conversation"
            component={ConversationScreen}
            options={{ title: 'Konuşma' }}
          />
        </Stack.Navigator>
      </NavigationContainer>

      <AuditWidget
        appName="Nokta Dot Capture"
        deps={{
          captureScreen: () => captureScreen({ format: 'png', result: 'tmpfile' }),
          captureRef: (ref) => captureRef(ref, { format: 'png', result: 'tmpfile' }),
          writeFile: async (filename, content) => {
            const file = new File(Paths.document, filename);
            file.write(content);
            return file.uri;
          },
          writeFileBinary: async (filename, base64) => {
            const file = new File(Paths.document, filename);
            file.write(base64, { encoding: 'base64' });
            return file.uri;
          },
          shareFile: (uri) => Sharing.shareAsync(uri),
          storage: auditStorage,
          currentScreen: 'App',
          reporterId: 'qa-team',
          BugIcon: <Text style={{ fontSize: 22 }}>🐛</Text>,
        }}
        initialPosition={{ bottom: 110, right: 16 }}
      />
    </GestureHandlerRootView>
  );
}
