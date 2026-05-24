import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Bridge'>;
};

const ROOM_ID = `nokta-9221118097-${Date.now()}`;
const JITSI_URL = `https://meet.jit.si/${ROOM_ID}#config.startWithVideoMuted=false&config.startWithAudioMuted=false&config.disableScreensharingCombinedWithRaiseHandFeature=false`;

export default function BridgeScreen({ navigation }: Props) {
  const webViewRef = useRef(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Kapat</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📞 Uzmana Bağlan</Text>
        <View style={styles.roomBadge}>
          <Text style={styles.roomText}>Jitsi</Text>
        </View>
      </View>

      <View style={styles.infoBar}>
        <Text style={styles.infoText}>
          Oda: <Text style={styles.roomId}>{ROOM_ID.slice(-24)}</Text>
        </Text>
        <Text style={styles.infoSub}>
          Sınıf arkadaşınla bu linki paylaş → O da aynı odaya girebilir
        </Text>
      </View>

      <WebView
        ref={webViewRef}
        source={{ uri: JITSI_URL }}
        style={styles.webview}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#6c47ff" />
            <Text style={styles.loaderText}>Jitsi yükleniyor…</Text>
          </View>
        )}
        onError={e => console.warn('[BridgeScreen] WebView error:', e.nativeEvent)}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ✅ Video · ✅ Ses · ✅ Ekran Paylaşımı — Jitsi oda içinden etkinleştir
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f14' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : 44,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
  },
  backBtn: {},
  backText: { color: '#6c47ff', fontSize: 15 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  roomBadge: {
    backgroundColor: '#1e3a1a',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  roomText: { color: '#4caf50', fontSize: 11, fontWeight: '700' },

  infoBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
    backgroundColor: '#0d0d18',
  },
  infoText: { color: '#888', fontSize: 12 },
  roomId: { color: '#6c47ff', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  infoSub: { color: '#555', fontSize: 11, marginTop: 2 },

  webview: { flex: 1 },

  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0f0f14',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loaderText: { color: '#888', fontSize: 14 },

  footer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e1e2e',
    backgroundColor: '#0d0d18',
  },
  footerText: { color: '#666', fontSize: 11, textAlign: 'center' },
});
