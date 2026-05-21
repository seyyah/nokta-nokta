import { useGLTF } from "@react-three/drei/native";
import { Canvas, useFrame } from "@react-three/fiber/native";
import { Asset } from "expo-asset";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import type { Group, Mesh, Object3D } from "three";
import * as THREE from "three";
import avatarSource from "../../avatar.glb";

type Props = {
  amplitude: number;
};

type MorphTarget = {
  indices: number[];
  mesh: Mesh & {
    morphTargetDictionary?: Record<string, number>;
    morphTargetInfluences?: number[];
  };
};

const avatarAsset = Asset.fromModule(avatarSource);
const avatarUri = avatarAsset.localUri ?? avatarAsset.uri;
const MOUTH_KEYS = ["mouthopen", "jawopen", "viseme_aa", "visemeaa", "v_aa", "aa", "oh"];

function findMouthIndices(dictionary?: Record<string, number>) {
  if (!dictionary) {
    return [];
  }

  return Object.entries(dictionary)
    .filter(([key]) => {
      const normalized = key.toLowerCase().replace(/[^a-z0-9_]/g, "");
      return MOUTH_KEYS.some((mouthKey) => normalized.includes(mouthKey));
    })
    .map(([, index]) => index);
}

function AvatarModel({ amplitude }: Props) {
  const groupRef = useRef<Group>(null);
  const smoothedRef = useRef(0);
  const morphTargets = useRef<MorphTarget[]>([]);
  const jawBones = useRef<Object3D[]>([]);
  const gltf = useGLTF(avatarUri);

  useEffect(() => {
    const targets: MorphTarget[] = [];
    const jaws: Object3D[] = [];

    gltf.scene.traverse((node) => {
      const mesh = node as MorphTarget["mesh"];
      const indices = findMouthIndices(mesh.morphTargetDictionary);
      if (indices.length > 0 && mesh.morphTargetInfluences) {
        targets.push({ mesh, indices });
      }

      const lowerName = node.name.toLowerCase();
      if (lowerName.includes("jaw") || lowerName.includes("mandible")) {
        jaws.push(node);
      }
    });

    morphTargets.current = targets;
    jawBones.current = jaws;
  }, [gltf.scene]);

  useFrame((state) => {
    smoothedRef.current = THREE.MathUtils.lerp(smoothedRef.current, amplitude, 0.56);
    const mouth = smoothedRef.current;

    morphTargets.current.forEach(({ mesh, indices }) => {
      indices.forEach((index) => {
        if (mesh.morphTargetInfluences) {
          mesh.morphTargetInfluences[index] = THREE.MathUtils.clamp(mouth * 1.18, 0, 1);
        }
      });
    });

    jawBones.current.forEach((jaw) => {
      jaw.rotation.x = mouth * 0.28;
    });

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.055;
      groupRef.current.position.y = -1.46 + mouth * 0.035;
    }
  });

  const scene = useMemo(() => gltf.scene, [gltf.scene]);

  return (
    <group ref={groupRef} scale={1.42} position={[0, -1.46, 0]}>
      <primitive object={scene} />
    </group>
  );
}

export function AvatarStage({ amplitude }: Props) {
  return (
    <View style={styles.stage}>
      <Canvas camera={{ fov: 34, position: [0, 1.15, 4.1] }} gl={{ antialias: true }} frameloop="always">
        <color attach="background" args={["#EEF2F7"]} />
        <ambientLight intensity={1.25} />
        <directionalLight intensity={1.65} position={[2.5, 3, 4]} />
        <directionalLight intensity={0.6} position={[-3, 1.5, 2]} />
        <Suspense fallback={null}>
          <AvatarModel amplitude={amplitude} />
        </Suspense>
      </Canvas>
    </View>
  );
}

useGLTF.preload(avatarUri);

const styles = StyleSheet.create({
  stage: {
    backgroundColor: "#EEF2F7",
    borderColor: "#CBD5E1",
    borderRadius: 8,
    borderWidth: 1,
    height: 280,
    overflow: "hidden"
  }
});
