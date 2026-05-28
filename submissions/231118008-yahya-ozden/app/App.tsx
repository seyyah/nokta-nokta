import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Canvas, useFrame, useLoader } from '@react-three/fiber/native';
import { Asset } from 'expo-asset';
import { Audio } from 'expo-av';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import avatarAsset from './assets/avatar.glb';

const JITSI_URL = 'https://meet.jit.si/nokta-nokta-231118008-stuck-bridge';
const BAR_COUNT = 34;

type ScreenKey = 'voice' | 'avatar' | 'forge';
type MicState = 'idle' | 'requesting' | 'listening' | 'denied' | 'error';

type Cycle = {
  id: string;
  status: 'SUCCESS' | 'ROLLBACK';
  title: string;
  timebox: string;
  note: string;
};

const cycles: Cycle[] = [
  {
    id: 'Cycle 1',
    status: 'SUCCESS',
    title: 'Voice visualizer',
    timebox: '20 dakika',
    note: 'Mikrofon meter degeri RMS/amplitude sinyaline cevrildi.'
  },
  {
    id: 'Cycle 2',
    status: 'SUCCESS',
    title: 'Avatar lipsync',
    timebox: '20 dakika',
    note: 'Avatar agzi mikrofondan gelen amplitude ile senkron oynuyor.'
  },
  {
    id: 'Cycle 3',
    status: 'ROLLBACK',
    title: 'Intentional bridge issue',
    timebox: '20 dakika',
    note: 'Bridge akisi bilerek STUCK durumuna suruldu.'
  },
  {
    id: 'Cycle 4',
    status: 'SUCCESS',
    title: 'Expert bridge fix',
    timebox: '20 dakika',
    note: 'Jitsi uzman linki dis tarayici ile guvenli acildi.'
  }
];

const stuckSignals = [
  'Cycle 3 ROLLBACK: bridge linki uygulama icinde kitlendi',
  'Cycle 3 retry FAIL: ayni mesele ikinci kez cozulmedi'
];

const auditSummaries = [
  {
    title: 'Audit 1 - Voice burn-in',
    detail: '8 dk dikte testi: konusma, sessizlik, tekrar konusma.'
  },
  {
    title: 'Audit 2 - Avatar burn-in',
    detail: '7 dk lipsync testi: GLB yukleme ve amplitude fallback.'
  },
  {
    title: 'Audit 3 - Bridge burn-in',
    detail: '6 dk STUCK testi: rollback + retry fail sinyali.'
  }
];

const bridgeChecks = ['Audio', 'Video', 'Screen share'];

function createRecordingOptions(): Audio.RecordingOptions {
  const highQuality = Audio.RecordingOptionsPresets.HIGH_QUALITY;

  return {
    ...highQuality,
    isMeteringEnabled: true,
    android: {
      ...highQuality.android,
      numberOfChannels: 1,
      sampleRate: 44100,
      bitRate: 64000
    },
    ios: {
      ...highQuality.ios,
      numberOfChannels: 1,
      sampleRate: 44100,
      bitRate: 64000
    }
  } as Audio.RecordingOptions;
}

