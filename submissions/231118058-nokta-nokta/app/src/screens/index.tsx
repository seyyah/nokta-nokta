import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

const PlaceholderScreen = ({ name }: { name: string }) => (
    <View style={styles.container}>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.subtitle}>Bu ekran yakında burada olacak.</Text>
    </View>
);

import DashboardScreen from './DashboardScreen';
import OnboardingScreen from './OnboardingScreen';
import JournalScreen from './JournalScreen';
import EducationScreen from './EducationScreen';
import ProfileScreen from './ProfileScreen';
import NutritionScreen from './NutritionScreen';
import ForumScreen from './ForumScreen';
import AdminScreen from './AdminScreen';
import VisionScreen from './VisionScreen';
import LoginScreen from './LoginScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';

export {
    DashboardScreen,
    OnboardingScreen,
    JournalScreen,
    EducationScreen,
    ProfileScreen,
    NutritionScreen,
    ForumScreen,
    AdminScreen,
    VisionScreen,
    LoginScreen,
    ForgotPasswordScreen,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        padding: theme.spacing.lg,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.primary,
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textLight,
        textAlign: 'center',
    },
});
