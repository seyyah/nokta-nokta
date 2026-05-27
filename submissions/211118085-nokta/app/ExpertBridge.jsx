/**
 * ExpertBridge.jsx
 * Forge döngüsünde 2x FAIL/ROLLBACK → "Uzmana Bağlan" butonu → Jitsi görüntülü çağrı
 *
 * Kurulum:
 *   npx expo install react-native-webview
 *   (react-native-webview zaten AvatarWebView için kurulu olacak)
 *
 * Jitsi Meet: ücretsiz, API key gerektirmez, ekran paylaşımı destekler.
 * Oda adı: nokta-<reporterId> formatında otomatik üretilir.
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Share,
  Animated,
  Easing,
} from 'react-native';
import { WebView } from 'react-native-webview';

// Jitsi Meet konfigürasyonu
const JITSI_DOMAIN = 'meet.jit.si';

/**
 * Oda adı üret: öğrenci no + rastgele suffix (her oturum farklı)
 */
const makeRoomName = (reporterId) => {
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `nokta-${reporterId}-${suffix}`;
};

/**
 * Jitsi Meet iframe URL'i — config parametreleri ile özelleştirilmiş
 */
const buildJitsiUrl = (roomName, displayName) => {
  const params = new URLSearchParams({
    // Jitsi config
    config: JSON.stringify({
      startWithAudioMuted: false,
      startWithVideoMuted: false,
      enableScreensharing: true,          // ekran paylaşımı zorunlu
      disableDeepLinking: true,
      prejoinPageEnabled: false,          // direkt bağlan
      toolbarButtons: [
        'microphone', 'camera', 'desktop', // desktop = screen share
        'hangup', 'chat', 'raisehand',
      ],
      subject: 'Nokta — Uzman Çağrısı',
    }),
    userInfo: JSON.stringify({ displayName }),
  });

  return `https://${JITSI_DOMAIN}/${roomName}`;
};

/**
 * Props:
 *   failCount: number       — mevcut cycle'daki FAIL/ROLLBACK sayısı
 *   reporterId: string      — öğrenci numarası (oda adı için)
 *   onBridgeStart: () => void
 *   onBridgeEnd: (summary: string) => void  — BRIDGE.md'ye yazılacak özet
 *   style
 */
