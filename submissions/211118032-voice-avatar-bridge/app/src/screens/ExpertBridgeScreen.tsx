import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import {
  Colors,
  FontSize,
  FontWeight,
  Radius,
  Spacing,
} from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ExpertBridge'>;

/**
 * Jitsi Meet WebView köprüsü.
 * - Anahtar yok, hesap yok — public meet.jit.si üzerinden oda açıyoruz.
 * - Video + audio + ekran paylaşımı üçü birden destekleniyor (Phase C ACCEPTANCE).
 * - Oda adı submission-id'ye bağlanıyor: nokta-211118032-<random> → çakışma riski yok.
 *
 * Tasarım kararı (DECISIONS.md): Daily/LiveKit yerine Jitsi.
 *   Sebep: API key gerektirmemesi, public room desteği, EAS preview build'de
 *   ekstra konfig olmadan çalışması.
 */
export default function ExpertBridgeScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const trigger = route.params?.trigger ?? 'manual';
  const stuckCycleId = route.params?.stuckCycleId;
  const [joined, setJoined] = useState(false);

  // Stable, anonymous room name. roomName fallback'i route'tan da gelebilir.
  const roomName = useMemo(() => {
    if (route.params?.roomName) return route.params.roomName;
    const rand = Math.random().toString(36).slice(2, 8);
    return `nokta-211118032-${rand}`;
  }, [route.params?.roomName]);

  const meetUrl = `https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&config.disableDeepLinking=true`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Nokta uzmanlık köprüsü — odamıza katıl:\nhttps://meet.jit.si/${roomName}\n\n(Demo için ekran paylaşımı + video + ses üçü birden açılmalı.)`,
      });
    } catch {
      // user dismissed
    }
  };

  const handleLeave = () => {
    setJoined(false);
    navigation.goBack();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLeave} accessibilityRole="button">
          <Text style={styles.headerClose}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Uzman Köprüsü</Text>
          <Text style={styles.headerSub}>
            {trigger === 'auto' ? '🤖 STUCK auto-tetik' : '👋 manuel çağrı'}
            {stuckCycleId ? ` · ${stuckCycleId}` : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={handleShare} accessibilityRole="button">
          <Text style={styles.headerAction}>↗ Paylaş</Text>
        </TouchableOpacity>
      </View>

      {!joined && (
        <View style={styles.lobby}>
          <Text style={styles.lobbyTitle}>Oda: {roomName}</Text>
          <Text style={styles.lobbyBody}>
            Sınıf arkadaşına aşağıdaki linki gönder; o tarayıcıdan, sen mobilden
            katıl. **Demo gereği:** Video + audio + ekran paylaşımı üçü birden
            ≥60sn açık olmalı.
          </Text>
          <View style={styles.linkBox}>
            <Text style={styles.linkText}>
              https://meet.jit.si/{roomName}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.joinBtn}
            onPress={() => setJoined(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.joinText}>🎥 Görüşmeye Katıl</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareBtn}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Text style={styles.shareText}>Linki Paylaş</Text>
          </TouchableOpacity>

          <View style={styles.hint}>
            <Text style={styles.hintTitle}>Phase C kontrol</Text>
            <Text style={styles.hintItem}>• 📹 video açık</Text>
            <Text style={styles.hintItem}>• 🎤 audio açık</Text>
            <Text style={styles.hintItem}>• 🖥️ ekran paylaşımı açık</Text>
            <Text style={styles.hintItem}>• ⏱️ ≥ 60sn</Text>
          </View>
        </View>
      )}

      {joined && (
        <WebView
          source={{ uri: meetUrl }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo
          originWhitelist={['*']}
          mixedContentMode="always"
          androidLayerType="hardware"
          // iOS: getUserMedia için
          mediaCapturePermissionGrantType="grant"
          onShouldStartLoadWithRequest={() => true}
        />
      )}

      {joined && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
          <TouchableOpacity style={styles.leaveBtn} onPress={handleLeave}>
            <Text style={styles.leaveText}>📴 Görüşmeden Çık</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerClose: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: FontWeight.bold,
    width: 32,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  headerSub: {
    color: '#cbd5e1',
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  headerAction: {
    color: '#60a5fa',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    width: 64,
    textAlign: 'right',
  },
  lobby: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  lobbyTitle: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  lobbyBody: {
    color: '#cbd5e1',
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  linkBox: {
    backgroundColor: '#1e293b',
    borderRadius: Radius.md,
    padding: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: '#334155',
  },
  linkText: {
    color: '#60a5fa',
    fontSize: FontSize.sm,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlign: 'center',
  },
  joinBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.xl,
    alignItems: 'center',
    marginTop: Spacing.sm,
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
  },
  joinText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  shareBtn: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  shareText: {
    color: '#60a5fa',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  hint: {
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderColor: 'rgba(16,185,129,0.3)',
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.sm + 2,
    marginTop: Spacing.md,
    gap: 3,
  },
  hintTitle: {
    color: '#86efac',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    marginBottom: 4,
  },
  hintItem: {
    color: '#bbf7d0',
    fontSize: FontSize.xs,
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  footer: {
    padding: Spacing.sm,
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  leaveBtn: {
    backgroundColor: '#dc2626',
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  leaveText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});
