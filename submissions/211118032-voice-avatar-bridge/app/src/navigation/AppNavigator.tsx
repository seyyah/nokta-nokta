import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  NavigationContainer,
  NavigationContainerRef,
  NavigationState,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from '../types';
import { Colors, FontSize, FontWeight } from '../constants/theme';

import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import StatusScreen from '../screens/StatusScreen';
import MentorScreen from '../screens/MentorScreen';
import SummaryScreen from '../screens/SummaryScreen';
import HistoryScreen from '../screens/HistoryScreen';
import VoiceStudioScreen from '../screens/VoiceStudioScreen';
import ExpertBridgeScreen from '../screens/ExpertBridgeScreen';
import { useEscalations } from '../hooks/useEscalations';

// ─── Tab Icon components ──────────────────────────────────────────────────────

type TabIconProps = { focused: boolean; color: string; icon: string; label: string };

function TabIcon({ focused, color, icon, label }: TabIconProps) {
  return (
    <View style={tabStyles.iconWrapper}>
      <Text style={[tabStyles.icon, { opacity: focused ? 1 : 0.55 }]}>{icon}</Text>
      <Text style={[tabStyles.label, { color }]}>{label}</Text>
    </View>
  );
}

function BadgeIcon({ focused, color, icon, label, count }: TabIconProps & { count: number }) {
  return (
    <View style={tabStyles.iconWrapper}>
      <View>
        <Text style={[tabStyles.icon, { opacity: focused ? 1 : 0.55 }]}>{icon}</Text>
        {count > 0 && (
          <View style={tabStyles.badge}>
            <Text style={tabStyles.badgeText}>{count > 9 ? '9+' : count}</Text>
          </View>
        )}
      </View>
      <Text style={[tabStyles.label, { color }]}>{label}</Text>
    </View>
  );
}

// ─── Tab Navigator ────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  const { escalations } = useEscalations();
  const insets = useSafeAreaInsets();
  const activeCount = escalations.filter(
    (e) => e.status === 'pending' || e.status === 'accepted',
  ).length;

  const tabBarHeight = 60 + (Platform.OS === 'android' ? insets.bottom : 0);

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTitleStyle: {
          fontSize: FontSize.lg,
          fontWeight: FontWeight.semibold,
          color: Colors.textPrimary,
        },
        headerShadowVisible: false,
        tabBarStyle: [tabStyles.bar, { height: tabBarHeight, paddingBottom: insets.bottom + 6 }],
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Nokta Voice',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} icon="🏠" label="Ana" />
          ),
        }}
      />
      <Tab.Screen
        name="Studio"
        component={VoiceStudioScreen}
        options={{
          title: '🎙️ Stüdyo',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} icon="🎙️" label="Stüdyo" />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: 'Sohbet',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} icon="💬" label="Sohbet" />
          ),
        }}
      />
      <Tab.Screen
        name="Status"
        component={StatusScreen}
        options={{
          title: 'Taleplerim',
          tabBarIcon: ({ focused, color }) => (
            <BadgeIcon
              focused={focused}
              color={color}
              icon="📋"
              label="Talepler"
              count={activeCount}
            />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'Geçmiş Oturumlar',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} icon="🗂️" label="Geçmiş" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Root Stack ───────────────────────────────────────────────────────────────

const Stack = createNativeStackNavigator<RootStackParamList>();

type Props = {
  navigationRef?: React.RefObject<NavigationContainerRef<RootStackParamList> | null>;
  onStateChange?: (state: NavigationState | undefined) => void;
};

export default function AppNavigator({ navigationRef, onStateChange }: Props) {
  return (
    <NavigationContainer ref={navigationRef} onStateChange={onStateChange}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: Colors.surface },
          headerTitleStyle: {
            fontSize: FontSize.lg,
            fontWeight: FontWeight.semibold,
            color: Colors.textPrimary,
          },
          headerShadowVisible: false,
          headerBackTitleVisible: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Mentor"
          component={MentorScreen}
          options={{
            title: 'Mentor Görüşmesi',
            gestureEnabled: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="Summary"
          component={SummaryScreen}
          options={{
            title: 'Oturum Özeti',
            gestureEnabled: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="ExpertBridge"
          component={ExpertBridgeScreen}
          options={{
            headerShown: false,
            gestureEnabled: false,
            animation: 'slide_from_bottom',
            presentation: 'fullScreenModal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const tabStyles = StyleSheet.create({
  bar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    paddingTop: 8,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  icon: {
    fontSize: 22,
    textAlign: 'center',
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: FontWeight.bold,
    lineHeight: 12,
  },
});
