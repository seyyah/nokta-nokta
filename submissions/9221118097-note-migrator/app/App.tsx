import React, { useState } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import DumpScreen from './screens/DumpScreen';
import CardsScreen from './screens/CardsScreen';
import ReviewScreen from './screens/ReviewScreen';
import BridgeScreen from './screens/BridgeScreen';
import { IdeaCard } from './services/claudeApi';
import { AuditWidget } from './audit/index';
import { buildAuditDeps } from './auditDeps';

export type RootStackParamList = {
  Dump: undefined;
  Review: { cards: IdeaCard[] };
  Cards: { cards: IdeaCard[] };
  Bridge: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('DumpScreen');

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={() => {
        const route = navigationRef.getCurrentRoute();
        if (route?.name) setCurrentScreen(route.name);
      }}
    >
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Dump" component={DumpScreen} />
        <Stack.Screen name="Review" component={ReviewScreen} />
        <Stack.Screen name="Cards" component={CardsScreen} />
        <Stack.Screen name="Bridge" component={BridgeScreen} />
      </Stack.Navigator>
      <AuditWidget
        deps={buildAuditDeps(currentScreen)}
        appName="NoteMigrator"
      />
      <TouchableOpacity
        style={styles.bridgeFab}
        onPress={() => navigationRef.current?.navigate('Bridge' as never)}
      >
        <Text style={styles.bridgeFabText}>📞</Text>
      </TouchableOpacity>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  bridgeFab: {
    position: 'absolute',
    bottom: 170,
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1e3a1a',
    borderWidth: 1,
    borderColor: '#4caf50',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9998,
    elevation: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  bridgeFabText: {
    fontSize: 22,
  },
});
