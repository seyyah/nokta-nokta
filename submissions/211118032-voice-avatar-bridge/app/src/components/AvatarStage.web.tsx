import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Asset } from 'expo-asset';
import { voiceMeter } from '../services/voiceMeter';

type Props = {
  active: boolean;
};

/**
 * AvatarStage.web — web platformu için iframe tabanlı versiyon.
 * Metro Platform.OS === 'web' olduğunda bu dosyayı otomatik kullanır
 * (native'de AvatarStage.tsx WebView ile çalışır).
 *
 * Mimari aynı: avatar-scene.html'i iframe içinde yükle → glb URL'sini
 * postMessage ile ver → mic amplitude'i akıt → viseme'leri tetikle.
 */
export default function AvatarStage({ active }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [glbUri, setGlbUri] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const lastSentRef = useRef(0);

  // avatar.glb URI'yi al
  useEffect(() => {
    (async () => {
      try {
        const asset = Asset.fromModule(require('../../assets/avatar.glb'));
        await asset.downloadAsync();
        setGlbUri(asset.localUri ?? asset.uri);
      } catch {
        setGlbUri(null);
      }
    })();
  }, []);

  // iframe → bootstrap dinle
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      try {
        const data = JSON.parse(typeof e.data === 'string' ? e.data : '');
        if (data.type === 'bootstrap' || data.type === 'ready') {
          setReady(true);
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // glb URL'i iframe'e gönder
  useEffect(() => {
    if (!ready || !glbUri || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ type: 'avatarUrl', url: glbUri }),
      '*',
    );
  }, [ready, glbUri]);

  // Mic amplitude → iframe
  useEffect(() => {
    const unsub = voiceMeter.subscribe((amplitude) => {
      const now = Date.now();
      if (now - lastSentRef.current < 55) return;
      lastSentRef.current = now;
      if (!iframeRef.current?.contentWindow) return;
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ type: 'amplitude', value: amplitude }),
        '*',
      );
    });
    return unsub;
  }, []);

  // Idle: 0 amplitude push
  useEffect(() => {
    if (!active && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ type: 'amplitude', value: 0 }),
        '*',
      );
    }
  }, [active]);

  // HTML asset'i için URL üret. Web'de require() bir string döner.
  const htmlSrc = require('../../assets/avatar-scene.html') as string;

  return (
    <View style={styles.container}>
      {/* @ts-expect-error - iframe is a web-only HTML element, not in RN types */}
      <iframe
        ref={iframeRef}
        src={htmlSrc}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          backgroundColor: '#0a0e1a',
        }}
        title="Nokta Avatar Stage"
        allow="microphone; camera"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#0a0e1a',
  },
});
