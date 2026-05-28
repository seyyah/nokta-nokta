import React, { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei/native';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';

export function Avatar3D({ modelUri, audioLevelRef, persona, isListening }) {
  // Load the model from assets
  const { scene, materials } = useGLTF(modelUri);
  const groupRef = useRef();

  const headMeshRef = useRef(null);
  const teethMeshRef = useRef(null);

  // Traverse the scene on load to find meshes with morph targets
  useEffect(() => {
    headMeshRef.current = null;
    teethMeshRef.current = null;
    
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh && child.morphTargetDictionary) {
          // Check for head mesh (Ready Player Me uses Wolf3D_Head, Avaturn uses avaturn_body)
          if (child.name.includes('Head') || child.name === 'avaturn_body') {
            headMeshRef.current = child;
          }
          // Check for teeth mesh (optional, Ready Player Me uses Wolf3D_Teeth)
          if (child.name.includes('Teeth')) {
            teethMeshRef.current = child;
          }
        }
      });
    }
  }, [scene]);

  // Modify materials dynamically based on selected Persona (if Ready Player Me materials are available)
  useEffect(() => {
    if (materials) {
      if (persona === 'junior-sen') {
        if (materials.Wolf3D_Outfit_Top) materials.Wolf3D_Outfit_Top.color.set('#f97316');
        if (materials.Wolf3D_Outfit_Bottom) materials.Wolf3D_Outfit_Bottom.color.set('#3b82f6');
        if (materials.Wolf3D_Skin) materials.Wolf3D_Skin.color.set('#fdf2e9');
      } else {
        if (materials.Wolf3D_Outfit_Top) materials.Wolf3D_Outfit_Top.color.set('#1e293b');
        if (materials.Wolf3D_Outfit_Bottom) materials.Wolf3D_Outfit_Bottom.color.set('#0f172a');
        if (materials.Wolf3D_Skin) materials.Wolf3D_Skin.color.set('#fafafa');
      }
    }
  }, [persona, materials]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const level = audioLevelRef.current;

    // 1. Idle & Speech Movements
    if (groupRef.current) {
      const head = groupRef.current.getObjectByName('Head');
      if (head) {
        if (persona === 'junior-sen') {
          const jitterSpeed = isListening ? 15 : 6;
          const jitterAmount = isListening ? 0.04 : 0.02;
          head.rotation.y = Math.sin(t * jitterSpeed) * jitterAmount + Math.sin(t * 0.5) * 0.1;
          head.rotation.x = Math.cos(t * (jitterSpeed - 2)) * jitterAmount - 0.05;
          head.rotation.z = Math.sin(t * 2) * 0.03;
        } else {
          head.rotation.y = Math.sin(t * 1.5) * 0.06;
          head.rotation.x = Math.cos(t * 1.2) * 0.03 - 0.02;
          head.rotation.z = 0;
        }
      }

      if (persona === 'junior-sen' && isListening) {
        groupRef.current.position.y = -3.2 + Math.sin(t * 25) * 0.005;
      } else {
        groupRef.current.position.y = -3.2 + Math.sin(t * 1.5) * 0.01;
      }
    }

    // 2. Real-time Lip Sync (Viseme Morph Targets)
    const headMesh = headMeshRef.current;
    const teethMesh = teethMeshRef.current;

    if (headMesh && headMesh.morphTargetDictionary) {
      const headMorphs = headMesh.morphTargetDictionary;
      const headInfluences = headMesh.morphTargetInfluences;

      const teethMorphs = teethMesh ? teethMesh.morphTargetDictionary : null;
      const teethInfluences = teethMesh ? teethMesh.morphTargetInfluences : null;

      const targetMouthOpen = level * (persona === 'junior-sen' ? 1.6 : 1.2);

      const setMorph = (targetName, val, lerpFactor = 0.25) => {
        const headIdx = headMorphs[targetName];
        if (headIdx !== undefined && headInfluences) {
          headInfluences[headIdx] = THREE.MathUtils.lerp(headInfluences[headIdx], val, lerpFactor);
        }
        if (teethMorphs && teethInfluences) {
          const teethIdx = teethMorphs[targetName];
          if (teethIdx !== undefined) {
            teethInfluences[teethIdx] = THREE.MathUtils.lerp(teethInfluences[teethIdx], val, lerpFactor);
          }
        }
      };

      if (level > 0.04) {
        const cycle = Math.sin(t * 18);
        setMorph('viseme_AA', targetMouthOpen);
        if (cycle > 0.3) {
          setMorph('viseme_O', targetMouthOpen * 0.7);
          setMorph('viseme_U', 0);
          setMorph('viseme_I', 0);
        } else if (cycle < -0.3) {
          setMorph('viseme_O', 0);
          setMorph('viseme_U', targetMouthOpen * 0.8);
          setMorph('viseme_I', 0);
        } else {
          setMorph('viseme_O', 0);
          setMorph('viseme_U', 0);
          setMorph('viseme_I', targetMouthOpen * 0.6);
        }
      } else {
        setMorph('viseme_AA', 0, 0.15);
        setMorph('viseme_O', 0, 0.15);
        setMorph('viseme_U', 0, 0.15);
        setMorph('viseme_I', 0, 0.15);
      }
    }
  });

  return (
    <group ref={groupRef} dispose={null} position={[0, -3.2, 0]} scale={2.1}>
      <primitive object={scene} />
    </group>
  );
}
