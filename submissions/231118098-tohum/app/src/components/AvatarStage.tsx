import React, { Suspense, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { useGLTF } from '@react-three/drei/native';
import * as THREE from 'three';

type AvatarStageProps = {
  glbModule?: number | null;
  mouthOpenness: number;
  height?: number;
};

function Placeholder({ mouthOpenness }: { mouthOpenness: number }) {
  const mouthRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (mouthRef.current) {
      const targetScaleY = 0.1 + mouthOpenness * 0.6;
      mouthRef.current.scale.y += (targetScaleY - mouthRef.current.scale.y) * 0.3;
    }
  });

  return (
    <group>
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.6} />
      </mesh>
      <mesh position={[-0.35, 0.7, 0.85]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.35, 0.7, 0.85]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh ref={mouthRef} position={[0, 0.1, 0.92]} scale={[0.5, 0.1, 0.05]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#7c2d12" />
      </mesh>
    </group>
  );
}

function GltfAvatar({ glbModule, mouthOpenness }: { glbModule: number; mouthOpenness: number }) {
  const gltf = useGLTF(glbModule as any);

  const morphTargets = useMemo(() => {
    const targets: Array<{ mesh: THREE.Mesh; indices: number[] }> = [];
    gltf.scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.isMesh && mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
        const dict = mesh.morphTargetDictionary;
        const visemeKeys = [
          'mouthOpen', 'jawOpen', 'viseme_aa', 'viseme_O', 'viseme_E',
          'A', 'O', 'mouth_open',
        ];
        const indices: number[] = [];
        for (const key of visemeKeys) {
          if (key in dict) indices.push(dict[key]);
        }
        if (indices.length > 0) targets.push({ mesh, indices });
      }
    });
    return targets;
  }, [gltf]);

  useFrame(() => {
    for (const { mesh, indices } of morphTargets) {
      const influences = mesh.morphTargetInfluences!;
      for (const idx of indices) {
        const target = mouthOpenness;
        influences[idx] += (target - influences[idx]) * 0.4;
      }
    }
  });

  return <primitive object={gltf.scene} position={[0, -1.4, 0]} />;
}

export default function AvatarStage({ glbModule, mouthOpenness, height = 320 }: AvatarStageProps) {
  return (
    <View style={[styles.container, { height }]}>
      <Canvas camera={{ position: [0, 1.4, 2.6], fov: 38 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 2]} intensity={0.9} />
        <directionalLight position={[-3, 2, -2]} intensity={0.3} />
        <Suspense fallback={null}>
          {glbModule != null ? (
            <GltfAvatar glbModule={glbModule} mouthOpenness={mouthOpenness} />
          ) : (
            <Placeholder mouthOpenness={mouthOpenness} />
          )}
        </Suspense>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    overflow: 'hidden',
  },
});
