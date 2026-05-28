import { Suspense, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Asset } from 'expo-asset';
import { Canvas, useFrame, useLoader } from '@react-three/fiber/native';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { Mesh, Object3D } from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

import avatarAsset from '@/assets/avatar.glb';

type AvatarStageProps = {
  level: number;
  persona: 'junior' | 'senior';
  speaking: boolean;
};

type MorphTarget = {
  mesh: Mesh;
  indices: number[];
};

function getMorphTargets(scene: Object3D): MorphTarget[] {
  const targets: MorphTarget[] = [];

  scene.traverse((node) => {
    const mesh = node as Mesh;
    const dictionary = mesh.morphTargetDictionary;
    const influences = mesh.morphTargetInfluences;

    if (!dictionary || !influences) {
      return;
    }

    const indices = Object.entries(dictionary)
      .filter(([name]) => /mouth|jaw|viseme|aa|oh|ou|ee/i.test(name))
      .map(([, index]) => index)
      .filter((index): index is number => typeof index === 'number');

    if (indices.length > 0) {
      targets.push({ mesh, indices });
    }
  });

  return targets;
}

function AvatarModel({ level, persona, speaking, uri }: AvatarStageProps & { uri: string }) {
  const gltf = useLoader(GLTFLoader, uri) as GLTF;
  const scene = gltf.scene;
  const morphTargets = useMemo(() => getMorphTargets(scene), [scene]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const personaPulse = persona === 'senior' ? 0.72 : 1;
    const autoSpeech = speaking ? Math.max(0, Math.sin(time * 13) * 0.28) : 0;
    const mouthOpen = Math.min(1, (level + autoSpeech) * personaPulse);

    morphTargets.forEach(({ mesh, indices }) => {
      indices.forEach((index, targetIndex) => {
        if (mesh.morphTargetInfluences) {
          mesh.morphTargetInfluences[index] =
            mouthOpen * (targetIndex === 0 ? 0.95 : 0.42);
        }
      });
    });

    scene.rotation.y = Math.sin(time * 0.7) * 0.08;
    scene.position.y = -2.65 + Math.sin(time * 1.4) * 0.018;
  });

  return <primitive object={scene} scale={1.58} position={[0, -2.65, 0]} />;
}

export function AvatarStage({ level, persona, speaking }: AvatarStageProps) {
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadAvatar() {
      const asset = Asset.fromModule(avatarAsset);
      await asset.downloadAsync();
      if (mounted) {
        setUri(asset.localUri ?? asset.uri);
      }
    }

    void loadAvatar();
    return () => {
      mounted = false;
    };
  }, []);

  if (!uri) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#58f0d5" />
        <Text style={styles.loadingText}>Loading your GLB avatar...</Text>
      </View>
    );
  }

  return (
    <View style={styles.stage}>
      <Canvas camera={{ position: [0, 1.65, 3.25], fov: 26 }}>
        <color attach="background" args={['#10131b']} />
        <ambientLight intensity={1.2} />
        <directionalLight intensity={2.1} position={[2.4, 3.2, 3.5]} />
        <pointLight intensity={0.8} position={[-2, 1, 2]} />
        <Suspense fallback={null}>
          <AvatarModel level={level} persona={persona} speaking={speaking} uri={uri} />
        </Suspense>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    backgroundColor: '#10131b',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 8,
    borderWidth: 1,
    height: 420,
    overflow: 'hidden',
    width: '100%',
  },
  loading: {
    alignItems: 'center',
    backgroundColor: '#10131b',
    borderRadius: 8,
    height: 420,
    justifyContent: 'center',
    width: '100%',
  },
  loadingText: {
    color: '#d8dee9',
    marginTop: 12,
  },
});
