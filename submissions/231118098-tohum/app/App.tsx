import React, { useCallback, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { AuditWidget } from '@xtatistix/mobile-audit';
import { captureScreen, captureRef } from 'react-native-view-shot';
import {
  documentDirectory,
  writeAsStringAsync,
  EncodingType,
} from 'expo-file-system/legacy';
import { shareAsync } from 'expo-sharing';

import HomeScreen from './src/screens/HomeScreen';
import AddIdeaScreen from './src/screens/AddIdeaScreen';
import IdeaDetailScreen from './src/screens/IdeaDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MirrorScreen from './src/screens/MirrorScreen';
import BridgeScreen from './src/screens/BridgeScreen';
import { auditStorage } from './src/utils/auditStorage';
import type { RootStackParamList, MainTabParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '💡',
    Mirror: '🪞',
    Bridge: '📞',
    Profile: '👤',
  };
  return (
    <Text style={{ fontSize: focused ? 26 : 22, opacity: focused ? 1 : 0.6 }}>
      {icons[name]}
    </Text>
  );
}

function BugIcon() {
  return (
    <View style={bugIconStyles.container}>
      <Text style={bugIconStyles.text}>🐛</Text>
    </View>
  );
}

const bugIconStyles = StyleSheet.create({
  container: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
  },
});

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1E293B',
          borderTopColor: '#334155',
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#64748B',
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Fikirler' }} />
      <Tab.Screen name="Mirror" component={MirrorScreen} options={{ title: 'Ayna' }} />
      <Tab.Screen name="Bridge" component={BridgeScreen} options={{ title: 'Köprü' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const navRef = useNavigationContainerRef<RootStackParamList>();
  const [currentScreen, setCurrentScreen] = useState<string>('Home');

  const syncRouteName = useCallback(() => {
    const route = navRef.getCurrentRoute();
    if (route?.name) setCurrentScreen(route.name);
  }, [navRef]);

  return (
    <NavigationContainer
      ref={navRef}
      onReady={syncRouteName}
      onStateChange={syncRouteName}
    >
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#1E293B' },
          headerTintColor: '#F8FAFC',
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: '#0F172A' },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddIdea"
          component={AddIdeaScreen}
          options={{ title: 'Yeni Fikir' }}
        />
        <Stack.Screen
          name="IdeaDetail"
          component={IdeaDetailScreen}
          options={{ title: 'Fikir Detayı' }}
        />
      </Stack.Navigator>

      <AuditWidget
        appName="NOKTA"
        deps={{
          captureScreen: () => captureScreen({ format: 'png', result: 'tmpfile' }),
          captureRef: (ref: React.RefObject<any>) =>
            captureRef(ref, { format: 'png', result: 'tmpfile' }),
          writeFile: async (filename: string, content: string) => {
            const uri = documentDirectory + filename;
            await writeAsStringAsync(uri, content);
            return uri;
          },
          writeFileBinary: async (filename: string, base64: string) => {
            const uri = documentDirectory + filename;
            await writeAsStringAsync(uri, base64, {
              encoding: EncodingType.Base64,
            });
            return uri;
          },
          shareFile: (uri: string) => shareAsync(uri),
          storage: auditStorage,
          currentScreen,
          reporterId: '231118098',
          BugIcon: <BugIcon />,
        }}
        initialPosition={{ bottom: 180, right: 16 }}
      />
    </NavigationContainer>
  );
}
