// src/avatar/AvatarScene.tsx
// PLAN B-2 — WebView + three.js (CDN) + GLTFLoader + Morph Target Lipsync
//
// model-viewer scene API'si morph dictionary'i expose etmediği için
// (count=0 sorunu) doğrudan three.js + GLTFLoader kullanıyoruz.
// Aynı stack'i donmccurdy gltf-viewer kullanıyor ve avaturn TYPE 2
// blendshape'lerini doğru gösteriyor.

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

interface Props {
  level: number;
}

const AVATAR_MODULE = require('../../assets/avatar.glb');

async function loadAvatarAsBase64(): Promise<string> {
  const asset = Asset.fromModule(AVATAR_MODULE);
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return `data:model/gltf-binary;base64,${base64}`;
}

function buildHtml(modelDataUrl: string): string {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
  <style>
    html, body { margin: 0; padding: 0; height: 100%; background: #0d1117; overflow: hidden; }
    #canvas { width: 100%; height: 100%; display: block; }
    .hint { position: absolute; bottom: 12px; left: 0; right: 0; text-align: center; color: #8b949e; font-family: -apple-system, sans-serif; font-size: 12px; font-weight: 600; pointer-events: none; }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <div class="hint" id="hint">sessiz</div>

  <script type="importmap">
  {
    "imports": {
      "three": "https://unpkg.com/three@0.169.0/build/three.module.js",
      "three/addons/": "https://unpkg.com/three@0.169.0/examples/jsm/"
    }
  }
  </script>

  <script type="module">
    import * as THREE from 'three';
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

    const canvas = document.getElementById('canvas');
    const hint = document.getElementById('hint');

    // RN'den gelen level
    let currentLevel = 0;
    let smoothedMouth = 0;
    let morphRefs = [];
    let modelLoaded = false;

    // === Three.js sahne kur ===
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(35, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0.9, 3.5);
    camera.lookAt(0, 0.9, 0);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // Işıklar
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(2, 3, 2);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x88ccff, 0.5);
    fill.position.set(-2, 2, -1);
    scene.add(fill);

    // Resize
    function resize() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
    window.addEventListener('resize', resize);

    // === Model yükle ===
    const loader = new GLTFLoader();
    loader.load(
      '${modelDataUrl}',
      function (gltf) {
        const model = gltf.scene;
        scene.add(model);

        // Morph target'leri tara
        const targets = ['mouthOpen','jawOpen','viseme_aa','viseme_O','viseme_E','viseme_AA'];
        model.traverse(function (obj) {
          if (obj.isMesh && obj.morphTargetDictionary && obj.morphTargetInfluences) {
            for (var i = 0; i < targets.length; i++) {
              var name = targets[i];
              if (name in obj.morphTargetDictionary) {
                morphRefs.push({
                  mesh: obj.name,
                  influences: obj.morphTargetInfluences,
                  index: obj.morphTargetDictionary[name],
                  targetName: name
                });
                break;
              }
            }
          }
        });

        modelLoaded = true;
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'avatar-ready',
          morphCount: morphRefs.length,
          targets: morphRefs.map(function(m){ return m.mesh + ':' + m.targetName; })
        }));

        animate();
      },
      undefined,
      function (err) {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'avatar-error',
          message: 'GLTFLoader: ' + (err && err.message ? err.message : err)
        }));
      }
    );

    // === RN postMessage handler ===
    function handleMessage(raw) {
      try { var data = JSON.parse(raw); if (data && typeof data.level === 'number') { currentLevel = Math.max(0, Math.min(1, data.level)); } } catch (_) {}
    }
    document.addEventListener('message', function (e) { handleMessage(e.data); });
    window.addEventListener('message', function (e) { handleMessage(e.data); });

    // === Animasyon döngüsü ===
    function animate() {
      requestAnimationFrame(animate);

      // Lipsync: level → smoothed mouth open
      var target = currentLevel * 0.95;
      smoothedMouth = smoothedMouth + (target - smoothedMouth) * 0.45;

      if (modelLoaded && morphRefs.length > 0) {
        for (var i = 0; i < morphRefs.length; i++) {
          morphRefs[i].influences[morphRefs[i].index] = smoothedMouth;
        }
      }

      hint.textContent = currentLevel > 0.1 ? '🎙️ konuşuluyor' : 'sessiz';
      renderer.render(scene, camera);
    }
  </script>
</body>
</html>`;
}

export function AvatarScene({ level }: Props) {
  const webRef = useRef<WebView>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const dataUrl = await loadAvatarAsBase64();
        if (mounted) setHtml(buildHtml(dataUrl));
      } catch (e: any) {
        if (mounted) setError(e?.message ?? 'Avatar yüklenemedi');
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    webRef.current?.postMessage(JSON.stringify({ level }));
  }, [level, ready]);

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(e.nativeEvent.data);
      if (data.type === 'avatar-ready') {
        setReady(true);
        console.log('[AVATAR-READY] count=', data.morphCount, 'targets=', JSON.stringify(data.targets));
      } else if (data.type === 'avatar-error') {
        setError(data.message);
      }
    } catch {}
  };

  if (error) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.errorText}>Avatar yüklenemedi: {error}</Text>
      </View>
    );
  }
  if (!html) {
    return (
      <View style={styles.fallback}>
        <ActivityIndicator color="#58a6ff" size="large" />
        <Text style={styles.loadingText}>Avatar hazırlanıyor…</Text>
      </View>
    );
  }
  return (
    <View style={styles.canvas}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html }}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        bounces={false}
        allowsInlineMediaPlayback
        style={styles.web}
        // three.js modüllerinin yüklenmesi için ağ izni
        mixedContentMode="always"
      />
      {!ready && (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator color="#58a6ff" />
          <Text style={styles.loadingText}>Avatar yükleniyor…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { flex: 1, backgroundColor: '#0d1117', borderRadius: 16, overflow: 'hidden' },
  web: { flex: 1, backgroundColor: '#0d1117' },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d1117', gap: 12 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { color: '#58a6ff', fontSize: 13 },
  errorText: { color: '#f85149', fontSize: 13, textAlign: 'center', padding: 20 },
});