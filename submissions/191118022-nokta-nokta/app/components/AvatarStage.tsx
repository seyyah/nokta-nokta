import { Canvas, useFrame } from '@react-three/fiber/native';
import React, { useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Group, Mesh } from 'three';
import { palette } from '../lib/theme';

type AvatarStageProps = {
  level: number;
  transcript: string;
};

export function AvatarStage({ level, transcript }: AvatarStageProps) {
  const viseme = useMemo(() => pickViseme(transcript), [transcript]);

  return (
    <View style={styles.wrapper}>
      <Canvas camera={{ position: [0, 0.05, 4.4], fov: 36 }} style={styles.canvas}>
        <color args={['#eaf1ff']} attach="background" />
        <ambientLight intensity={0.9} />
        <directionalLight intensity={1.35} position={[4, 5, 4]} />
        <pointLight color="#38bdf8" intensity={0.9} position={[-3, 2.8, 4]} />
        <ProceduralAvatar level={level} viseme={viseme} />
      </Canvas>

      <View style={styles.overlay}>
        <Text style={styles.badge}>avatar.glb slot</Text>
        <Text style={styles.note}>
          Kendi Avaturn dosyan gelince bu sahne `.glb` mount'a çevrilecek; şu an lipsync
          pipeline ve latency hissi fallback yüzeyle test ediliyor.
        </Text>
      </View>
    </View>
  );
}

function ProceduralAvatar({ level, viseme }: { level: number; viseme: string }) {
  const group = useRef<Group>(null);
  const mouth = useRef<Mesh>(null);
  const browLeft = useRef<Mesh>(null);
  const browRight = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = Math.max(level, 0.04);

    if (group.current) {
      group.current.position.y = Math.sin(t * 1.4) * 0.035 + pulse * 0.04;
      group.current.rotation.y = Math.sin(t * 0.65) * 0.11;
      group.current.rotation.x = Math.sin(t * 0.4) * 0.045;
    }

    if (mouth.current) {
      const visemeBoost = viseme === 'A' ? 1.25 : viseme === 'O' ? 0.82 : viseme === 'E' ? 0.55 : 0.35;
      const targetY = 0.25 + pulse * 2.6 * visemeBoost;
      const targetX = viseme === 'O' ? 0.62 : viseme === 'E' ? 1.4 : 1;
      mouth.current.scale.y = lerp(mouth.current.scale.y, targetY, 0.24);
      mouth.current.scale.x = lerp(mouth.current.scale.x, targetX, 0.22);
    }

    if (browLeft.current && browRight.current) {
      const lift = pulse * 0.16 + Math.sin(t * 2.8) * 0.025;
      browLeft.current.position.y = 0.44 + lift;
      browRight.current.position.y = 0.44 + lift;
    }
  });

  return (
    <group ref={group} scale={0.95}>
      <mesh position={[0, 0.02, 0]} scale={[0.92, 1.08, 0.72]}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial color="#f4d6c7" roughness={0.48} metalness={0.02} />
      </mesh>

      <mesh position={[-0.32, 0.16, 0.72]}>
        <sphereGeometry args={[0.09, 24, 24]} />
        <meshStandardMaterial color="#172033" roughness={0.25} />
      </mesh>
      <mesh position={[0.32, 0.16, 0.72]}>
        <sphereGeometry args={[0.09, 24, 24]} />
        <meshStandardMaterial color="#172033" roughness={0.25} />
      </mesh>

      <mesh ref={browLeft} position={[-0.34, 0.45, 0.72]} rotation={[0, 0, -0.18]}>
        <boxGeometry args={[0.3, 0.045, 0.045]} />
        <meshStandardMaterial color="#273447" />
      </mesh>
      <mesh ref={browRight} position={[0.34, 0.45, 0.72]} rotation={[0, 0, 0.18]}>
        <boxGeometry args={[0.3, 0.045, 0.045]} />
        <meshStandardMaterial color="#273447" />
      </mesh>

      <mesh position={[0, -0.03, 0.78]} scale={[0.16, 0.22, 0.1]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial color="#d99482" roughness={0.54} />
      </mesh>

      <mesh ref={mouth} position={[0, -0.34, 0.78]} scale={[1, 0.4, 1]}>
        <torusGeometry args={[0.2, 0.045, 18, 36, Math.PI * 2]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.35} />
      </mesh>

      <mesh position={[0, -0.95, 0]} scale={[0.94, 0.38, 0.52]}>
        <sphereGeometry args={[1, 36, 36]} />
        <meshStandardMaterial color="#0f766e" roughness={0.45} />
      </mesh>
    </group>
  );
}

function pickViseme(text: string) {
  const last = text.trim().slice(-1).toLocaleLowerCase('tr-TR');
  if ('aı'.includes(last)) return 'A';
  if ('oöuü'.includes(last)) return 'O';
  if ('ei'.includes(last)) return 'E';
  return 'M';
}

function lerp(current: number, target: number, alpha: number) {
  return current + (target - current) * alpha;
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#dbeafe',
    borderColor: '#bfdbfe',
    borderRadius: 30,
    borderWidth: 1,
    height: 430,
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
  },
  overlay: {
    backgroundColor: 'rgba(255, 250, 241, 0.92)',
    borderColor: palette.line,
    borderRadius: 22,
    borderWidth: 1,
    bottom: 14,
    left: 14,
    padding: 12,
    position: 'absolute',
    right: 14,
    gap: 5,
  },
  badge: {
    color: palette.accent,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  note: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
});
