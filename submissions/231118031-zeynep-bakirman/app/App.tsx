import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { Float, useGLTF } from '@react-three/drei/native';
import { WebView } from 'react-native-webview';
import { AuditWidget } from '@xtatistix/mobile-audit';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { captureRef, captureScreen } from 'react-native-view-shot';
import type { Mesh, Object3D } from 'three';

const avatarAsset = require('./avatar.glb');

const FS: any = FileSystem;
const BAR_COUNT = 24;
const RECORDING_UPDATE_MS = 50;
const SILENCE_THRESHOLD = 0.07;
const SILENCE_TIMEOUT_MS = 700;
const JITSI_ROOM = 'nokta-nokta-231118031-zeynep-bakirman';
const STUDENT_NAME = 'Zeynep Bakirman';

let notesData: any[] = [];
const mockStorage = {
  loadNotes: async () => notesData,
  saveNotes: async (notes: any[]) => {
    notesData = notes;
  },
};

const auditDeps = {
  captureScreen,
  captureRef,
  writeFile: async (fileName: string, content: string) => {
    try {
      const path = (FS.documentDirectory || '') + fileName;
      await FS.writeAsStringAsync(path, content, { encoding: 'utf8' });
      return path;
    } catch (e) {
      Alert.alert('Write error', 'File could not be created: ' + String(e));
      return '';
    }
  },
  writeFileBinary: async (fileName: string, content: string) => {
    try {
      const path = (FS.documentDirectory || '') + fileName;
      await FS.writeAsStringAsync(path, content, { encoding: 'base64' });
      return path;
    } catch (e) {
      Alert.alert('Write error', 'Image file could not be created: ' + String(e));
      return '';
    }
  },
  shareFile: async (fileUri: string) => {
    try {
      if (!fileUri) {
        Alert.alert('Share error', 'The file path is empty.');
        return;
      }

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Share unavailable', 'Sharing is not available on this device.');
      }
    } catch (e) {
      Alert.alert('Share error', String(e));
    }
  },
  storage: mockStorage,
  currentScreen: 'TrackARealtimeVoice',
  BugIcon: <Text style={{ fontSize: 18 }}>!</Text>,
};

type MicState = {
  bars: number[];
  error: string | null;
  isIdle: boolean;
  isListening: boolean;
  latencyMs: number;
  level: number;
  permission: 'unknown' | 'granted' | 'denied';
};

type MorphMesh = Mesh & {
  morphTargetDictionary?: Record<string, number>;
  morphTargetInfluences?: number[];
};

const emptyBars = Array.from({ length: BAR_COUNT }, () => 0.05);
const morphGroups = [
  { names: ['jawOpen', 'mouthOpen', 'viseme_aa', 'viseme_PP'], gain: 1 },
  { names: ['mouthFunnel', 'mouthPucker', 'viseme_O', 'viseme_U'], gain: 0.45 },
  { names: ['mouthSmileLeft', 'mouthSmileRight', 'viseme_E', 'viseme_I'], gain: 0.22 },
];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function normalizeMetering(metering?: number) {
  if (typeof metering !== 'number' || Number.isNaN(metering)) {
    return 0;
  }

  return clamp((metering + 58) / 58);
}

function buildBars(level: number, tick: number) {
  return emptyBars.map((_, index) => {
    const phase = tick * 0.25 + index * 0.72;
    const spectralShape = 0.55 + 0.45 * Math.sin(phase);
    const centerWeight = 1 - Math.abs(index - BAR_COUNT / 2) / (BAR_COUNT / 2);
    const value = 0.08 + level * (0.35 + spectralShape * 0.45 + centerWeight * 0.35);
    return clamp(value, 0.06, 1);
  });
}

function buildJitsiUrl() {
  const toolbarButtons = encodeURIComponent(
    JSON.stringify([
      'microphone',
      'camera',
      'desktop',
      'fullscreen',
      'hangup',
      'chat',
      'tileview',
      'settings',
    ])
  );
  const room = encodeURIComponent(JITSI_ROOM);
  const name = encodeURIComponent(STUDENT_NAME);

  return (
    `https://meet.jit.si/${room}` +
    '#config.prejoinConfig.enabled=false' +
    '&config.disableDeepLinking=true' +
    '&config.startWithAudioMuted=false' +
    '&config.startWithVideoMuted=false' +
    `&config.toolbarButtons=${toolbarButtons}` +
    `&userInfo.displayName=${name}`
  );
}