export default function ExpertBridge({
  failCount = 0,
  reporterId = '000000000',
  onBridgeStart,
  onBridgeEnd,
  style,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [roomName] = useState(() => makeRoomName(reporterId));
  const [jitsiLoading, setJitsiLoading] = useState(true);
  const [callStartTime, setCallStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // STUCK tetiklendi mi?
  const isStuck = failCount >= 2;

  // Buton pulse animasyonu (dikkat çekmek için)
  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  React.useEffect(() => {
    if (isStuck) startPulse();
    else pulseAnim.stopAnimation();
  }, [isStuck]);

  const openBridge = () => {
    setModalVisible(true);
    setJitsiLoading(true);
    const now = Date.now();
    setCallStartTime(now);
    setElapsed(0);
    onBridgeStart?.();

    // Geçen süreyi say
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - now) / 1000));
    }, 1000);
  };

  const closeBridge = () => {
    clearInterval(timerRef.current);
    setModalVisible(false);

    const durationSec = elapsed;
    const summary = buildBridgeSummary(roomName, durationSec, failCount);
    onBridgeEnd?.(summary);
  };

  const shareRoom = async () => {
    try {
      await Share.share({
        message: `Nokta Uzman Çağrısı\nOda: ${roomName}\nLink: https://${JITSI_DOMAIN}/${roomName}`,
        title: 'Uzman Çağrısına Katıl',
      });
    } catch (_) {}
  };

  const formatElapsed = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <View style={[styles.container, style]}>
      {/* STUCK uyarısı */}
      {isStuck && (
        <View style={styles.stuckBanner}>
          <Text style={styles.stuckIcon}>⚠️</Text>
          <Text style={styles.stuckText}>
            Cycle {failCount}x FAIL — Uzman desteği önerilir
          </Text>
        </View>
      )}

      {/* Bağlan butonu */}
      <Animated.View style={{ transform: [{ scale: isStuck ? pulseAnim : 1 }] }}>
        <TouchableOpacity
          style={[styles.bridgeButton, isStuck && styles.bridgeButtonUrgent]}
          onPress={openBridge}
          activeOpacity={0.85}
        >
          <Text style={styles.bridgeIcon}>📞</Text>
          <View>
            <Text style={styles.bridgeTitle}>Uzmana Bağlan</Text>
            <Text style={styles.bridgeDesc}>
              {isStuck ? 'Jitsi görüntülü görüşme aç' : 'İsteğe bağlı uzman desteği'}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Jitsi Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={closeBridge}
        statusBarTranslucent
      >
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>📞 Uzman Görüşmesi</Text>
              <Text style={styles.modalSubtitle}>
                Oda: {roomName}  ·  {formatElapsed(elapsed)}
              </Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.shareBtn} onPress={shareRoom}>
                <Text style={styles.shareBtnText}>Paylaş</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.endBtn} onPress={closeBridge}>
                <Text style={styles.endBtnText}>Bitir</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Jitsi WebView */}
          <View style={styles.webviewContainer}>
            {jitsiLoading && (
              <View style={styles.jitsiLoading}>
                <ActivityIndicator color="#e8ff00" size="large" />
                <Text style={styles.jitsiLoadingText}>Jitsi bağlanıyor...</Text>
              </View>
            )}
            <WebView
              source={{ uri: buildJitsiUrl(roomName, `Nokta-${reporterId}`) }}
              style={styles.webview}
              onLoad={() => setJitsiLoading(false)}
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback
              javaScriptEnabled
              domStorageEnabled
              // Kamera & mikrofon izinleri
              mediaCapturePermissionGrantType="grantIfSameHostElseDeny"
              onPermissionRequest={(e) => e.nativeEvent.request.grant(e.nativeEvent.request.resources)}
            />
          </View>

          {/* 60sn hedef göstergesi */}
          {elapsed < 60 && (
            <View style={styles.targetBar}>
              <View style={[styles.targetFill, { width: `${Math.min((elapsed / 60) * 100, 100)}%` }]} />
              <Text style={styles.targetText}>
                Hedef: 60sn demo  ·  {Math.max(60 - elapsed, 0)}sn kaldı
              </Text>
            </View>
          )}
          {elapsed >= 60 && (
            <View style={styles.targetComplete}>
              <Text style={styles.targetCompleteText}>✅ Demo hedefi tamamlandı</Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

/**
 * BRIDGE.md için özet metni oluştur
 */
function buildBridgeSummary(roomName, durationSec, failCount) {
  const now = new Date().toISOString();
  return `## Uzman Görüşmesi — ${now.slice(0, 10)}

- **Oda:** ${roomName}
- **Süre:** ${Math.floor(durationSec / 60)}dk ${durationSec % 60}sn
- **Tetikleyici:** ${failCount}x FAIL/ROLLBACK
- **Tarih:** ${now}

### Görüşme Özeti
> [Buraya görüşme notlarını ekle]

### Kararlar
- [ ] Uzmanın önerisi 1
- [ ] Uzmanın önerisi 2

### Sonraki Cycle'a Taşınan Context
> [Bir sonraki forge cycle'ında kullanılacak bilgiler]
`;
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  stuckBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2a1500',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  stuckIcon: { fontSize: 16 },
  stuckText: { color: '#f59e0b', fontSize: 13, fontWeight: '600', flex: 1 },
  bridgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  bridgeButtonUrgent: {
    borderColor: '#f59e0b',
    backgroundColor: '#1a1200',
  },
  bridgeIcon: { fontSize: 28 },
  bridgeTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 2 },
  bridgeDesc: { color: '#666', fontSize: 13 },
  modal: { flex: 1, backgroundColor: '#0a0a0a' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 52,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
  },
  modalTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  modalSubtitle: { color: '#666', fontSize: 12, marginTop: 2 },
  headerButtons: { flexDirection: 'row', gap: 8 },
  shareBtn: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  shareBtnText: { color: '#e8ff00', fontSize: 13, fontWeight: '600' },
  endBtn: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  endBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  webviewContainer: { flex: 1 },
  webview: { flex: 1 },
  jitsiLoading: {
    position: 'absolute',
    inset: 0,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0a',
    gap: 12,
  },
  jitsiLoadingText: { color: '#666', fontSize: 14 },
  targetBar: {
    height: 36,
    backgroundColor: '#111',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  targetFill: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0,
    backgroundColor: '#1a2a00',
  },
  targetText: { color: '#888', fontSize: 12, textAlign: 'center', zIndex: 1 },
  targetComplete: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a1a00',
  },
  targetCompleteText: { color: '#22c55e', fontSize: 13, fontWeight: '700' },
});
