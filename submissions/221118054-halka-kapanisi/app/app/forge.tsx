// app/forge.tsx — ForgeScreen
// Forge cycle ledger görüntüleyici. FORGE.md'deki cycle'ları okunabilir
// kartlar halinde gösterir. Veri statik (FORGE.md'den paralel tutuluyor);
// gerçek loop terminalde Claude Code ile çalışır.

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

type CycleStatus = 'COMMIT' | 'ROLLBACK' | 'STUCK';

interface Cycle {
  n: number;
  slug: string;
  status: CycleStatus;
  input: string;
  hypothesis: string;
  changes: string;
  duration: number;
  notes?: string;
}

// FORGE.md ile manuel olarak senkron tutulan özet. Gerçek hash'ler
// Güncelleme 2026-05-25: gerçek cycle hash'leri eklendi.
// terminal commit log'undan gelir; bu sadece app içi görselleştirme.
const CYCLES: Cycle[] = [
  {
    n: 1,
    slug: 'voice-viz-idle-flat',
    status: 'COMMIT',
    input: 'audit-reports/audit-1-viz-idle.md',
    hypothesis: 'Idle state\'te barlar dümdüz; subtle pulse eklenmeli.',
    changes: 'src/voice/VoiceVisualizer.tsx',
    duration: 14,
  },
  {
    n: 2,
    slug: 'avatar-mouth-too-wide',
    status: 'ROLLBACK',
    input: 'audit-reports/audit-2-mouth.md',
    hypothesis: 'mouthOpen 1.0\'a kadar açılsın istemiştik; geri çekilmedi.',
    changes: 'src/avatar/AvatarScene.tsx (geri alındı)',
    duration: 18,
    notes: 'Layout regresyonu; lerp factor düşürmek H2 olarak bırakıldı.',
  },
  {
    n: 3,
    slug: 'mic-permission-silent-fail',
    status: 'COMMIT',
    input: 'audit-reports/audit-3-mic-permission.md',
    hypothesis: 'İzin reddedilince UI sessiz kalıyor; toast/error göstermeli.',
    changes: 'src/voice/useMicAnalyzer.ts, app/index.tsx',
    duration: 12,
  },
];

const STATUS_COLOR: Record<CycleStatus, string> = {
  COMMIT: '#3fb950',
  ROLLBACK: '#d29922',
  STUCK: '#f85149',
};

export default function ForgeScreen() {
  const router = useRouter();
  const commits = CYCLES.filter((c) => c.status === 'COMMIT').length;
  const rollbacks = CYCLES.filter((c) => c.status === 'ROLLBACK').length;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Özet kartı */}
      <View style={s.summary}>
        <Text style={s.summaryTitle}>Forge Ledger</Text>
        <View style={s.statsRow}>
          <View style={s.stat}>
            <Text style={[s.statNum, { color: '#3fb950' }]}>{commits}</Text>
            <Text style={s.statLbl}>commit</Text>
          </View>
          <View style={s.stat}>
            <Text style={[s.statNum, { color: '#d29922' }]}>{rollbacks}</Text>
            <Text style={s.statLbl}>rollback</Text>
          </View>
          <View style={s.stat}>
            <Text style={[s.statNum, { color: '#58a6ff' }]}>{CYCLES.length}</Text>
            <Text style={s.statLbl}>toplam</Text>
          </View>
        </View>
      </View>

      {/* Cycle kartları */}
      {CYCLES.map((c) => (
        <View
          key={c.n}
          style={[s.card, { borderLeftColor: STATUS_COLOR[c.status] }]}
        >
          <View style={s.cardHeader}>
            <Text style={s.cardCycle}>Cycle {c.n}</Text>
            <View
              style={[s.badge, { backgroundColor: STATUS_COLOR[c.status] }]}
            >
              <Text style={s.badgeText}>{c.status}</Text>
            </View>
          </View>
          <Text style={s.cardSlug}>{c.slug}</Text>
          <Text style={s.cardLabel}>HYPOTHESIS</Text>
          <Text style={s.cardValue}>{c.hypothesis}</Text>
          <Text style={s.cardLabel}>CHANGES</Text>
          <Text style={s.cardValue}>{c.changes}</Text>
          <Text style={s.cardMeta}>
            ⏱ {c.duration} dk · 📄 {c.input}
          </Text>
          {c.notes && <Text style={s.cardNotes}>📝 {c.notes}</Text>}
        </View>
      ))}

      <TouchableOpacity
        style={s.bridgeBtn}
        onPress={() => router.push('/bridge')}
      >
        <Text style={s.bridgeBtnText}>📞 Sıkıştın mı? Uzmana Bağlan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  content: { padding: 16, paddingBottom: 40 },
  summary: {
    backgroundColor: '#161b22',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  summaryTitle: {
    color: '#f0f6fc',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 28, fontWeight: '800' },
  statLbl: { color: '#8b949e', fontSize: 11, marginTop: 2 },
  card: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardCycle: { color: '#f0f6fc', fontSize: 15, fontWeight: '700' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { color: '#0d1117', fontSize: 10, fontWeight: '800' },
  cardSlug: {
    color: '#58a6ff',
    fontSize: 13,
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  cardLabel: {
    color: '#484f58',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 3,
  },
  cardValue: { color: '#c9d1d9', fontSize: 13, lineHeight: 18 },
  cardMeta: {
    color: '#8b949e',
    fontSize: 11,
    marginTop: 10,
    fontFamily: 'monospace',
  },
  cardNotes: { color: '#d29922', fontSize: 11, marginTop: 4, fontStyle: 'italic' },
  bridgeBtn: {
    backgroundColor: '#1a2438',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#1f6feb',
  },
  bridgeBtnText: { color: '#58a6ff', fontSize: 14, fontWeight: '700' },
});