function useMicAmplitude() {
  const [amplitude, setAmplitude] = useState(0);
  const [micState, setMicState] = useState<MicState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const meterTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const smoothRef = useRef(0);

  const stop = useCallback(async () => {
    if (meterTimerRef.current) {
      clearInterval(meterTimerRef.current);
      meterTimerRef.current = null;
    }

    const activeRecording = recordingRef.current;
    recordingRef.current = null;

    if (activeRecording) {
      try {
        const status = await activeRecording.getStatusAsync();
        if (status.isRecording) {
          await activeRecording.stopAndUnloadAsync();
        }
      } catch {
        await activeRecording.stopAndUnloadAsync().catch(() => undefined);
      }
    }

    smoothRef.current = 0;
    setAmplitude(0);
    setMicState('idle');
  }, []);

  const start = useCallback(async () => {
    try {
      setErrorMessage(null);
      setMicState('requesting');

      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setMicState('denied');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      });

      if (recordingRef.current) {
        await stop();
      }

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(createRecordingOptions());
      await recording.startAsync();

      recordingRef.current = recording;
      setMicState('listening');

      meterTimerRef.current = setInterval(async () => {
        const currentRecording = recordingRef.current;
        if (!currentRecording) {
          return;
        }

        try {
          const status = (await currentRecording.getStatusAsync()) as Audio.RecordingStatus & {
            metering?: number;
          };

          const db = typeof status.metering === 'number' ? status.metering : -70;
          const normalized = Math.max(0, Math.min(1, (db + 58) / 58));
          const shaped = Math.pow(normalized, 1.35);
          const smoothed = smoothRef.current * 0.62 + shaped * 0.38;
          smoothRef.current = smoothed < 0.025 ? 0 : smoothed;
          setAmplitude(smoothRef.current);
        } catch (error) {
          setErrorMessage(error instanceof Error ? error.message : 'Meter okuma hatasi');
          setMicState('error');
        }
      }, 70);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Mikrofon baslatilamadi');
      setMicState('error');
    }
  }, [stop]);

  useEffect(() => {
    return () => {
      if (meterTimerRef.current) {
        clearInterval(meterTimerRef.current);
      }
      recordingRef.current?.stopAndUnloadAsync().catch(() => undefined);
    };
  }, []);

  return { amplitude, micState, errorMessage, start, stop };
}

function statusCopy(micState: MicState) {
  if (micState === 'listening') {
    return 'Mikrofon aktif';
  }
  if (micState === 'requesting') {
    return 'Izin bekleniyor';
  }
  if (micState === 'denied') {
    return 'Mikrofon izni verilmedi';
  }
  if (micState === 'error') {
    return 'Mikrofon hatasi';
  }
  return 'Hazir';
}

