import React, { useRef, useEffect, Suspense } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { useGLTF, Environment } from '@react-three/drei/native';
import * as THREE from 'three';

// Prevent Expo from crashing when importing three.js textures without specific loaders
// We use a basic setup to render the Avaturn GLB.

function Avatar({ speakingRMS }: { speakingRMS: number }) {
  const { scene } = useGLTF(require('./avatar.glb'));
  const headBone = useRef<THREE.Bone>();
  const spineBone = useRef<THREE.Bone>();
  const leftArmBone = useRef<THREE.Bone>();
  const rightArmBone = useRef<THREE.Bone>();
  const faceMesh = useRef<THREE.Mesh>();

  useEffect(() => {
    scene.traverse((child) => {
      const bone = child as THREE.Bone;
      const mesh = child as THREE.Mesh;
      
      if (bone.isBone) {
        if (bone.name === 'Head') headBone.current = bone;
        if (bone.name === 'Spine2') spineBone.current = bone;
        if (bone.name === 'LeftArm') leftArmBone.current = bone;
        if (bone.name === 'RightArm') rightArmBone.current = bone;
      }
      
      if (mesh.isMesh && mesh.morphTargetDictionary) {
        faceMesh.current = mesh;
      }
    });

    // Auto-framing: scale + shift so the head sits centered at the origin
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    
    const headRegionHeight = size.y * 0.13;
    const targetHeadHeight = 0.55;
    const scale = headRegionHeight > 1e-4 ? targetHeadHeight / headRegionHeight : 1;
    scene.scale.setScalar(scale);

    const box2 = new THREE.Box3().setFromObject(scene);
    const center2 = box2.getCenter(new THREE.Vector3());
    const top2 = box2.max.y;
    const headCenterY = top2 - (targetHeadHeight * 0.5);
    scene.position.set(-center2.x, -headCenterY, -center2.z);
  }, [scene]);

  useFrame((state) => {
    if (headBone.current) {
      const targetNod = Math.sin(state.clock.elapsedTime * 25) * speakingRMS * 0.6;
      headBone.current.rotation.x = THREE.MathUtils.lerp(headBone.current.rotation.x, targetNod, 0.4);
    }
    if (spineBone.current) {
      spineBone.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      spineBone.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
    }
    if (leftArmBone.current) leftArmBone.current.rotation.z = 1.2;
    if (rightArmBone.current) rightArmBone.current.rotation.z = -1.2;
    
    // Advanced True Lip-Sync (if blendshapes exist)
    if (faceMesh.current?.morphTargetDictionary && faceMesh.current?.morphTargetInfluences) {
      const dict = faceMesh.current.morphTargetDictionary;
      const influences = faceMesh.current.morphTargetInfluences;
      const targetVolume = Math.min(1, speakingRMS * 3.5);
      
      const robustKeys = [
        ['viseme_aa', 'viseme_AA', 'aa', 'mouthOpen', 'jawOpen'],
        ['viseme_O', 'viseme_oh', 'oh', 'mouthPucker'],
        ['viseme_E', 'viseme_EE', 'viseme_I', 'mouthSmile'],
        ['viseme_U', 'viseme_UU', 'mouthPucker']
      ];
      
      const ciDict = Object.fromEntries(Object.entries(dict).map(([k, v]) => [k.toLowerCase(), v]));

      robustKeys.forEach((keyArray, index) => {
        let foundIdx = -1;
        for (const name of keyArray) {
          if (dict[name] !== undefined) { foundIdx = dict[name]; break; }
          if (ciDict[name.toLowerCase()] !== undefined) { foundIdx = ciDict[name.toLowerCase()]; break; }
        }
        
        if (foundIdx !== -1) {
          // Unique math for sine wave lip flutter
          const flutter = Math.sin(state.clock.elapsedTime * 15 + index) * 0.2;
          influences[foundIdx] = THREE.MathUtils.lerp(
            influences[foundIdx],
            targetVolume * 0.8 + (targetVolume > 0.1 ? flutter * targetVolume : 0),
            0.4
          );
        }
      });
    }
  });

  return <primitive object={scene} />;
}

export default function NoktaMascot3D({ speakingRMS = 0, size = 140 }: { speakingRMS?: number, size?: number }) {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[0, 2, 5]} intensity={2} />
        <Suspense fallback={null}>
          <Environment preset="city" />
          <Avatar speakingRMS={speakingRMS} />
        </Suspense>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#1E1E28',
    marginRight: 15,
    borderWidth: 3,
    borderColor: '#A882FF',
  },
});
