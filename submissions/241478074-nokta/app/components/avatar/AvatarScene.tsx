
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

function Model() {
  const gltf = useGLTF(require('../../../assets/avatar.glb'));

  return <primitive object={gltf.scene} scale={1.5} position={[0,-1.5,0]} />;
}

export default function AvatarScene() {
  return (
    <Canvas camera={{ position:[0,0,3] }}>
      <ambientLight intensity={1.5} />
      <directionalLight position={[2,2,2]} />
      <Model />
    </Canvas>
  )
}
