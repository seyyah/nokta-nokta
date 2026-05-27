import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { HomeScreen } from './src/screens/HomeScreen';
import { ProjectsScreen } from './src/screens/ProjectsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { AvatarScreen } from './src/screens/AvatarScreen';
import { ProposalFAB } from './src/components/Audit/ProposalFAB';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <View style={styles.container}>
      {/* Ana Uygulama Navigasyonu (Host Application) */}
      <NavigationContainer>
        <Tab.Navigator 
          screenOptions={{ 
            headerShown: false,
            tabBarActiveTintColor: '#4f46e5',
            tabBarInactiveTintColor: '#9ca3af',
            tabBarStyle: {
              borderTopWidth: 0,
              elevation: 10,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowOffset: { width: 0, height: -4 },
              shadowRadius: 10,
            }
          }}
        >
          <Tab.Screen name="Ana Sayfa" component={HomeScreen} options={{ tabBarIcon: () => <Text style={{fontSize: 20}}>🏠</Text> }} />
          <Tab.Screen name="Ayna" component={AvatarScreen} options={{ tabBarIcon: () => <Text style={{fontSize: 20}}>🎙️</Text> }} />
          <Tab.Screen name="Projeler" component={ProjectsScreen} options={{ tabBarIcon: () => <Text style={{fontSize: 20}}>📁</Text> }} />
          <Tab.Screen name="Ayarlar" component={SettingsScreen} options={{ tabBarIcon: () => <Text style={{fontSize: 20}}>⚙️</Text> }} />
        </Tab.Navigator>
      </NavigationContainer>
      
      {/* 
        Geliştirme Önerisi FAB Bileşeni:
        NavigationContainer'ın dışında yer aldığı için
        TÜM sayfalarda (Ana Sayfa, Projeler, Ayarlar) drop-in olarak görünür!
      */}
      <ProposalFAB />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
});
