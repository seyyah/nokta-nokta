import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { ActivityLevel, DailyLog, useApp } from '../context/AppContext';
import { aiSimulationService } from '../services/aiSimulationService';
import { colors } from '../theme/colors';

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const SIZE = 180;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * RADIUS;

function FitGauge({ score }: { score: number }) {
  const dash = (Math.max(0, Math.min(score, 100)) / 100) * C;
  return (
    <View style={styles.gaugeWrap}>
      <Svg width={SIZE} height={SIZE}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} stroke={colors.surfaceAlt} strokeWidth={STROKE} fill="none" />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={score < 50 ? colors.accent : colors.success}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${dash} ${C}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      <View style={styles.gaugeCenter}>
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.scoreLabel}>FitScore</Text>
      </View>
    </View>
  );
}

export default function DailyEntryScreen() {
  const { profile, logs, addLog } = useApp();
  const [mealsText, setMealsText] = useState('');
  const [waterLiters, setWaterLiters] = useState('2');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('medium');
  const latest = logs[0];

  const liveResult = useMemo(() => {
    const water = Number(waterLiters);
    if (!mealsText.trim() || Number.isNaN(water) || water <= 0) {
      return latest
        ? { fitScore: latest.fitScore, coachMessage: latest.coachMessage, mealPlan: latest.mealPlan }
        : { fitScore: 0, coachMessage: 'Yazdikca anlik skor burada guncellenir.', mealPlan: [] as DailyLog['mealPlan'] };
    }

    const result = aiSimulationService.calculateFitScore(profile, mealsText, water, activityLevel);
    return {
      fitScore: result.fitScore,
      coachMessage: result.coachMessage,
      mealPlan: result.fitScore < 50 ? aiSimulationService.getRecoveryMealPlan(profile.goal) : [],
    };
  }, [activityLevel, latest, mealsText, profile, waterLiters]);

  const onSave = async () => {
    if (mealsText.trim().length < 5) {
      Alert.alert('Eksik bilgi', 'Yemek bilgisini biraz daha detayli yaz.');
      return;
    }

    const water = Number(waterLiters);
    if (Number.isNaN(water) || water <= 0) {
      Alert.alert('Eksik bilgi', 'Su miktari gecerli bir sayi olmali.');
      return;
    }

    const log: DailyLog = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      mealsText,
      waterLiters: water,
      activityLevel,
      fitScore: liveResult.fitScore,
      coachMessage: liveResult.coachMessage,
      mealPlan: liveResult.mealPlan,
    };

    await addLog(log);
    Alert.alert('Kaydedildi', `Bugunku FitScore: ${liveResult.fitScore}`);
    setMealsText('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Gunluk Giris</Text>
      <Text style={styles.subtitle}>Yemek + su + aktivite gir, anlik sonucunu gor.</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Yediklerin</Text>
        <TextInput
          value={mealsText}
          onChangeText={setMealsText}
          placeholder="Orn: sabah omlet, oglen salata, aksam corba"
          placeholderTextColor={colors.textSecondary}
          multiline
          style={[styles.input, styles.textArea]}
        />

        <Text style={styles.label}>Su (litre)</Text>
        <TextInput
          value={waterLiters}
          onChangeText={setWaterLiters}
          keyboardType="decimal-pad"
          placeholder="2.0"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
        />

        <Text style={styles.label}>Aktivite</Text>
        <View style={styles.row}>
          {(['low', 'medium', 'high'] as ActivityLevel[]).map((level) => {
            const selected = activityLevel === level;
            const label = level === 'low' ? 'Yuruyus' : level === 'medium' ? 'Kosu' : 'Kardiyo';
            return (
              <TouchableOpacity key={level} onPress={() => setActivityLevel(level)} style={[styles.pill, selected && styles.pillActive]}>
                <Text style={[styles.pillText, selected && styles.pillTextActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.scoreCard}>
        <FitGauge score={liveResult.fitScore} />
        <Text style={styles.liveMessage}>{liveResult.coachMessage}</Text>
      </View>

      {liveResult.fitScore < 50 && liveResult.mealPlan.length > 0 ? (
        <View style={styles.planBlock}>
          <Text style={styles.planTitle}>3 Gunluk Toparlanma Plani</Text>
          {liveResult.mealPlan.map((day, i) => (
            <View key={`${day.breakfast}-${i}`} style={styles.planCard}>
              <Text style={styles.day}>Gun {i + 1}</Text>
              <Text style={styles.item}>Sabah: {day.breakfast}</Text>
              <Text style={styles.item}>Ogle: {day.lunch}</Text>
              <Text style={styles.item}>Aksam: {day.dinner}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={() => void onSave()}>
        <Text style={styles.buttonText}>Bugunu Kaydet</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  content: { padding: 20, paddingBottom: 32 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginBottom: 16 },
  scoreCard: { backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 16, alignItems: 'center', marginBottom: 12 },
  gaugeWrap: { width: SIZE, height: SIZE, justifyContent: 'center', alignItems: 'center' },
  gaugeCenter: { position: 'absolute', alignItems: 'center' },
  score: { color: colors.text, fontSize: 40, fontWeight: '900' },
  scoreLabel: { color: colors.textSecondary, marginTop: 2 },
  liveMessage: { color: colors.text, fontSize: 15, lineHeight: 22, marginTop: 10, textAlign: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 16 },
  label: { color: colors.text, fontWeight: '700', marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: colors.surfaceAlt, borderColor: colors.border, borderWidth: 1, borderRadius: 14, color: colors.text, paddingHorizontal: 12, paddingVertical: 11 },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 10, marginTop: 4 },
  pill: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingVertical: 10, alignItems: 'center' },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { color: colors.textSecondary, fontWeight: '700' },
  pillTextActive: { color: colors.text },
  planBlock: { marginTop: 12 },
  planTitle: { color: colors.accent, fontSize: 16, fontWeight: '800', marginBottom: 8 },
  planCard: { backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 12, marginBottom: 8 },
  day: { color: colors.text, fontWeight: '800', marginBottom: 6 },
  item: { color: colors.textSecondary, lineHeight: 20 },
  button: { marginTop: 16, backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: colors.text, fontWeight: '800', fontSize: 16 },
});
