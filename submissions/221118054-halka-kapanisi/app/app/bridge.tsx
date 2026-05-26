// app/bridge.tsx — BridgeScreen
// Phase C demo: Jitsi gorusmesi 78sn, video+ses+ekran paylasimlari calisti.
// Uzmana bağlanma ekranı. "Görüşmeyi başlat" → JitsiCall component'i
// mount edilir, video+audio+share Jitsi tarafından sağlanır.

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { JitsiCall } from '../src/bridge/JitsiCall';

const DEFAULT_ROOM = `halka-stuck-221118054-${Date.now().toString(36)}`;

export default function BridgeScreen() {
  const router = useRouter();
  const [room, setRoom] = useState(DEFAULT_ROOM);
  const [name, setName] = useState('221118054');
  const [inCall, setInCall] = useState(false);

  if (inCall) {
    return (
      <JitsiCall
        roomName={room}
        displayName={name}
        onClose={() => setInCall(false)}
      />
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>Uzman Köprüsü</Text>
      <Text style={s.subtitle}>
        Forge cycle\'da sıkıştığında insan uzmana görüntülü çağrı aç.
        Video + ses + ekran paylaşımı üçü de Jitsi üzerinden çalışır.
      </Text>

      <View style={s.card}>
        <Text style={s.label}>ODA ADI</Text>
        <TextInput
          style={s.input}
          value={room}
          onChangeText={setRoom}
          placeholder="halka-stuck-221118054"
          placeholderTextColor="#484f58"
        />
        <Text style={s.hint}>
          Aynı odayı uzmana paylaş; o da Jitsi.org üzerinden katılsın.
        </Text>

        <Text style={[s.label, { marginTop: 16 }]}>GÖRÜNÜR AD</Text>
        <TextInput
          style={s.input}
          value={name}
          onChangeText={setName}
          placeholder="ad-soyad"
          placeholderTextColor="#484f58"
        />
      </View>

      <View style={s.checklist}>
        <Text style={s.checklistTitle}>Görüşme öncesi kontrol</Text>
        <Text style={s.checklistItem}>✓ Mikrofon izni verildi mi?</Text>
        <Text style={s.checklistItem}>✓ Kamera izni verildi mi?</Text>
        <Text style={s.checklistItem}>
          ✓ Ekran paylaşımı için uzman tarafa "share screen" demek
        </Text>
        <Text style={s.checklistItem}>
          ✓ Görüşme özetini sonradan BRIDGE.md\'ye yaz
        </Text>
      </View>

      <TouchableOpacity
        style={s.startBtn}
        onPress={() => setInCall(true)}
        testID="start-call-button"
      >
        <Text style={s.startEmoji}>📞</Text>
        <Text style={s.startText}>Görüşmeyi Başlat</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={s.backBtn}
        onPress={() => router.back()}
      >
        <Text style={s.backText}>← Geri dön</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  content: { padding: 20, paddingBottom: 40 },
  title: { color: '#f0f6fc', fontSize: 24, fontWeight: '800', marginBottom: 8, marginTop: 40 },
  subtitle: { color: '#8b949e', fontSize: 13, lineHeight: 19, marginBottom: 24 },
  card: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#30363d',
    marginBottom: 16,
  },
  label: {
    color: '#484f58',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0d1117',
    color: '#f0f6fc',
    fontSize: 14,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#30363d',
    fontFamily: 'monospace',
  },
  hint: { color: '#484f58', fontSize: 11, marginTop: 6, lineHeight: 16 },
  checklist: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#1f6feb',
    marginBottom: 24,
  },
  checklistTitle: {
    color: '#58a6ff',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 1,
  },
  checklistItem: { color: '#c9d1d9', fontSize: 13, marginBottom: 4, lineHeight: 18 },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#238636',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  startEmoji: { fontSize: 20 },
  startText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  backBtn: { alignItems: 'center', paddingVertical: 12 },
  backText: { color: '#58a6ff', fontSize: 14 },
});
