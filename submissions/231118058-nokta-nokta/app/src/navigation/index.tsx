import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, ClipboardList, BookOpen, User, ShieldCheck, Mic } from 'lucide-react-native';
import { theme } from '../theme';
import {
    DashboardScreen,
    JournalScreen,
    EducationScreen,
    ProfileScreen,
    AdminScreen,
    VisionScreen,
    OnboardingScreen,
    LoginScreen,
    ForgotPasswordScreen,
} from '../screens';
import AvatarVoiceScreen from '../screens/AvatarVoiceScreen';
import ExpertCallScreen from '../screens/ExpertCallScreen';

// Navigation Type Definitions
export type RootStackParamList = {
    Onboarding: undefined;
    AppTabs: undefined;
    Login: undefined;
    Vision: undefined;
    ExpertCall: undefined;
    ForgotPassword: undefined;
};

export type TabParamList = {
    Dashboard: undefined;
    Journal: undefined;
    Education: undefined;
    Profile: undefined;
    Admin: undefined;
    AvatarVoice: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TabNavigator = () => {
    return (
        <Tab.Navigator
            id="MainTabs"
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textLight,
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.border,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarLabel: 'Ana Sayfa',
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Journal"
                component={JournalScreen}
                options={{
                    tabBarLabel: 'Günlük',
                    tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Education"
                component={EducationScreen}
                options={{
                    tabBarLabel: 'Bilgi',
                    tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profil',
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Admin"
                component={AdminScreen}
                options={{
                    tabBarLabel: 'Yönetici',
                    tabBarIcon: ({ color, size }) => <ShieldCheck color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="AvatarVoice"
                component={AvatarVoiceScreen}
                options={{
                    tabBarLabel: 'Avatar',
                    tabBarIcon: ({ color, size }) => <Mic color={color} size={size} />,
                }}
            />
        </Tab.Navigator>
    );
};

export const MainNavigator = () => {
    return (
        <Stack.Navigator 
            id="MainStack"
            screenOptions={{ headerShown: false }} 
            initialRouteName="Login"
        >
            <Stack.Screen name="Login" component={LoginScreen as any} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="AppTabs" component={TabNavigator as any} />
            <Stack.Screen name="Vision" component={VisionScreen} />
            <Stack.Screen name="ExpertCall" component={ExpertCallScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </Stack.Navigator>
    );
};
