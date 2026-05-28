import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Asset } from 'expo-asset';
import { voiceMeter } from '../services/voiceMeter';

type Props = { active: boolean };

/**
 * GLB yükleme stratejisi v6 — en sade:
 *   1. expo-asset ile avatar.glb URI alınır.
 *   2. WebView avatar-scene.html'i Metro'dan yükler.
 *   3. HTML Three.js yüklenince {type:'ready'} gönderir.
 *   4. React Native 'ready' alınca GLB URI'yi postMessage ile gönderir.
 *   5. HTML XHR ile GLB'yi çeker → Three.js sahneye ekler.
 *   6. Amplitude injectJavaScript ile itilir.
 *
 * FileSystem / base64 / file:// yok — minimal, çalışan primitive.
 */
export default function AvatarStage({ active }: Props) {
  const webviewRef = useRef<WebView>(null);
  const [glbUri, setGlbUri] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [debugMsg, setDebugMsg] = useState('asset yükleniyor…');
  const lastSentRef = useRef(0);

  // 1. GLB asset URI'sini al
  useEffect(() => {
    Asset.fromModule(require('../../assets/avatar.glb'))
      .downloadAsync()
      .then((asset) => {
        // ÖNEMLİ: asset.uri (Metro http URL) tercih edilir — HTML de Metro'dan
        // http ile geldiği için aynı origin → WebView XHR çalışır.
        // localUri (file://) http sayfasından cross-origin engeline takılır.
        const uri = asset.uri ?? asset.localUri;
        setDebugMsg('asset OK: ' + (uri?.slice(0, 50) ?? 'null'));
        setGlbUri(uri ?? null);
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : String(e);
        setDebugMsg('asset HATA: ' + msg);
      });
  }, []);

  // 2. THREE hazır olduktan sonra GLB URI gönder
  useEffect(() => {
    if (ready && glbUri && webviewRef.current) {
      webviewRef.current.postMessage(
        JSON.stringify({ type: 'avatarUrl', url: glbUri })
      );
    }
  }, [ready, glbUri]);

  // 3. Amplitude
  useEffect(() => {
    const unsub = voiceMeter.subscribe((amplitude) => {
      if (!ready) return;
      const now = Date.now();
      if (now - lastSentRef.current < 60) return;
      lastSentRef.current = now;
      webviewRef.current?.injectJavaScript(
        `(function(){if(window.setAmplitude)window.setAmplitude(${amplitude});})();true;`
      );
    });
    return unsub;
  }, [ready]);

  useEffect(() => {
    if (!active && ready) {
      webviewRef.current?.injectJavaScript(
        `(function(){if(window.setAmplitude)window.setAmplitude(0);})();true;`
      );
    }
  }, [active, ready]);

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const d = JSON.parse(e.nativeEvent.data);
      if (d.type === 'ready') {
        setReady(true);
        setDebugMsg('THREE hazır, GLB gönderiliyor…');
      }
      if (d.type === 'loaded') setDebugMsg('Avatar yüklendi ✓');
      if (d.type === 'error') setDebugMsg('⚠️ ' + d.msg);
      if (d.type === 'morphnames') {
        // Avatarın gerçek morph hedeflerini logla — terminal/console'da görünür
        console.log('[Avatar] MORPH NAMES (' + d.names.length + '):', JSON.stringify(d.names));
        setDebugMsg('morph sayısı: ' + d.names.length + (d.names.length ? ' · ' + d.names.slice(0, 3).join(',') : ' — YOK'));
      }
      if (d.type === 'log') console.log('[Avatar]', d.msg);
    } catch { /* ignore */ }
  };

  return (
    <View style={styles.container}>
      {/* debug overlay — kaldırılabilir */}
      <Text style={styles.debug}>{debugMsg}</Text>
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={require('../../assets/avatar-scene.html')}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        mixedContentMode="always"
        onMessage={onMessage}
        scrollEnabled={false}
        bounces={false}
        androidLayerType="hardware"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden', backgroundColor: '#0a0e1a' },
  webview:   { flex: 1, backgroundColor: '#0a0e1a' },
  debug: {
    position: 'absolute',
    top: 6, left: 6,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    zIndex: 10,
    maxWidth: '90%',
  },
});
