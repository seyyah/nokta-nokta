import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const STUDENT_ID = '231118098';
const ROOM_PREFIX = 'nokta-tohum';

function makeRoomName(): string {
  const slot = Math.floor(Date.now() / 60_000);
  return `${ROOM_PREFIX}-${STUDENT_ID}-${slot}`;
}

export default function BridgeScreen() {
  const [roomName, setRoomName] = useState(makeRoomName);
  const [callOpened, setCallOpened] = useState(false);

  const url = `https://meet.jit.si/${roomName}`;

  const onConnect = async () => {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert('Jitsi açılamadı', 'Bağlantı desteklenmiyor: ' + url);
      return;
    }
    await Linking.openURL(url);
    setCallOpened(true);
  };

  const onShareLink = async () => {
    try {
      await Share.share({
        message: `NOKTA bridge görüşmesi: ${url}`,
        url,
      });
    } catch {
      // share cancelled
    }
  };

  const onNewRoom = () => {
    setRoomName(makeRoomName());
    setCallOpened(false);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Köprü</Text>
        <Text style={styles.subtitle}>Sıkıştığında uzmana bağlan</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Jitsi odası</Text>
        <Text style={styles.roomName}>{roomName}</Text>
        <Text style={styles.urlText} numberOfLines={1}>{url}</Text>
      </View>

      <Pressable
        onPress={onConnect}
        style={({ pressed }) => [styles.button, styles.connectButton, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>📞  Uzmana Bağlan</Text>
      </Pressable>

      <Pressable
        onPress={onShareLink}
        style={({ pressed }) => [styles.button, styles.secondaryButton, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>🔗  Linki Paylaş (arkadaşa gönder)</Text>
      </Pressable>

      {callOpened && (
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>✓ Görüşme açıldı</Text>
          <Text style={styles.successBody}>
            Jitsi uygulamasında/tarayıcıda devam et. Kamera + mikrofon + ekran
            paylaşımı izinlerini ver. Demo için ≥60 sn ekran paylaşımlı görüşme
            yap, sonra BRIDGE.md'ye özet düşeceğiz.
          </Text>
        </View>
      )}

      <Pressable
        onPress={onNewRoom}
        style={({ pressed }) => [styles.button, styles.tertiaryButton, pressed && styles.pressed]}
      >
        <Text style={styles.tertiaryText}>↻  Yeni oda kodu üret</Text>
      </Pressable>

      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Akış</Text>
        {[
          '1. "Uzmana Bağlan" butonu — Jitsi penceresi açılır',
          '2. "Linki Paylaş" ile sınıf arkadaşına aynı odayı gönder',
          '3. Kamera + mikrofon + ekran paylaşımı izinleri verilir',
          '4. ≥60 sn ekran paylaşımlı görüşme yapılır',
          '5. Görüşme özeti BRIDGE.md\'ye yazılır',
        ].map((line, i) => (
          <Text key={i} style={styles.instructionsItem}>{line}</Text>
        ))}
      </View>

      <Text style={styles.footnote}>
        Track A çizgisi: manuel buton. Track C ister STUCK heuristik + agent
        auto-trigger (bizde yok).
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 16,
    gap: 14,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  cardLabel: {
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  roomName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    fontFamily: 'monospace',
  },
  urlText: {
    fontSize: 12,
    color: '#3B82F6',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: '#22c55e',
  },
  secondaryButton: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  tertiaryButton: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  tertiaryText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  successCard: {
    backgroundColor: '#064e3b',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#22c55e',
    gap: 6,
  },
  successTitle: {
    color: '#bbf7d0',
    fontSize: 14,
    fontWeight: '600',
  },
  successBody: {
    color: '#a7f3d0',
    fontSize: 13,
    lineHeight: 18,
  },
  instructions: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 14,
    gap: 8,
    marginTop: 4,
  },
  instructionsTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  instructionsItem: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
  },
  footnote: {
    color: '#475569',
    fontSize: 11,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
