import React, { Suspense, useRef, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { useGLTF, Environment } from '@react-three/drei/native';
import { Asset } from 'expo-asset';
import * as THREE from 'three';
import NoktaMascot, { MascotEmotion } from './NoktaMascot';

const VISEME_MORPHS = ['viseme_aa', 'viseme_O', 'viseme_E', 'viseme_I'];
const HEAD_MESH_NAMES = ['Wolf3D_Head', 'Head'];

interface AvatarModelProps {
  glbUri: string;
  audioLevel: number;
  isRecording: boolean;
}

function AvatarModel({ glbUri, audioLevel, isRecording }: AvatarModelProps) {
  const { scene } = useGLTF(glbUri);
  const headRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    scene.traverse((node: any) => {
      if (headRef.current) return;
      if (
        node.isMesh &&
        node.morphTargetDictionary &&
        HEAD_MESH_NAMES.some(name => node.name.includes(name))
      ) {
        headRef.current = node;
      }
    });
    // Fallback: first mesh with morph targets
    if (!headRef.current) {
      scene.traverse((node: any) => {
        if (!headRef.current && node.isMesh && node.morphTargetDictionary) {
          headRef.current = node;
        }
      });
    }
  }, [scene]);

  useFrame(() => {
    const mesh = headRef.current as any;
    if (!mesh?.morphTargetDictionary || !mesh?.morphTargetInfluences) return;

    const level = isRecording ? Math.max(0, Math.min(1, audioLevel)) : 0;

    VISEME_MORPHS.forEach((morph, i) => {
      const idx = mesh.morphTargetDictionary[morph];
      if (idx === undefined) return;
      const wave = Math.sin(Date.now() / 120 + i) * 0.15;
      mesh.morphTargetInfluences[idx] = Math.max(0, level * 0.85 + wave * level);
    });
  });

  return (
    <primitive
      object={scene}
      position={[0, -1.55, 0]}
      rotation={[0, Math.PI, 0]}
      scale={1}
    />
  );
}

interface Props {
  audioLevel: number;
  isRecording: boolean;
  emotion: MascotEmotion;
}

export default function AvatarMascot({ audioLevel, isRecording, emotion }: Props) {
  const [glbUri, setGlbUri] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [asset] = await Asset.loadAsync(require('../assets/avatar.glb'));
        setGlbUri(asset.localUri ?? asset.uri);
      } catch (e) {
        console.warn('[AvatarMascot] Failed to load avatar.glb:', e);
        setLoadFailed(true);
      }
    })();
  }, []);

  if (loadFailed || (!glbUri && !loadFailed)) {
    return <NoktaMascot emotion={emotion} />;
  }

  return (
    <View style={styles.canvas}>
      <Canvas
        camera={{ position: [0, 0.6, 0.85], fov: 38 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[0, 2, 1]} intensity={0.8} />
        <directionalLight position={[-1, 1, -1]} intensity={0.3} />
        <Suspense fallback={null}>
          <Environment preset="city" />
          {glbUri ? (
            <AvatarModel
              glbUri={glbUri}
              audioLevel={audioLevel}
              isRecording={isRecording}
            />
          ) : null}
        </Suspense>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: '100%',
    height: 220,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0f0f14',
  },
});
