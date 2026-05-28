import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export default function AvatarView({ 
  audioLevel = 0, 
  onMorphTargetsCount 
}: { 
  audioLevel?: number;
  onMorphTargetsCount?: (count: number) => void;
}) {
  // Use require for local assets in React Native Expo
  const { scene } = useGLTF(require('../../assets/avatar.glb'));
  
  // Track smoothed level for natural animation
  const smoothedLevel = useRef(0);
  const groupRef = useRef<THREE.Group>(null);

  // Ref to hold the jaw bone if found
  const jawBoneRef = useRef<THREE.Object3D | null>(null);

  // Report morph target count when loaded, and find the jaw bone
  useEffect(() => {
    let count = 0;
    let foundJaw: THREE.Object3D | null = null;
    
    scene.traverse((node: any) => {
      if (node.isMesh && node.morphTargetDictionary) {
        count += Object.keys(node.morphTargetDictionary).length;
      }
      if (node.isBone && node.name.toLowerCase().includes('jaw')) {
        foundJaw = node;
      }
    });

    jawBoneRef.current = foundJaw;

    if (onMorphTargetsCount) {
      onMorphTargetsCount(count);
    }
  }, [scene]);

  useFrame((state, delta) => {
    // Smooth the audio level to prevent jitter (lerp)
    smoothedLevel.current = THREE.MathUtils.lerp(smoothedLevel.current, audioLevel, 0.3);
    
    // Dynamic talking gesture bobbing and nodding (fallback for static models)
    if (groupRef.current) {
      // Bob up/down (Y-axis) based on speech intensity
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 16) * smoothedLevel.current * 0.035;
      
      // Nod forward/backward (X-axis rotation)
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 12) * smoothedLevel.current * 0.03;
      
      // Sway left/right (Z-axis rotation) for natural body movement
      groupRef.current.rotation.z = Math.cos(state.clock.getElapsedTime() * 8) * smoothedLevel.current * 0.015;
    }

    // Fallback: If no morph targets are present, rotate the Jaw bone
    if (jawBoneRef.current) {
      jawBoneRef.current.rotation.x = smoothedLevel.current * 0.25;
    }

    scene.traverse((node: any) => {
      if (node.isMesh && node.morphTargetDictionary) {
        // Dynamically find and animate any morph target related to jaw, mouth, visemes or lips
        Object.keys(node.morphTargetDictionary).forEach(key => {
          const lowerKey = key.toLowerCase();
          if (
            lowerKey.includes('jawopen') ||
            lowerKey.includes('mouthopen') ||
            lowerKey.includes('viseme') ||
            lowerKey.includes('lips') ||
            lowerKey.includes('mouth_open') ||
            lowerKey.includes('jaw_open')
          ) {
            const index = node.morphTargetDictionary[key];
            if (index !== undefined) {
              // Scale the movement appropriately (cap at 1.0)
              node.morphTargetInfluences[index] = Math.min(1.0, smoothedLevel.current * 1.6);
            }
          }
        });
      }
    });
  });

  return (
    <group ref={groupRef} dispose={null} position={[0, 0, 0]}>
      <primitive object={scene} />
    </group>
  );
}

// Preload the model
useGLTF.preload(require('../../assets/avatar.glb'));