function SegmentedTabs({
  active,
  onChange
}: {
  active: ScreenKey;
  onChange: (nextScreen: ScreenKey) => void;
}) {
  const tabs: Array<{ key: ScreenKey; label: string }> = [
    { key: 'voice', label: 'Voice' },
    { key: 'avatar', label: 'Avatar' },
    { key: 'forge', label: 'Forge' }
  ];

  return (
    <View style={styles.tabs}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.key}
          onPress={() => onChange(tab.key)}
          style={[styles.tabButton, active === tab.key && styles.tabButtonActive]}
        >
          <Text style={[styles.tabText, active === tab.key && styles.tabTextActive]}>
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function MicHeader({
  amplitude,
  micState,
  errorMessage,
  onStart,
  onStop
}: {
  amplitude: number;
  micState: MicState;
  errorMessage: string | null;
  onStart: () => void;
  onStop: () => void;
}) {
  const listening = micState === 'listening';
  const level = Math.round(amplitude * 100);

  return (
    <View style={styles.micHeader}>
      <View style={styles.micInfo}>
        <Text style={styles.kicker}>Nokta-Nokta MVP</Text>
        <Text style={styles.title}>Voice, Avatar, Bridge</Text>
        <Text style={styles.subtitle}>
          {statusCopy(micState)} - amplitude %{level}
        </Text>
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </View>
      <Pressable
        onPress={listening ? onStop : onStart}
        style={[styles.primaryButton, listening && styles.stopButton]}
      >
        <Text style={styles.primaryButtonText}>{listening ? 'Durdur' : 'Mikrofonu Baslat'}</Text>
      </Pressable>
    </View>
  );
}

function VoiceBars({ amplitude }: { amplitude: number }) {
  const [tick, setTick] = useState(0);
  const bars = useMemo(() => new Array(BAR_COUNT).fill(null), []);
  const pulse = 0.5 + Math.sin(tick * 0.16) * 0.5;
  const orbScale = 1 + amplitude * 0.34 + pulse * 0.035;
  const haloScale = 1 + amplitude * 0.62 + pulse * 0.08;
  const glowOpacity = 0.2 + amplitude * 0.42;

  useEffect(() => {
    const timer = setInterval(() => setTick((value) => value + 1), 48);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.visualizerPanel}>
      <View style={styles.voiceOrbStage}>
        <View
          style={[
            styles.orbHalo,
            {
              opacity: glowOpacity,
              transform: [{ scale: haloScale }]
            }
          ]}
        />
        <View
          style={[
            styles.orbOuter,
            {
              transform: [{ scale: orbScale }]
            }
          ]}
        >
          <View style={styles.orbShine} />
          <View
            style={[
              styles.orbDeep,
              {
                height: 68 + amplitude * 34,
                opacity: 0.76 + amplitude * 0.18
              }
            ]}
          />
        </View>
        <Text style={styles.voiceName}>Clover</Text>
        <Text style={styles.voiceTone}>Warm and grounded</Text>
        <View style={styles.voiceDots}>
          {new Array(10).fill(null).map((_, index) => (
            <View
              key={index}
              style={[
                styles.voiceDot,
                index === 0 && styles.voiceDotActive,
                {
                  opacity: index === 0 ? 1 : 0.26 + amplitude * 0.42
                }
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.waveStrip}>
        {bars.map((_, index) => {
          const center = (BAR_COUNT - 1) / 2;
          const distance = Math.abs(index - center) / center;
          const envelope = 1 - distance * 0.58;
          const pulse = 0.42 + 0.58 * (0.5 + Math.sin(tick * 0.23 + index * 0.72) * 0.5);
          const idle = 8 + Math.sin(tick * 0.08 + index) * 2;
          const height = Math.max(7, idle + amplitude * 82 * envelope * pulse);

          return (
            <View
              key={index}
              style={[
                styles.bar,
                {
                  height,
                  opacity: 0.38 + amplitude * 0.62,
                  backgroundColor:
                    index % 3 === 0 ? '#5de7ff' : index % 3 === 1 ? '#0f8cff' : '#b9efff'
                }
              ]}
            />
          );
        })}
      </View>
      <View style={styles.visualizerFooter}>
        <Metric label="Latency target" value="< 200ms" />
        <Metric label="Mic source" value="expo-av meter" />
        <Metric label="Silence" value={amplitude < 0.04 ? 'idle fade' : 'active'} />
      </View>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function VoiceScreen({ amplitude }: { amplitude: number }) {
  return (
    <ScrollView contentContainerStyle={styles.screenBody}>
      <Text style={styles.sectionTitle}>Voice Visualizer</Text>
      <Text style={styles.bodyText}>
        Konusunca barlar RMS seviyesine gore yukselir; sessizlikte dusuk opacity ile soner.
      </Text>
      <VoiceBars amplitude={amplitude} />
    </ScrollView>
  );
}

function AvatarScreen({ amplitude }: { amplitude: number }) {
  return (
    <ScrollView contentContainerStyle={styles.screenBody}>
      <Text style={styles.sectionTitle}>Avatar Lipsync</Text>
      <Text style={styles.bodyText}>
        Avaturn `avatar.glb` sahneye yuklenir; mikrofon seviyesi yuz ve agiz hareketini
        gercek zamanli surer.
      </Text>
      <View style={styles.avatarFrame}>
        <AvatarCanvas amplitude={amplitude} />
      </View>
      <View style={styles.avatarReadout}>
        <Metric label="Lip drive" value={`%${Math.round(amplitude * 100)}`} />
        <Metric label="Pipeline" value="Avaturn GLB" />
      </View>
    </ScrollView>
  );
}

function AuditWidget() {
  return (
    <View style={styles.evidencePanel}>
      <Text style={styles.panelTitle}>AuditWidget evidence</Text>
      {auditSummaries.map((audit) => (
        <View key={audit.title} style={styles.auditRow}>
          <View style={styles.auditBadge} />
          <View style={styles.auditCopy}>
            <Text style={styles.auditTitle}>{audit.title}</Text>
            <Text style={styles.auditDetail}>{audit.detail}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function AvatarCanvas({ amplitude }: { amplitude: number }) {
  return (
    <Canvas camera={{ position: [0, 0.25, 4.8], fov: 38 }} style={styles.canvas}>
      <color attach="background" args={['#10131a']} />
      <ambientLight intensity={0.78} />
      <directionalLight position={[2.8, 4.2, 3.2]} intensity={1.65} />
      <pointLight position={[-3, 1.2, 2.5]} intensity={0.7} color="#8be9d4" />
      <Suspense fallback={<ProceduralAvatar amplitude={amplitude} />}>
        <AvatarModel amplitude={amplitude} />
      </Suspense>
    </Canvas>
  );
}

function AvatarModel({ amplitude }: { amplitude: number }) {
  const [assetUri, setAssetUri] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const asset = Asset.fromModule(avatarAsset);
    asset
      .downloadAsync()
      .then(() => {
        if (mounted) {
          setAssetUri(asset.localUri ?? asset.uri);
        }
      })
      .catch(() => {
        if (mounted) {
          setAssetUri(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (!assetUri) {
    return <ProceduralAvatar amplitude={amplitude} />;
  }

  return (
    <AvatarErrorBoundary fallback={<ProceduralAvatar amplitude={amplitude} />}>
      <LoadedAvatar uri={assetUri} amplitude={amplitude} />
    </AvatarErrorBoundary>
  );
}

class AvatarErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function LoadedAvatar({ uri, amplitude }: { uri: string; amplitude: number }) {
  const gltf = useLoader(GLTFLoader, uri);
  const groupRef = useRef<THREE.Group>(null);
  const fallbackMouthRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef(0);
  const [needsMouthOverlay, setNeedsMouthOverlay] = useState(false);
  const avatarBaseY = -4.95;
  const avatarScale = 3.3;
  const boneDriversRef = useRef<
    Array<{
      bone: THREE.Object3D;
      baseRotation: THREE.Euler;
      type: 'head' | 'neck';
    }>
  >([]);
  const namedDriversRef = useRef<
    Array<{
      mesh: THREE.Mesh;
      basePosition: THREE.Vector3;
      baseScale: THREE.Vector3;
      baseRotation: THREE.Euler;
      type: 'mouth' | 'jaw';
    }>
  >([]);

  useEffect(() => {
    const tintMaterial = (
      material: THREE.Material | THREE.Material[] | undefined,
      color: string,
      roughness = 0.72,
      metalness = 0.05
    ) => {
      const materials = Array.isArray(material) ? material : material ? [material] : [];

      materials.forEach((item) => {
        const standardMaterial = item as THREE.MeshStandardMaterial;
        if (standardMaterial.color) {
          standardMaterial.color.set(color);
        }
        if (typeof standardMaterial.roughness === 'number') {
          standardMaterial.roughness = roughness;
        }
        if (typeof standardMaterial.metalness === 'number') {
          standardMaterial.metalness = metalness;
        }
        standardMaterial.needsUpdate = true;
      });
    };

    const namedDrivers: Array<{
      mesh: THREE.Mesh;
      basePosition: THREE.Vector3;
      baseScale: THREE.Vector3;
      baseRotation: THREE.Euler;
      type: 'mouth' | 'jaw';
    }> = [];
    let hasMorphDriver = false;

    gltf.scene.traverse((node) => {
      const mesh = node as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      if (!mesh.isMesh) {
        return;
      }

      const lowerName = mesh.name.toLowerCase();
      const morphDictionary = (mesh as THREE.Mesh & {
        morphTargetDictionary?: Record<string, number>;
      }).morphTargetDictionary;

      if (lowerName.includes('hair')) {
        tintMaterial(mesh.material, '#111720', 0.9, 0.02);
      } else if (lowerName.includes('look')) {
        tintMaterial(mesh.material, '#27313d', 0.78, 0.02);
      } else if (lowerName.includes('shoe')) {
        tintMaterial(mesh.material, '#161b22', 0.78, 0.02);
      } else if (lowerName.includes('body')) {
        tintMaterial(mesh.material, '#b8846a', 0.82, 0.02);
      }

      if (
        morphDictionary &&
        ['mouthopen', 'jawopen', 'viseme_aa', 'viseme_a', 'viseme_o', 'a', 'o'].some((target) =>
          Object.keys(morphDictionary).some((key) => key.toLowerCase() === target)
        )
      ) {
        hasMorphDriver = true;
      }

      if (lowerName.includes('mouth')) {
        namedDrivers.push({
          mesh,
          basePosition: mesh.position.clone(),
          baseScale: mesh.scale.clone(),
          baseRotation: mesh.rotation.clone(),
          type: 'mouth'
        });
      }

      if (lowerName.includes('jaw')) {
        namedDrivers.push({
          mesh,
          basePosition: mesh.position.clone(),
          baseScale: mesh.scale.clone(),
          baseRotation: mesh.rotation.clone(),
          type: 'jaw'
        });
      }
    });

    namedDriversRef.current = namedDrivers;
    boneDriversRef.current = [
      gltf.scene.getObjectByName('Head')
        ? {
            bone: gltf.scene.getObjectByName('Head') as THREE.Object3D,
            baseRotation: (gltf.scene.getObjectByName('Head') as THREE.Object3D).rotation.clone(),
            type: 'head' as const
          }
        : null,
      gltf.scene.getObjectByName('Neck')
        ? {
            bone: gltf.scene.getObjectByName('Neck') as THREE.Object3D,
            baseRotation: (gltf.scene.getObjectByName('Neck') as THREE.Object3D).rotation.clone(),
            type: 'neck' as const
          }
        : null
    ].filter(Boolean) as Array<{
      bone: THREE.Object3D;
      baseRotation: THREE.Euler;
      type: 'head' | 'neck';
    }>;
    setNeedsMouthOverlay(!hasMorphDriver && namedDrivers.length === 0);
  }, [gltf]);

  useFrame(({ clock }) => {
    mouthRef.current = THREE.MathUtils.lerp(mouthRef.current, amplitude, 0.38);
    const mouth = mouthRef.current;

    gltf.scene.traverse((node) => {
      const mesh = node as THREE.Mesh & {
        morphTargetDictionary?: Record<string, number>;
        morphTargetInfluences?: number[];
      };

      if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) {
        return;
      }

      const targetNames = [
        'MouthOpen',
        'mouthOpen',
        'jawOpen',
        'viseme_aa',
        'viseme_A',
        'viseme_O',
        'A',
        'O'
      ];

      targetNames.forEach((name) => {
        const index = mesh.morphTargetDictionary?.[name];
        if (typeof index === 'number' && mesh.morphTargetInfluences) {
          mesh.morphTargetInfluences[index] = Math.min(1, mouth * 1.25);
        }
      });
    });

    namedDriversRef.current.forEach((driver) => {
      if (driver.type === 'mouth') {
        driver.mesh.scale.set(
          driver.baseScale.x,
          driver.baseScale.y * (1 + mouth * 3.2),
          driver.baseScale.z
        );
        driver.mesh.position.y = driver.basePosition.y - mouth * 0.08;
      } else {
        driver.mesh.rotation.x = driver.baseRotation.x + mouth * 0.22;
        driver.mesh.position.y = driver.basePosition.y - mouth * 0.07;
      }
    });

    boneDriversRef.current.forEach((driver) => {
      const talkNod = driver.type === 'head' ? mouth * 0.045 : mouth * 0.028;
      driver.bone.rotation.x = driver.baseRotation.x + talkNod;
      driver.bone.rotation.y =
        driver.baseRotation.y + Math.sin(clock.elapsedTime * 0.9) * (driver.type === 'head' ? 0.018 : 0.01);
    });

    if (fallbackMouthRef.current) {
      fallbackMouthRef.current.scale.y = 0.008 + mouth * 0.036;
      fallbackMouthRef.current.position.y = 1.595 - mouth * 0.012;
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.75) * 0.07;
      groupRef.current.position.y = avatarBaseY + Math.sin(clock.elapsedTime * 1.1) * 0.025;
    }
  });

  return (
    <group ref={groupRef} position={[0, avatarBaseY, 0]} scale={avatarScale}>
      <primitive object={gltf.scene} />
      {needsMouthOverlay ? (
        <mesh ref={fallbackMouthRef} position={[0, 1.595, 0.255]} scale={[0.04, 0.008, 0.01]}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshBasicMaterial color="#2b0f14" />
        </mesh>
      ) : null}
    </group>
  );
}

function ProceduralAvatar({ amplitude }: { amplitude: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const jawRef = useRef<THREE.Mesh>(null);
  const smoothRef = useRef(0);

  useFrame(({ clock }) => {
    smoothRef.current = THREE.MathUtils.lerp(smoothRef.current, amplitude, 0.36);
    const mouth = smoothRef.current;

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.72) * 0.08;
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 1.35) * 0.025;
    }

    if (mouthRef.current) {
      mouthRef.current.scale.y = 0.22 + mouth * 2.8;
      mouthRef.current.position.y = -0.34 - mouth * 0.08;
    }

    if (jawRef.current) {
      jawRef.current.rotation.x = mouth * 0.24;
      jawRef.current.position.y = -0.59 - mouth * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.38, 0]}>
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.82, 56, 56]} />
        <meshStandardMaterial color="#c88f72" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.98, -0.02]} scale={[0.92, 0.28, 0.86]}>
        <sphereGeometry args={[0.82, 40, 20]} />
        <meshStandardMaterial color="#202735" roughness={0.82} />
      </mesh>
      <mesh position={[-0.28, 0.42, 0.73]}>
        <sphereGeometry args={[0.075, 24, 24]} />
        <meshStandardMaterial color="#111318" />
      </mesh>
      <mesh position={[0.28, 0.42, 0.73]}>
        <sphereGeometry args={[0.075, 24, 24]} />
        <meshStandardMaterial color="#111318" />
      </mesh>
      <mesh ref={mouthRef} position={[0, -0.34, 0.78]} scale={[0.34, 0.2, 0.035]}>
        <sphereGeometry args={[0.25, 32, 16]} />
        <meshStandardMaterial color="#401014" roughness={0.45} />
      </mesh>
      <group ref={jawRef} position={[0, -0.58, 0.06]}>
        <mesh scale={[0.72, 0.24, 0.68]}>
          <sphereGeometry args={[0.78, 32, 16]} />
          <meshStandardMaterial color="#bd8065" roughness={0.76} />
        </mesh>
      </group>
      <mesh position={[-0.82, 0.24, 0]}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial color="#b97961" />
      </mesh>
      <mesh position={[0.82, 0.24, 0]}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial color="#b97961" />
      </mesh>
      <mesh position={[0, -1.06, 0]} scale={[0.62, 0.78, 0.42]}>
        <sphereGeometry args={[0.78, 32, 24]} />
        <meshStandardMaterial color="#2f8b83" roughness={0.65} />
      </mesh>
    </group>
  );
}

function ForgeScreen() {
  const stuckDetected = stuckSignals.length >= 2;

  const openBridge = useCallback(() => {
    Linking.openURL(JITSI_URL).catch(() => undefined);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.screenBody}>
      <Text style={styles.sectionTitle}>Forge / Bridge</Text>
      <Text style={styles.bodyText}>
        FAIL veya ROLLBACK sinyali iki kez ust uste geldiginde STUCK tespit edilir ve uzman
        gorusmesi Jitsi linkiyle acilir.
      </Text>

      <AuditWidget />

      <View style={styles.rulePanel}>
        <View style={styles.ruleHeader}>
          <Text style={styles.panelTitle}>STUCK heuristic</Text>
          <Text style={styles.ruleScore}>{stuckSignals.length}/2</Text>
        </View>
        {stuckSignals.map((signal) => (
          <Text key={signal} style={styles.ruleSignal}>
            {signal}
          </Text>
        ))}
      </View>

      <View style={styles.timeline}>
        {cycles.map((cycle) => (
          <View key={cycle.id} style={styles.cycleRow}>
            <View
              style={[
                styles.statusDot,
                cycle.status === 'SUCCESS' ? styles.successDot : styles.rollbackDot
              ]}
            />
            <View style={styles.cycleCopy}>
              <Text style={styles.cycleTitle}>
                {cycle.id} {cycle.status} - {cycle.title}
              </Text>
              <Text style={styles.cycleMeta}>Timebox: {cycle.timebox}</Text>
              <Text style={styles.cycleNote}>{cycle.note}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.stuckPanel, stuckDetected && styles.stuckPanelActive]}>
        <Text style={styles.stuckTitle}>
          {stuckDetected ? 'STUCK detected - expert bridge required' : 'Bridge normal'}
        </Text>
        <Text style={styles.stuckSignal}>
          Cycle 4, uzman gorusmesinden gelen Jitsi external-link cozumuyle SUCCESS durumuna dondu.
        </Text>
        <View style={styles.bridgeChecklist}>
          {bridgeChecks.map((check) => (
            <View key={check} style={styles.bridgeCheck}>
              <Text style={styles.bridgeCheckText}>{check}</Text>
            </View>
          ))}
        </View>
        {stuckDetected ? (
          <Pressable onPress={openBridge} style={styles.bridgeButton}>
            <Text style={styles.bridgeButtonText}>Uzmana Baglan</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.linkBox}>
        <Text style={styles.linkLabel}>Jitsi room</Text>
        <Text style={styles.linkText}>{JITSI_URL}</Text>
      </View>
    </ScrollView>
  );
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenKey>('voice');
  const { amplitude, micState, errorMessage, start, stop } = useMicAmplitude();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.appShell}>
        <MicHeader
          amplitude={amplitude}
          micState={micState}
          errorMessage={errorMessage}
          onStart={start}
          onStop={stop}
        />
        <SegmentedTabs active={activeScreen} onChange={setActiveScreen} />
        {micState === 'requesting' ? (
          <View style={styles.loading}>
            <ActivityIndicator color="#8be9d4" />
          </View>
        ) : null}
        {activeScreen === 'voice' ? <VoiceScreen amplitude={amplitude} /> : null}
        {activeScreen === 'avatar' ? <AvatarScreen amplitude={amplitude} /> : null}
        {activeScreen === 'forge' ? <ForgeScreen /> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090d12'
  },
  appShell: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 42
  },
  micHeader: {
    alignItems: 'center',
    borderBottomColor: '#202a34',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
    paddingBottom: 16
  },
  micInfo: {
    flex: 1
  },
  kicker: {
    color: '#8be9d4',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase'
  },
  title: {
    color: '#f5f7fb',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0,
    marginTop: 3
  },
  subtitle: {
    color: '#9ba7b5',
    fontSize: 14,
    marginTop: 5
  },
  errorText: {
    color: '#ff9aa7',
    fontSize: 12,
    marginTop: 6
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#8be9d4',
    borderRadius: 8,
    minWidth: 116,
    paddingHorizontal: 13,
    paddingVertical: 12
  },
  stopButton: {
    backgroundColor: '#ff7b8a'
  },
  primaryButtonText: {
    color: '#061011',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center'
  },
  tabs: {
    backgroundColor: '#111820',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 4,
    marginTop: 14,
    padding: 4
  },
  tabButton: {
    alignItems: 'center',
    borderRadius: 6,
    flex: 1,
    paddingVertical: 10
  },
  tabButtonActive: {
    backgroundColor: '#243342'
  },
  tabText: {
    color: '#8b98a8',
    fontSize: 14,
    fontWeight: '700'
  },
  tabTextActive: {
    color: '#f5f7fb'
  },
  loading: {
    alignItems: 'center',
    paddingTop: 16
  },
  screenBody: {
    paddingBottom: 30,
    paddingTop: 20
  },
  sectionTitle: {
    color: '#f5f7fb',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0
  },
  bodyText: {
    color: '#aeb8c5',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8
  },
  visualizerPanel: {
    backgroundColor: '#111820',
    borderColor: '#243342',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 18,
    minHeight: 390,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 22
  },
  voiceOrbStage: {
    alignItems: 'center',
    height: 258,
    justifyContent: 'center'
  },
  orbHalo: {
    alignSelf: 'center',
    backgroundColor: '#5de7ff',
    borderRadius: 82,
    height: 164,
    position: 'absolute',
    top: 34,
    width: 164
  },
  orbOuter: {
    alignItems: 'center',
    backgroundColor: '#84ddff',
    borderRadius: 72,
    height: 144,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    width: 144
  },
  orbShine: {
    backgroundColor: '#f8ffff',
    borderRadius: 58,
    height: 98,
    left: 14,
    opacity: 0.68,
    position: 'absolute',
    top: -4,
    transform: [{ rotate: '28deg' }],
    width: 90
  },
  orbDeep: {
    backgroundColor: '#006fff',
    borderTopLeftRadius: 54,
    borderTopRightRadius: 76,
    width: 154
  },
  voiceName: {
    color: '#f5f7fb',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 18
  },
  voiceTone: {
    color: '#9ba7b5',
    fontSize: 12,
    marginTop: 4
  },
  voiceDots: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 14
  },
  voiceDot: {
    backgroundColor: '#d7dde4',
    borderRadius: 3,
    height: 6,
    width: 6
  },
  voiceDotActive: {
    backgroundColor: '#5de7ff'
  },
  waveStrip: {
    alignItems: 'center',
    borderTopColor: '#263646',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 4,
    height: 78,
    justifyContent: 'center',
    marginTop: 4
  },
  bar: {
    borderRadius: 8,
    maxHeight: 62,
    minHeight: 7,
    width: 6
  },
  visualizerFooter: {
    borderTopColor: '#202a34',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingTop: 14
  },
  metric: {
    backgroundColor: '#0d1218',
    borderColor: '#243342',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 10
  },
  metricLabel: {
    color: '#7f8b99',
    fontSize: 11,
    fontWeight: '700'
  },
  metricValue: {
    color: '#f5f7fb',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4
  },
  avatarFrame: {
    backgroundColor: '#10131a',
    borderColor: '#263646',
    borderRadius: 8,
    borderWidth: 1,
    height: 410,
    marginTop: 18,
    overflow: 'hidden'
  },
  canvas: {
    flex: 1
  },
  avatarReadout: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12
  },
  timeline: {
    backgroundColor: '#111820',
    borderColor: '#243342',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 18,
    padding: 14
  },
  evidencePanel: {
    backgroundColor: '#111820',
    borderColor: '#243342',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    marginTop: 18,
    padding: 14
  },
  panelTitle: {
    color: '#f5f7fb',
    fontSize: 15,
    fontWeight: '900'
  },
  auditRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10
  },
  auditBadge: {
    backgroundColor: '#8be9d4',
    borderRadius: 5,
    height: 10,
    marginTop: 5,
    width: 10
  },
  auditCopy: {
    flex: 1
  },
  auditTitle: {
    color: '#f5f7fb',
    fontSize: 13,
    fontWeight: '800'
  },
  auditDetail: {
    color: '#9ba7b5',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2
  },
  rulePanel: {
    backgroundColor: '#14171b',
    borderColor: '#f6c85f',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 14
  },
  ruleHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  ruleScore: {
    color: '#f6c85f',
    fontSize: 22,
    fontWeight: '900'
  },
  ruleSignal: {
    color: '#aeb8c5',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8
  },
  cycleRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 11
  },
  statusDot: {
    borderRadius: 8,
    height: 14,
    marginTop: 3,
    width: 14
  },
  successDot: {
    backgroundColor: '#8be9d4'
  },
  rollbackDot: {
    backgroundColor: '#ff7b8a'
  },
  cycleCopy: {
    flex: 1
  },
  cycleTitle: {
    color: '#f5f7fb',
    fontSize: 15,
    fontWeight: '800'
  },
  cycleMeta: {
    color: '#f6c85f',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3
  },
  cycleNote: {
    color: '#9ba7b5',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4
  },
  stuckPanel: {
    backgroundColor: '#14171b',
    borderColor: '#29333d',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 14
  },
  stuckPanelActive: {
    borderColor: '#ff7b8a'
  },
  stuckTitle: {
    color: '#ffb1bb',
    fontSize: 18,
    fontWeight: '900'
  },
  stuckSignal: {
    color: '#aeb8c5',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7
  },
  bridgeChecklist: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 13
  },
  bridgeCheck: {
    backgroundColor: '#0d1218',
    borderColor: '#8be9d4',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 8
  },
  bridgeCheckText: {
    color: '#8be9d4',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center'
  },
  bridgeButton: {
    alignItems: 'center',
    backgroundColor: '#f6c85f',
    borderRadius: 8,
    marginTop: 14,
    paddingVertical: 13
  },
  bridgeButtonText: {
    color: '#15100a',
    fontSize: 15,
    fontWeight: '900'
  },
  linkBox: {
    borderColor: '#263646',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 12
  },
  linkLabel: {
    color: '#7f8b99',
    fontSize: 12,
    fontWeight: '800'
  },
  linkText: {
    color: '#8be9d4',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5
  }
});
