import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const STEPS = [
  {
    emoji: '💡',
    title: 'Fikri yakala',
    desc: 'Aklına gelen her fikri anında düş. Uzun açıklamaya gerek yok — bir başlık yeter.',
  },
  {
    emoji: '🗳️',
    title: 'Topluluğun gücü',
    desc: 'Diğer fikirleri destekle. En çok desteklenen fikirler ürüne dönüşür.',
  },
  {
    emoji: '🔧',
    title: 'Gerçeğe dönüşür',
    desc: 'Yüksek oylanan fikirler geliştirici ekibine gider. Sen de geliştiriciyle doğrudan konuşabilirsin.',
  },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />

      <View style={styles.dots}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.emoji}>{current.emoji}</Text>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.desc}>{current.desc}</Text>
      </View>

      <View style={styles.actions}>
        {!isLast ? (
          <>
            <TouchableOpacity style={styles.skip} onPress={() => router.replace('/')}>
              <Text style={styles.skipText}>Atla</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.next} onPress={() => setStep(step + 1)}>
              <Text style={styles.nextText}>İleri →</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.start} onPress={() => router.replace('/')}>
            <Text style={styles.startText}>Başlayalım!</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f0f0f', alignItems: 'center', justifyContent: 'center', padding: 24 },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 48 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#333' },
  dotActive: { backgroundColor: '#c8a96e', width: 24 },
  card: {
    width: width - 48, backgroundColor: '#161616', borderRadius: 20,
    padding: 32, alignItems: 'center', borderWidth: 1, borderColor: '#222',
    marginBottom: 48,
  },
  emoji: { fontSize: 64, marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#f5f0e8', marginBottom: 12, textAlign: 'center' },
  desc: { fontSize: 15, color: '#888', lineHeight: 22, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 12, width: '100%' },
  skip: { flex: 1, padding: 16, alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 12, borderWidth: 1, borderColor: '#2a2a2a' },
  skipText: { color: '#666', fontWeight: '600', fontSize: 15 },
  next: { flex: 2, padding: 16, alignItems: 'center', backgroundColor: '#c8a96e', borderRadius: 12 },
  nextText: { color: '#0f0f0f', fontWeight: '800', fontSize: 15 },
  start: { flex: 1, padding: 16, alignItems: 'center', backgroundColor: '#c8a96e', borderRadius: 12 },
  startText: { color: '#0f0f0f', fontWeight: '800', fontSize: 15 },
});
