import React, { Suspense, useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three-stdlib";
import * as THREE from "three";

type LoadedGLTF = {
  scene: THREE.Group;
};

type MorphBinding = {
  mesh: THREE.Mesh;
  index: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function findMorphIndex(mesh: any, candidates: string[]) {
  const dictionary = mesh?.morphTargetDictionary;
  if (!dictionary) return -1;

  const entries = Object.entries(dictionary) as [string, number][];

  for (const candidate of candidates) {
    const exact = entries.find(([name]) => name === candidate);
    if (exact) return exact[1];
  }

  for (const candidate of candidates) {
    const lower = candidate.toLowerCase();
    const partial = entries.find(([name]) =>
      name.toLowerCase().includes(lower)
    );
    if (partial) return partial[1];
  }

  return -1;
}

function AvatarModel({ level }: { level: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useLoader(
    GLTFLoader,
    require("./assets/avatar.glb")
  ) as unknown as LoadedGLTF;

  const mouthBindingsRef = useRef<MorphBinding[]>([]);
  const headBoneRef = useRef<THREE.Object3D | null>(null);
  const smoothOpenRef = useRef(0);

  useEffect(() => {
    const mouthBindings: MorphBinding[] = [];
    let foundHeadBone: THREE.Object3D | null = null;

    gltf.scene.traverse((obj: any) => {
      const objName = String(obj?.name || "").toLowerCase();

      if (
        !foundHeadBone &&
        (objName.includes("head") || objName.includes("neck"))
      ) {
        foundHeadBone = obj;
      }

      if (obj?.isMesh && obj.morphTargetDictionary && obj.morphTargetInfluences) {
        const mouthCandidates = [
          "jawOpen",
          "JawOpen",
          "mouthOpen",
          "MouthOpen",
          "viseme_aa",
          "viseme_AA",
          "viseme_O",
          "viseme_U",
          "A25_Jaw_Open",
          "mouth_open",
          "jaw_open",
          "aa",
          "oh",
        ];

        const mouthIndex = findMorphIndex(obj, mouthCandidates);
        if (mouthIndex >= 0) {
          mouthBindings.push({ mesh: obj as THREE.Mesh, index: mouthIndex });
        }
      }
    });

    mouthBindingsRef.current = mouthBindings;
    headBoneRef.current = foundHeadBone;
  }, [gltf.scene]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const openTarget = clamp(level * 1.7, 0, 0.95);
    smoothOpenRef.current = THREE.MathUtils.lerp(
      smoothOpenRef.current,
      openTarget,
      Math.min(1, delta * 12)
    );

    const mouthOpen = smoothOpenRef.current;

    // Natural demo framing: face + shoulders, no fake black mouth overlay.
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.022;
    groupRef.current.position.x = 0;
    groupRef.current.position.y = -3.42 + level * 0.018;
    groupRef.current.position.z = 0;
    groupRef.current.scale.setScalar(2.0 + level * 0.018);

    // Subtle speaking motion if the model has a head/neck bone.
    if (headBoneRef.current) {
      headBoneRef.current.rotation.x = mouthOpen * 0.018;
      headBoneRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 1.1) * 0.018;
    }

    // Real mouth animation only works if the GLB contains mouth/jaw blendshapes.
    if (mouthBindingsRef.current.length > 0) {
      mouthBindingsRef.current.forEach(({ mesh, index }) => {
        const influences = (mesh as any).morphTargetInfluences as
          | number[]
          | undefined;
        if (!influences || influences[index] === undefined) return;
        influences[index] = mouthOpen;
      });
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={gltf.scene} />
    </group>
  );
}

export default function AvatarScene({ level }: { level: number }) {
  return (
    <View style={styles.container}>
      <Canvas camera={{ position: [0, 1.42, 2.75], fov: 22 }}>
        <color attach="background" args={["#050814"]} />
        <ambientLight intensity={2.35} />
        <directionalLight position={[0, 3, 4]} intensity={2.7} />
        <directionalLight position={[-3, 2, 2]} intensity={1.35} />
        <pointLight position={[0, 1.8, 1.8]} intensity={2.05} />

        <Suspense fallback={null}>
          <AvatarModel level={level} />
        </Suspense>
      </Canvas>

      <View style={styles.caption}>
        <Text style={styles.title}>avatar.glb aktif</Text>
        <Text style={styles.text}>
          Current GLB does not expose reliable mouth/jaw/viseme morph targets, so RMS-based avatar motion fallback is used.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 420,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#070A14",
    borderWidth: 1,
    borderColor: "#344063",
  },
  caption: {
    position: "absolute",
    left: 16,
    bottom: 14,
    right: 16,
    backgroundColor: "rgba(8,11,24,0.76)",
    borderRadius: 14,
    padding: 12,
  },
  title: {
    color: "#7DFFCB",
    fontWeight: "900",
    fontSize: 14,
  },
  text: {
    color: "#B9C0D4",
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
});
