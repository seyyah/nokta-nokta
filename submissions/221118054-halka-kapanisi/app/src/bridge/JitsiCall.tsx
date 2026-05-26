// src/bridge/JitsiCall.tsx
// HITL (Human-in-the-Loop) köprüsü.
// Jitsi Meet'i WebView içine gömerek ücretsiz, anahtarsız bir
// görüntülü çağrı odası açar. Video + audio + ekran paylaşımı üçü de
// Jitsi tarafından sağlanır — host app sadece WebView'i render eder.
//
// Oda adı: forge cycle id'sinden türetilir (her stuck için benzersiz).
//
// Track A için bu yeterli. Track C "agent-triggered call" istiyorsa
// otomasyon eklenir; biz Track A koşuyoruz.

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';

interface Props {
  roomName: string;       // örn: "halka-stuck-cycle3-221118054"
  displayName: string;    // çağrı katılımcısı görünür adı
  onClose: () => void;
}

export function JitsiCall({ roomName, displayName, onClose }: Props) {
  const webRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);

  // Jitsi public sunucusu — anahtar/hesap gerektirmez.
  // userInfo: katılımcı adı; config.startWithAudioMuted=false → ses açık;
  // config.prejoinConfig.enabled=false → karşılama ekranını atla.
  const jitsiUrl =
    `https://meet.jit.si/${encodeURIComponent(roomName)}` +
    `#userInfo.displayName=%22${encodeURIComponent(displayName)}%22` +
    `&config.startWithAudioMuted=false` +
    `&config.startWithVideoMuted=false` +
    `&config.prejoinConfig.enabled=false`;

  return (
    <View style={styles.container} testID="jitsi-call">
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>📞 Uzmanla Görüşme</Text>
          <Text style={styles.room}>Oda: {roomName}</Text>
        </View>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => {
            Alert.alert('Görüşmeyi kapat', 'Çağrıdan çıkmak istediğinize emin misiniz?', [
              { text: 'İptal', style: 'cancel' },
              { text: 'Kapat', style: 'destructive', onPress: onClose },
            ]);
          }}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.webContainer}>
        <WebView
          ref={webRef}
          source={{ uri: jitsiUrl }}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          mixedContentMode="always"
          onShouldStartLoadWithRequest={() => true}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          // iOS/Android için izinler app.json'da
          allowsAirPlayForMediaPlayback
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loader}>
              <ActivityIndicator color="#58a6ff" size="large" />
              <Text style={styles.loaderText}>Jitsi sunucusuna bağlanılıyor…</Text>
            </View>
          )}
        />
        {loading && (
          <View style={styles.overlay} pointerEvents="none">
            <ActivityIndicator color="#58a6ff" />
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Mikrofon ve kamera izinlerine "izin ver" deyin. Video + ses + ekran paylaşımı
          Jitsi tarafından sağlanır.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    paddingTop: Platform.OS === 'ios' ? 50 : 14,
    backgroundColor: '#161b22',
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
  },
  title: { color: '#f0f6fc', fontSize: 16, fontWeight: '700' },
  room: { color: '#8b949e', fontSize: 12, marginTop: 2 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#21262d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: '#f0f6fc', fontSize: 18, fontWeight: '600' },
  webContainer: { flex: 1, position: 'relative' },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d1117',
  },
  loaderText: { color: '#58a6ff', fontSize: 13, marginTop: 12 },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: 12,
    backgroundColor: '#161b22',
    borderTopWidth: 1,
    borderTopColor: '#30363d',
  },
  footerText: { color: '#8b949e', fontSize: 11, textAlign: 'center', lineHeight: 16 },
});
