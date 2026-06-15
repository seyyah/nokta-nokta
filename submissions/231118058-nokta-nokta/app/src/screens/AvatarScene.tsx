import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import { AVATAR_HTML } from './avatarHtml';

interface AvatarSceneProps {
  volumeLevel: number;
}

export const AvatarScene: React.FC<AvatarSceneProps> = ({ volumeLevel }) => {
  const webViewRef = useRef<WebView>(null);
  const [glbBase64, setGlbBase64] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // 1. GLB Asset yükle
        const glbAsset = Asset.fromModule(require('../../avatar.glb'));
        await glbAsset.downloadAsync();
        
        let targetUri = glbAsset.localUri;
        if (!targetUri && glbAsset.uri) {
          const cachePath = `${FileSystem.cacheDirectory}avatar.glb`;
          const downloadResult = await FileSystem.downloadAsync(glbAsset.uri, cachePath);
          targetUri = downloadResult.uri;
        }

        if (targetUri) {
          // 2. GLB'yi Base64 olarak oku (iOS WebView CORS'u aşmak için zorunlu)
          const base64 = await FileSystem.readAsStringAsync(targetUri, {
            encoding: 'base64',
          });
          if (isMounted) {
            setGlbBase64(`data:application/octet-stream;base64,${base64}`);
          }
        } else {
          if (isMounted) setError("GLB dosyası yerel olarak okunamadı.");
        }
      } catch (e: any) {
        if (isMounted) setError(e.message);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // HTML tarafı hazır olunca (onMessage) GLB verisini gönder
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'ready') {
        setIsReady(true);
        if (glbBase64) {
          webViewRef.current?.postMessage(JSON.stringify({
            type: 'loadGLB',
            base64Uri: glbBase64
          }));
        }
      } else if (data.type === 'log') {
        console.log('[WebView Log]:', data.message);
      }
    } catch (e) {}
  };

  // Base64 hazır olduğunda ve WebView 'ready' olduğunda hemen gönder
  useEffect(() => {
    if (isReady && glbBase64 && webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'loadGLB',
        base64Uri: glbBase64
      }));
    }
  }, [glbBase64, isReady]);

  // Ses seviyesini sürekli WebView'a gönder
  useEffect(() => {
    if (isReady && webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        volume: volumeLevel
      }));
    }
  }, [volumeLevel, isReady]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Hata: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!glbBase64 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="#00cfff" size="large" />
          <Text style={{ color: '#00cfff', marginTop: 10 }}>Model Okunuyor...</Text>
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ html: AVATAR_HTML, baseUrl: '' }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        bounces={false}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        originWhitelist={['*']}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080c18',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#080c18',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#080c18',
    zIndex: 10,
  },
  errorText: {
    color: '#ff6b6b',
    padding: 20,
    textAlign: 'center',
  },
});
