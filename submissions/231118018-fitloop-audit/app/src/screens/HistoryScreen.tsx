import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

function format(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function HistoryScreen() {
  const { logs } = useApp();
  const recent = logs.slice(0, 7).reverse();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Gecmis</Text>
      <Text style={styles.subtitle}>Son 7 girisin FitScore gorunumu.</Text>

      <View style={styles.card}>
        {recent.length === 0 ? (
          <Text style={styles.empty}>Gecmis yok. Gunluk sekmesinden ilk girisini yap.</Text>
        ) : (
          <View style={styles.chart}>
            {recent.map((item) => (
              <View key={item.id} style={styles.col}>
                <Text style={styles.value}>{item.fitScore}</Text>
                <View style={styles.track}>
                  <View style={[styles.fill, { height: Math.max((item.fitScore / 100) * 160, 12) }]} />
                </View>
                <Text style={styles.date}>{format(item.createdAt)}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 30 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: colors.textSecondary, marginBottom: 14 },
  card: { backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 16, minHeight: 230 },
  empty: { color: colors.textSecondary, marginTop: 60, textAlign: 'center' },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10, height: 210 },
  col: { flex: 1, alignItems: 'center', height: '100%' },
  value: { color: colors.textSecondary, fontSize: 12, marginBottom: 8 },
  track: { flex: 1, width: '100%', borderRadius: 10, backgroundColor: colors.surfaceAlt, justifyContent: 'flex-end', overflow: 'hidden' },
  fill: { width: '100%', backgroundColor: colors.primary, borderRadius: 10 },
  date: { color: colors.text, fontSize: 11, marginTop: 8 },
});