function useMicrophoneMeter(): MicState & {
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
} {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const lastUpdateRef = useRef<number | null>(null);
  const silenceStartedRef = useRef<number | null>(null);
  const tickRef = useRef(0);
  const [state, setState] = useState<MicState>({
    bars: emptyBars,
    error: null,
    isIdle: true,
    isListening: false,
    latencyMs: RECORDING_UPDATE_MS,
    level: 0,
    permission: 'unknown',
  });

  const stopListening = useCallback(async () => {
    const activeRecording = recordingRef.current;
    recordingRef.current = null;

    if (activeRecording) {
      activeRecording.setOnRecordingStatusUpdate(null);
      try {
        await activeRecording.stopAndUnloadAsync();
      } catch {
        // Native recorders can reject if the session was already interrupted.
      }
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    silenceStartedRef.current = null;
    lastUpdateRef.current = null;
    setState((current) => ({
      ...current,
      bars: emptyBars,
      isIdle: true,
      isListening: false,
      latencyMs: RECORDING_UPDATE_MS,
      level: 0,
    }));
  }, []);

  const startListening = useCallback(async () => {
    if (recordingRef.current) {
      return;
    }

    setState((current) => ({ ...current, error: null }));
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      setState((current) => ({
        ...current,
        error: 'Microphone permission is required for Track A.',
        permission: 'denied',
      }));
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    const recording = new Audio.Recording();
    const options = {
      ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
      isMeteringEnabled: true,
      keepAudioActiveHint: true,
    };

    recording.setProgressUpdateInterval(RECORDING_UPDATE_MS);
    recording.setOnRecordingStatusUpdate((status) => {
      const now = Date.now();
      const updateDelta = lastUpdateRef.current
        ? now - lastUpdateRef.current
        : RECORDING_UPDATE_MS;
      lastUpdateRef.current = now;

      const nextLevel = normalizeMetering(status.metering);
      if (nextLevel < SILENCE_THRESHOLD) {
        silenceStartedRef.current = silenceStartedRef.current ?? now;
      } else {
        silenceStartedRef.current = null;
      }

      const idleFor =
        silenceStartedRef.current === null ? 0 : now - silenceStartedRef.current;
      const isIdle = idleFor > SILENCE_TIMEOUT_MS;
      tickRef.current += 1;

      setState((current) => ({
        ...current,
        bars: isIdle ? emptyBars : buildBars(nextLevel, tickRef.current),
        isIdle,
        isListening: status.isRecording,
        latencyMs: Math.round(updateDelta),
        level: isIdle ? 0 : nextLevel,
        permission: 'granted',
      }));
    });

    try {
      await recording.prepareToRecordAsync(options);
      recordingRef.current = recording;
      await recording.startAsync();
    } catch (e) {
      recordingRef.current = null;
      setState((current) => ({
        ...current,
        error: String(e),
        isListening: false,
      }));
    }
  }, []);

  useEffect(() => {
    return () => {
      void stopListening();
    };
  }, [stopListening]);

  return {
    ...state,
    startListening,
    stopListening,
  };
}

function driveMorphTargets(root: Object3D, level: number, isIdle: boolean) {
  const mouthOpen = isIdle ? 0 : clamp(level * 1.35);

  root.traverse((object) => {
    const mesh = object as MorphMesh;
    if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) {
      return;
    }

    Object.entries(mesh.morphTargetDictionary).forEach(([name, index]) => {
      const group = morphGroups.find((candidate) =>
        candidate.names.some((targetName) => targetName.toLowerCase() === name.toLowerCase())
      );
      const target = group ? mouthOpen * group.gain : 0;
      const current = mesh.morphTargetInfluences?.[index] ?? 0;
      if (mesh.morphTargetInfluences) {
        mesh.morphTargetInfluences[index] = current + (target - current) * 0.42;
      }
    });
  });
}

