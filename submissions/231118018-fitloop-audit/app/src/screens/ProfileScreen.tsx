import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useApp } from '../context/AppContext';
import { aiSimulationService } from '../services/aiSimulationService';
import { colors } from '../theme/colors';

function goalText(goal: 'lose' | 'gain' | 'maintain') {
  if (goal === 'lose') return 'Kilo ver';
  if (goal === 'gain') return 'Kilo al';
  return 'Formda kal';
}

export default function ProfileScreen() {
  const { profile, logs } = useApp();
  const bmi = aiSimulationService.calculateBMI(profile);
  const latestActivity = logs[0]?.activityLevel ?? 'medium';
  const tdee = aiSimulationService.calculateTDEE(profile, latestActivity);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profil</Text>
      <Text style={styles.subtitle}>Hizli ozet: BMI, TDEE ve hedef.</Text>

      <View style={styles.card}>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.meta}>
          {profile.age} yas • {profile.gender === 'female' ? 'Kadin' : 'Erkek'}
        </Text>
        <Text style={styles.line}>Boy: {profile.heightCm} cm</Text>
        <Text style={styles.line}>Kilo: {profile.weightKg} kg</Text>
        <Text style={styles.line}>Hedef kilo: {profile.targetWeightKg} kg</Text>
        <Text style={styles.line}>Hedef: {goalText(profile.goal)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.metricTitle}>BMI</Text>
        <Text style={styles.metricValue}>{bmi}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.metricTitle}>Tahmini TDEE</Text>
        <Text style={styles.metricValue}>{tdee} kcal</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 30 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: colors.textSecondary, marginBottom: 14 },
  card: { backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12 },
  name: { color: colors.text, fontSize: 24, fontWeight: '800' },
  meta: { color: colors.textSecondary, marginBottom: 10, marginTop: 3 },
  line: { color: colors.text, marginTop: 6 },
  metricTitle: { color: colors.textSecondary, fontWeight: '700' },
  metricValue: { color: colors.success, fontSize: 34, fontWeight: '900', marginTop: 6 },
});
