import React, { Suspense, useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

let FiberCanvas = null;
let useFrameHook = null;
let useGLTFHook = null;
let EnvironmentComponent = null;

try {
  const fiber = require('@react-three/fiber');
  const drei = require('@react-three/drei');
  FiberCanvas = fiber.Canvas;
  useFrameHook = fiber.useFrame;
  useGLTFHook = drei.useGLTF;
  EnvironmentComponent = drei.Environment;
} catch (error) {
  console.warn('Three.js avatar modules could not be loaded.', error);
}

function AvatarFallback({ message }) {
  return (
    <View style={styles.container}>
      <View style={styles.fallbackCard}>
        <Text style={styles.fallbackTitle}>Avatar Preview</Text>
        <Text style={styles.fallbackText}>{message}</Text>
      </View>
    </View>
  );
}

function AvatarScene({ audioLevel }) {
  const { scene } = useGLTFHook(require('./assets/avatar.glb'));
  const headRef = useRef(null);

  useEffect(() => {
    scene.traverse((node) => {
      if (node.isMesh && node.morphTargetInfluences) {
        headRef.current = node;
      }
    });
  }, [scene]);

  useFrameHook((state) => {
    if (!headRef.current) return;

    const volume = Math.max(0, (audioLevel + 60) / 60);
    const mouthOpen = Math.min(1, volume * 1.5);
    const dict = headRef.current.morphTargetDictionary;
    const influences = headRef.current.morphTargetInfluences;

    if (!dict || !influences) return;

    const jawOpenIdx = dict.jawOpen;
    const mouthOpenIdx = dict.mouthOpen;
    const visemeOIdx = dict.viseme_O;

    if (jawOpenIdx !== undefined) influences[jawOpenIdx] = mouthOpen;
    if (mouthOpenIdx !== undefined) influences[mouthOpenIdx] = mouthOpen;
    if (visemeOIdx !== undefined) influences[visemeOIdx] = mouthOpen * 0.5;

    const blinkLeftIdx = dict.eyeBlinkLeft;
    const blinkRightIdx = dict.eyeBlinkRight;
    if (blinkLeftIdx !== undefined && blinkRightIdx !== undefined) {
      const time = state.clock.getElapsedTime();
      const blink = Math.sin(time * 2) > 0.95 ? 1 : 0;
      influences[blinkLeftIdx] = blink;
      influences[blinkRightIdx] = blink;
    }
  });

  return <primitive object={scene} scale={2.5} position={[0, -4, 0]} />;
}

export default function AvatarCanvas({ audioLevel }) {
  if (Platform.OS === 'web') {
    return (
      <AvatarFallback message="3D avatar web modunda devre dışı. Tam deneyim için Expo Go üzerinde aç." />
    );
  }

  if (!FiberCanvas || !useFrameHook || !useGLTFHook || !EnvironmentComponent) {
    return (
      <AvatarFallback message="Avatar motoru yüklenemedi. Uygulamanın geri kalanı kullanılabilir." />
    );
  }

  return (
    <View style={styles.container}>
      <FiberCanvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[2, 2, 2]} intensity={2} />
        <EnvironmentComponent preset="city" />
        <Suspense fallback={null}>
          <AvatarScene audioLevel={audioLevel} />
        </Suspense>
      </FiberCanvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 250,
    backgroundColor: '#0A0A0B',
    overflow: 'hidden',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  fallbackCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#111214',
  },
  fallbackTitle: {
    color: '#7DF9FF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  fallbackText: {
    color: '#B0B0B0',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
