import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0d0d0d', borderTopColor: '#222' },
        tabBarActiveTintColor: '#00ffcc',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Avatar' }}
      />
      <Tabs.Screen
        name="explore"
        options={{ title: 'Keşfet' }}
      />
    </Tabs>
  );
}