function ProceduralMouth({ level, isIdle }: { level: number; isIdle: boolean }) {
  const mouth = useRef<Mesh>(null);
  const glow = useRef<Mesh>(null);

  useFrame(() => {
    const open = isIdle ? 0.08 : clamp(level * 1.4, 0.08, 0.95);
    if (mouth.current) {
      mouth.current.scale.set(0.22 + open * 0.22, 0.05 + open * 0.34, 0.035);
    }
    if (glow.current) {
      glow.current.scale.set(0.3 + open * 0.28, 0.1 + open * 0.42, 0.02);
    }
  });

  return (
    <group position={[0, 1.49, 0.205]}>
      <mesh ref={glow} position={[0, 0, -0.006]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#fb7185" transparent opacity={isIdle ? 0.2 : 0.42} />
      </mesh>
      <mesh ref={mouth}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#3f0f1f" />
      </mesh>
    </group>
  );
}

function AvatarModel({ level, isIdle }: { level: number; isIdle: boolean }) {
  const group = useRef<Object3D>(null);
  const gltf = useGLTF(avatarAsset as unknown as string);

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.055;
    }
    driveMorphTargets(gltf.scene, level, isIdle);
  });

  return (
    <Float speed={1.4} rotationIntensity={0.05} floatIntensity={0.06}>
      <group ref={group} position={[0, -1.25, 0]} scale={1.34}>
        <primitive object={gltf.scene} />
        <ProceduralMouth level={level} isIdle={isIdle} />
      </group>
    </Float>
  );
}

function AvatarStage({ level, isIdle }: { level: number; isIdle: boolean }) {
  return (
    <View style={styles.stage}>
      <Canvas camera={{ position: [0, 0.82, 2.65], fov: 34 }}>
        <color attach="background" args={['#101014']} />
        <ambientLight intensity={1.35} />
        <directionalLight position={[2, 3, 3]} intensity={2.35} />
        <pointLight position={[-1.8, 0.7, 2.4]} intensity={1.8} color="#2dd4bf" />
        <Suspense fallback={null}>
          <AvatarModel level={level} isIdle={isIdle} />
        </Suspense>
      </Canvas>
      <View style={styles.stageOverlay}>
        <Text style={styles.stageTitle}>avatar.glb live</Text>
        <Text style={styles.stageMeta}>mic-to-mouth target: &lt; 200 ms</Text>
      </View>
    </View>
  );
}

function ExpertBridge({
  isVisible,
  onClose,
}: {
  isVisible: boolean;
  onClose: () => void;
}) {
  const jitsiUrl = useMemo(buildJitsiUrl, []);

  return (
    <Modal animationType="slide" visible={isVisible} onRequestClose={onClose}>
      <SafeAreaView style={styles.bridgeContainer}>
        <View style={styles.bridgeHeader}>
          <View>
            <Text style={styles.bridgeTitle}>Uzmana Baglan</Text>
            <Text style={styles.bridgeMeta}>Jitsi WebRTC / video + audio + screen share</Text>
          </View>
          <Pressable accessibilityRole="button" style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Kapat</Text>
          </Pressable>
        </View>
        <WebView
          allowsInlineMediaPlayback
          domStorageEnabled
          javaScriptEnabled
          mediaCapturePermissionGrantType="grant"
          mediaPlaybackRequiresUserAction={false}
          originWhitelist={['https://*']}
          setSupportMultipleWindows={false}
          source={{ uri: jitsiUrl }}
          style={styles.jitsiWebview}
        />
      </SafeAreaView>
    </Modal>
  );
}

function VoiceBars({ bars, isIdle }: { bars: number[]; isIdle: boolean }) {
  return (
    <View style={styles.visualizer}>
      {bars.map((bar, index) => {
        const barStyle: ViewStyle = {
          height: 18 + bar * 104,
          opacity: isIdle ? 0.36 : 0.72 + bar * 0.28,
        };

        return (
          <View
            key={index}
            style={[
              styles.voiceBar,
              barStyle,
              index % 3 === 0 && styles.voiceBarAccent,
            ]}
          />
        );
      })}
    </View>
  );
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillLabel}>{label}</Text>
      <Text style={styles.pillValue}>{value}</Text>
    </View>
  );
}

