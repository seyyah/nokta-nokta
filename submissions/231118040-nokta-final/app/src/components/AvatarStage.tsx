import { Suspense, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { useAnimations, useGLTF } from '@react-three/drei/native';
import { AnimationClip, Group, MathUtils, Mesh, Object3D } from 'three';
import { colors } from '../theme';

type Props = {
  active: boolean;
  level: number;
};

type MorphMesh = Mesh & {
  morphTargetDictionary?: Record<string, number>;
  morphTargetInfluences?: number[];
};

const avatarAsset = require('../../avatar.glb');
const VISEME_SEQUENCE = ['viseme_aa', 'viseme_E', 'viseme_O', 'viseme_PP', 'viseme_TH', 'viseme_U'];

function AvatarModel({ active, level }: Props) {
  const groupRef = useRef<Group>(null);
  const { animations, scene } = useGLTF(avatarAsset) as unknown as {
    animations: AnimationClip[];
    scene: Group;
  };
  const bodyAnimations = useMemo(
    () =>
      animations.map(
        (clip) =>
          new AnimationClip(
            clip.name,
            clip.duration,
            clip.tracks.filter((track) => !track.name.includes('morphTargetInfluences')),
          ),
      ),
    [animations],
  );
  const { actions } = useAnimations(bodyAnimations, groupRef);
  const morphMeshes = useMemo(() => {
    const meshes: MorphMesh[] = [];
    scene.traverse((object: Object3D) => {
      const mesh = object as MorphMesh;
      if (mesh.isMesh && mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
        meshes.push(mesh);
      }
    });
    return meshes;
  }, [scene]);

  useEffect(() => {
    const firstAction = Object.values(actions)[0];
    firstAction?.reset().fadeIn(0.25).play();
    return () => {
      firstAction?.fadeOut(0.2);
    };
  }, [actions]);

  useFrame((state, delta) => {
    const spokenStrength = active ? Math.min(1, 0.28 + level * 1.45) : 0;
    const selectedViseme =
      VISEME_SEQUENCE[Math.floor(state.clock.elapsedTime * 10) % VISEME_SEQUENCE.length];

    morphMeshes.forEach((mesh) => {
      const dictionary = mesh.morphTargetDictionary!;
      const influences = mesh.morphTargetInfluences!;
      Object.entries(dictionary).forEach(([name, index]) => {
        let target = 0;
        if (name === 'viseme_sil' && !active) {
          target = 1;
        } else if (name === selectedViseme) {
          target = spokenStrength;
        } else if (name === 'jawOpen' || name === 'mouthOpen') {
          target = spokenStrength * 0.82;
        }
        influences[index] = MathUtils.damp(influences[index] ?? 0, target, 24, delta);
      });
    });

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.45) * 0.04;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1.58, 0]} rotation={[0, 0, 0]} scale={1.03}>
      <primitive object={scene} />
    </group>
  );
}

export function AvatarStage({ active, level }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.canvas}>
        <Canvas camera={{ fov: 28, position: [0, 1.42, 2.55] }}>
          <color attach="background" args={['#edf2f8']} />
          <ambientLight intensity={1.45} />
          <directionalLight intensity={1.75} position={[2, 3, 2]} />
          <directionalLight intensity={0.6} position={[-2, 1, 1]} color="#cfe4ff" />
          <Suspense fallback={null}>
            <AvatarModel active={active} level={level} />
          </Suspense>
        </Canvas>
      </View>
      <View style={styles.badge}>
        <View style={[styles.dot, active && styles.dotLive]} />
        <Text style={styles.badgeText}>{active ? 'LIVE LIPSYNC' : 'SILENT IDLE'}</Text>
      </View>
      <Text style={styles.caption}>Avaturn facial blendshapes / RMS-driven viseme response</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  canvas: {
    height: 344,
  },
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.canvas,
    borderRadius: 6,
    flexDirection: 'row',
    gap: 6,
    marginHorizontal: 14,
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  dot: {
    backgroundColor: '#adb8c7',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  dotLive: {
    backgroundColor: colors.voice,
  },
  badgeText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '700',
  },
  caption: {
    color: colors.muted,
    fontSize: 11,
    margin: 14,
    marginTop: 10,
  },
});
