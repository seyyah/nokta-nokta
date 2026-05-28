import { Tabs } from "expo-router";
import { Hammer, PhoneCall, Sparkles } from "lucide-react-native";
import React from "react";
import Colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textDim,
        tabBarStyle: {
          backgroundColor: Colors.bg,
          borderTopColor: Colors.border,
          borderTopWidth: 0.5,
        },
        headerStyle: { backgroundColor: Colors.bg },
        headerTitleStyle: { color: Colors.text, fontWeight: "600" },
        headerShadowVisible: false,
        tabBarLabelStyle: { fontSize: 11, letterSpacing: 1, textTransform: "uppercase" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ayna",
          tabBarIcon: ({ color }) => <Sparkles color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="forge"
        options={{
          title: "Forge",
          tabBarIcon: ({ color }) => <Hammer color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="bridge"
        options={{
          title: "Köprü",
          tabBarIcon: ({ color }) => <PhoneCall color={color} size={20} />,
        }}
      />
    </Tabs>
  );
}