export default function App() {
  const {
    bars,
    error,
    isIdle,
    isListening,
    latencyMs,
    level,
    permission,
    startListening,
    stopListening,
  } = useMicrophoneMeter();
  const [isBridgeVisible, setIsBridgeVisible] = useState(false);

  const latencyCopy = useMemo(() => {
    const guardedLatency = Math.max(RECORDING_UPDATE_MS, latencyMs);
    return `${guardedLatency} ms`;
  }, [latencyMs]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>Nokta-Nokta / Track A</Text>
          <Text style={styles.title}>Voice viz + lipsync</Text>
        </View>
        <Text style={styles.student}>231118031</Text>
      </View>

      <AvatarStage level={level} isIdle={isIdle} />

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.panelTitle}>Realtime microphone</Text>
            <Text style={styles.panelSubtitle}>
              RMS metering every {RECORDING_UPDATE_MS} ms
            </Text>
          </View>
          <View style={[styles.liveDot, isListening && styles.liveDotActive]} />
        </View>

        <VoiceBars bars={bars} isIdle={isIdle} />

        <View style={styles.stats}>
          <StatusPill label="state" value={isIdle ? 'idle' : 'voice'} />
          <StatusPill label="latency" value={latencyCopy} />
          <StatusPill label="permission" value={permission} />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            style={[styles.button, isListening && styles.buttonSecondary]}
            onPress={isListening ? stopListening : startListening}
          >
            <Text style={styles.buttonText}>
              {isListening ? 'Mikrofonu durdur' : 'Mikrofonu baslat'}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={[styles.button, styles.bridgeButton]}
            onPress={() => setIsBridgeVisible(true)}
          >
            <Text style={styles.bridgeButtonText}>Uzmana Baglan</Text>
          </Pressable>
        </View>
      </View>

      <ExpertBridge isVisible={isBridgeVisible} onClose={() => setIsBridgeVisible(false)} />
      <AuditWidget deps={auditDeps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  bridgeButton: {
    backgroundColor: '#f59e0b',
  },
  bridgeButtonText: {
    color: '#14100a',
    fontSize: 15,
    fontWeight: '900',
  },
  bridgeContainer: {
    backgroundColor: '#101014',
    flex: 1,
  },
  bridgeHeader: {
    alignItems: 'center',
    backgroundColor: '#171717',
    borderBottomColor: '#2a2a2a',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bridgeMeta: {
    color: '#a3a3a3',
    fontSize: 12,
    marginTop: 3,
  },
  bridgeTitle: {
    color: '#fafafa',
    fontSize: 18,
    fontWeight: '900',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#2dd4bf',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  buttonSecondary: {
    backgroundColor: '#fb7185',
  },
  buttonText: {
    color: '#06110f',
    fontSize: 15,
    fontWeight: '900',
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 14,
  },
  closeButtonText: {
    color: '#fafafa',
    fontSize: 14,
    fontWeight: '800',
  },
  container: {
    backgroundColor: '#101014',
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 42,
  },
  error: {
    color: '#fecaca',
    fontSize: 13,
    lineHeight: 18,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  jitsiWebview: {
    backgroundColor: '#000',
    flex: 1,
  },
  kicker: {
    color: '#5eead4',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  liveDot: {
    backgroundColor: '#525252',
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  liveDotActive: {
    backgroundColor: '#22c55e',
  },
  panel: {
    backgroundColor: '#171717',
    borderColor: '#2a2a2a',
    borderRadius: 8,
    borderWidth: 1,
    gap: 18,
    padding: 16,
  },
  panelHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  panelSubtitle: {
    color: '#a3a3a3',
    fontSize: 13,
    marginTop: 3,
  },
  panelTitle: {
    color: '#fafafa',
    fontSize: 18,
    fontWeight: '900',
  },
  pill: {
    backgroundColor: '#242424',
    borderColor: '#333',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 56,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  pillLabel: {
    color: '#a3a3a3',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  pillValue: {
    color: '#fafafa',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 4,
  },
  stage: {
    borderColor: '#2a2a2a',
    borderRadius: 8,
    borderWidth: 1,
    height: 320,
    marginBottom: 14,
    overflow: 'hidden',
  },
  stageMeta: {
    color: '#d4d4d4',
    fontSize: 12,
    marginTop: 3,
  },
  stageOverlay: {
    backgroundColor: 'rgba(16, 16, 20, 0.74)',
    borderRadius: 8,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    position: 'absolute',
    right: 12,
    top: 12,
  },
  stageTitle: {
    color: '#fafafa',
    fontSize: 14,
    fontWeight: '900',
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
  },
  student: {
    color: '#d4d4d4',
    fontSize: 14,
    fontWeight: '900',
    paddingTop: 2,
  },
  title: {
    color: '#fafafa',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0,
    marginTop: 4,
  },
  visualizer: {
    alignItems: 'flex-end',
    backgroundColor: '#242424',
    borderColor: '#333',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    height: 152,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 14,
  },
  voiceBar: {
    backgroundColor: '#2dd4bf',
    borderRadius: 3,
    minHeight: 18,
    width: 7,
  },
  voiceBarAccent: {
    backgroundColor: '#f59e0b',
  },
});
