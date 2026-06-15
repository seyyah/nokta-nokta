import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import type { NavigationState, PartialState } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useApp } from '../context/AppContext';
import DailyEntryScreen from '../screens/DailyEntryScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

type AnyNavigationState = NavigationState | PartialState<NavigationState> | undefined;

type AppNavigatorProps = {
  onRouteChange?: (routeName: string) => void;
};

function LoadingScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ color: colors.textSecondary, marginTop: 12 }}>FitLoop hazirlaniyor...</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text, fontWeight: '700' },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 76,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'create-outline';
          if (route.name === 'Gunluk') iconName = focused ? 'create' : 'create-outline';
          if (route.name === 'Gecmis') iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          if (route.name === 'Profil') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Gunluk" component={DailyEntryScreen} />
      <Tab.Screen name="Gecmis" component={HistoryScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function getActiveRouteName(state?: AnyNavigationState) {
  if (!state) return 'Startup';
  const route = state.routes[state.index ?? 0];
  const nestedState = route && 'state' in route ? route.state : undefined;
  if (nestedState) {
    return getActiveRouteName(nestedState);
  }
  return route?.name ?? 'Startup';
}

export default function AppNavigator({ onRouteChange }: AppNavigatorProps) {
  const { isReady } = useApp();
  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  if (!isReady) return <LoadingScreen />;

  return (
    <NavigationContainer
      onReady={() => onRouteChange?.('Gunluk')}
      onStateChange={(state) => onRouteChange?.(getActiveRouteName(state))}
      theme={customDarkTheme}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
