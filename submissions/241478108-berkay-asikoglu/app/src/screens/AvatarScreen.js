import React, { useState, useRef, Suspense, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { useGLTF } from '@react-three/drei/native';
import * as THREE from 'three';
import AvatarVariantToggle from '../components/AvatarVariantToggle';
import BridgeButton from '../components/BridgeButton';
import { useForge } from '../context/ForgeContext';
import { mapRmsToViseme } from '../components/VisemeController';

export function AvatarModel({ lastRms, variant, onLoad }) {
  const gltf = useGLTF(require('../../assets/avatar.glb'));
  const targetValueRef = useRef(0);

  useEffect(() => {
    if (gltf && onLoad) onLoad();
  }, [gltf, onLoad]);

  useFrame((state, delta) => {
    // Artificial Idle Animation (Breathing and slight sway)
    // Base position is 0, so the head is around Y=1.5
    gltf.scene.position.y = 0 + Math.sin(state.clock.elapsedTime * 2) * 0.015;
    gltf.scene.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    gltf.scene.rotation.z = Math.cos(state.clock.elapsedTime * 0.8) * 0.02;

    targetValueRef.current = THREE.MathUtils.lerp(targetValueRef.current, lastRms || 0, 10 * delta);
    const viseme = mapRmsToViseme(targetValueRef.current);
    
    gltf.scene.traverse((child) => {
      if (child.isMesh && child.morphTargetDictionary) {
        for (const key in child.morphTargetDictionary) {
          if (key.startsWith('viseme_')) {
             child.morphTargetInfluences[child.morphTargetDictionary[key]] = 0;
          }
        }
        
        const VISEME_LIST = [
          'viseme_sil', 'viseme_MBP', 'viseme_E', 'viseme_I', 
          'viseme_AAH', 'viseme_OO', 'viseme_U', 'viseme_oh'
        ];
        const targetViseme = VISEME_LIST[viseme.index];
        if (targetViseme && child.morphTargetDictionary[targetViseme] !== undefined) {
          child.morphTargetInfluences[child.morphTargetDictionary[targetViseme]] = viseme.weight;
        }

        // Fallback for ARKit
        if (child.morphTargetDictionary['jawOpen'] !== undefined) {
           child.morphTargetInfluences[child.morphTargetDictionary['jawOpen']] = 
             viseme.index === 4 ? viseme.weight * 0.8 : (viseme.index === 0 ? 0 : viseme.weight * 0.2);
           
           if (child.morphTargetDictionary['mouthPucker'] !== undefined) {
              child.morphTargetInfluences[child.morphTargetDictionary['mouthPucker']] = 
                viseme.index === 5 || viseme.index === 6 ? viseme.weight : 0;
           }
           if (child.morphTargetDictionary['mouthSmile'] !== undefined) {
              child.morphTargetInfluences[child.morphTargetDictionary['mouthSmile']] = 
                viseme.index === 2 || viseme.index === 3 ? viseme.weight * 0.5 : 0;
           }
        }
      }
      
      // Kollar sağa/sola açıksa (T-Pose), onları aşağı indirmek için X/Y eksenini deniyoruz.
      if (child.isBone) {
        if (child.name.includes('LeftArm') || child.name.includes('mixamorigLeftArm')) {
          child.rotation.x = 1.35;
        }
        if (child.name.includes('RightArm') || child.name.includes('mixamorigRightArm')) {
          child.rotation.x = 1.35;
        }
      }
    });
  });

  return <primitive object={gltf.scene} scale={1.08} position={[0, -0.22, 0]} />;
}

export default function AvatarScreen({ route, navigation }) {
  const { lastRms, transcript } = route.params || {};
  const [variant, setVariant] = useState('junior-sen');
  const { stuck } = useForge();

  const onToggleVariant = () => {
    setVariant(prev => prev === 'junior-sen' ? 'senior-sen' : 'junior-sen');
  };

  const onBridgePress = () => {
    navigation.navigate('Bridge');
  };

  React.useEffect(() => {
    if (stuck) {
      const timer = setTimeout(() => {
        onBridgePress();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [stuck]);

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas} camera={{ position: [0, 0, 3], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 3, 2]} intensity={1.2} />
        <directionalLight position={[-2, 1, 1]} intensity={0.5} color="#a855f7" />
        <Suspense fallback={null}>
          <AvatarModel lastRms={lastRms} variant={variant} />
        </Suspense>
      </Canvas>

      <View style={styles.overlay} pointerEvents="box-none">
        <Text style={styles.label}>{variant === 'junior-sen' ? '👶 junior-sen' : '🧠 senior-sen'}</Text>
        <Text style={styles.subtitle}>Konuşma senkronizasyonu aktif (R3F Native)</Text>
        {transcript ? <Text style={styles.transcriptPreview} numberOfLines={2}>📝 {transcript}</Text> : null}
      </View>

      <AvatarVariantToggle variant={variant} onToggle={onToggleVariant} />
      <BridgeButton visible={stuck} onPress={onBridgePress} />
      
      {/* Vibe Cart Button */}
      <TouchableOpacity 
        style={styles.cartButton}
        onPress={() => navigation.navigate('Cart')}
      >
        <Text style={styles.cartButtonText}>🛒 Vibe Cart</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  canvas: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 4,
  },
  transcriptPreview: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: '90%',
  },
  cartButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0, 245, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00f5ff',
  },
  cartButtonText: {
    color: '#00f5ff',
    fontSize: 14,
    fontWeight: '700',
  },
});
