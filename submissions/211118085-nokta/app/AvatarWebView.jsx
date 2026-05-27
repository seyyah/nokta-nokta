/**
 * AvatarWebView.jsx
 * WebView içinde avatar-web/index.html çalıştırır.
 * RMS değerini postMessage köprüsü ile HTML'e iletir.
 *
 * Kurulum:
 *   npx expo install react-native-webview expo-asset expo-file-system
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

// avatar-web/index.html ve avatar.glb asset olarak bundle'a eklenmeli.
// app.json'a şunu ekle:
// "expo": { "assetBundlePatterns": ["assets/**/*", "avatar-web/**/*"] }
const HTML_ASSET = require('./avatar-web/index.html');

/**
 * Props:
 *   rms: number       — VoiceVisualizer'dan anlık ses 0..1
 *   persona: 'junior' | 'senior'
 *   style
 */
export default function AvatarWebView({ rms = 0, persona = 'junior', style }) {
  const webViewRef = useRef(null);
  const htmlUriRef = useRef(null);
  const glbUriRef  = useRef(null);
  const lastRms    = useRef(-1);

  // Asset'leri local dosya sistemine kopyala (WebView file:// okuyabilsin)
  useEffect(() => {
    (async () => {
      try {
        const [htmlAsset] = await Asset.loadAsync([HTML_ASSET]);
htmlUriRef.current = htmlAsset.localUri;
glbUriRef.current  = 'file:///android_asset/Avatar.glb';
      } catch (e) {
        console.warn('AvatarWebView asset yükleme hatası:', e);
      }
    })();
  }, []);

  // RMS değişince postMessage gönder — her frame'de değil, sadece fark varsa
  useEffect(() => {
    if (!webViewRef.current) return;
    const rounded = Math.round(rms * 100) / 100; // 2 decimal — gereksiz mesajları azalt
    if (Math.abs(rounded - lastRms.current) < 0.01) return;
    lastRms.current = rounded;
    webViewRef.current.postMessage(JSON.stringify({ type: 'RMS', value: rounded }));
  }, [rms]);

  // Persona değişince postMessage
  useEffect(() => {
    if (!webViewRef.current) return;
    webViewRef.current.postMessage(JSON.stringify({ type: 'PERSONA', persona }));
  }, [persona]);

  // WebView hazır olunca GLB URI gönder
  const handleLoad = useCallback(() => {
    if (!webViewRef.current) return;
    webViewRef.current.postMessage(
      JSON.stringify({ type: 'PERSONA', persona })
    );
    // RMS polling başlat
    setInterval(() => {
      if (webViewRef.current) {
        webViewRef.current.postMessage(
          JSON.stringify({ type: 'RMS', value: lastRms.current })
        );
      }
    }, 60);
}, [persona]);

  if (!htmlUriRef.current) {
    return (
      <View style={[styles.placeholder, style]}>
        <Text style={styles.placeholderText}>Avatar hazırlanıyor...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
      domStorageEnabled
      javaScriptEnabled
        ref={webViewRef}
        source={{ uri: htmlUriRef.current }}
        style={styles.webview}
        originWhitelist={['*']}
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        mixedContentMode="always"
        onLoad={handleLoad}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        backgroundColor="transparent"
        // WebView → RN mesajları (hata raporlama için)
        onMessage={(e) => {
          try {
            const msg = JSON.parse(e.nativeEvent.data);
            if (msg.type === 'ERROR') console.warn('Avatar WebView error:', msg.error);
          } catch (_) {}
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#0d0d1a',
    borderWidth: 1,
    borderColor: '#1e1e3a',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d0d1a',
    borderRadius: 20,
    padding: 40,
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
  },
});
