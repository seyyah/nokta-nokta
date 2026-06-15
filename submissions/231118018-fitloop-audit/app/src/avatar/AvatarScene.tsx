import React, { Suspense, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform, Text } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const AVATAR_URL = require('../../assets/avatar.glb');

function AvatarModel({ isSpeaking }: { isSpeaking: boolean }) {
  const { scene } = useGLTF(AVATAR_URL) as any;
  const headMeshRef = useRef<THREE.SkinnedMesh | null>(null);
  
  const targetOpenness = useRef(0);
  const currentOpenness = useRef(0);

  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh && child.morphTargetDictionary) {
        if (
          child.morphTargetDictionary['mouthOpen'] !== undefined || 
          child.morphTargetDictionary['jawOpen'] !== undefined ||
          child.morphTargetDictionary['viseme_O'] !== undefined
        ) {
          headMeshRef.current = child;
        }
      }
    });
  }, [scene]);

  useFrame((state, delta) => {
    if (isSpeaking) {
      if (Math.random() > 0.7) {
        targetOpenness.current = Math.random() * 0.6 + 0.2;
      } else if (Math.random() > 0.9) {
        targetOpenness.current = 0;
      }
    } else {
      targetOpenness.current = 0;
    }

    currentOpenness.current = THREE.MathUtils.lerp(
      currentOpenness.current, 
      targetOpenness.current, 
      delta * 12
    );

    if (headMeshRef.current && headMeshRef.current.morphTargetInfluences && headMeshRef.current.morphTargetDictionary) {
      let morphKey = 'mouthOpen';
      if (headMeshRef.current.morphTargetDictionary['jawOpen'] !== undefined) {
        morphKey = 'jawOpen';
      }
      
      const index = headMeshRef.current.morphTargetDictionary[morphKey];
      if (index !== undefined) {
        headMeshRef.current.morphTargetInfluences[index] = currentOpenness.current;
      }
    }
  });

  return (
    <primitive object={scene} scale={2.2} position={[0, -3.2, 0]} />
  );
}

export default function AvatarScene({ isSpeaking = false }: { isSpeaking?: boolean }) {
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, styles.webFallback]}>
        <Text style={styles.webFallbackText}>3D Avatar (GLB) sadece Native cihazlarda çalışır.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Suspense fallback={
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      }>
        <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[2, 2, 2]} intensity={2} />
          <Environment preset="city" />
          <AvatarModel isSpeaking={isSpeaking} />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            minPolarAngle={Math.PI / 2.2} 
            maxPolarAngle={Math.PI / 2.2} 
          />
        </Canvas>
      </Suspense>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  webFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  webFallbackText: {
    color: '#94A3B8',
    textAlign: 'center',
  }
});
