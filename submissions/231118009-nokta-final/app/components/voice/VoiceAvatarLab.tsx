/* eslint-disable @typescript-eslint/no-require-imports, react/no-unknown-property */
import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import { Asset } from 'expo-asset';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import * as Speech from 'expo-speech';
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import WebView from 'react-native-webview';
import { type Group, type Mesh, type Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

type PersonaId = 'junior' | 'senior';
type ForgeState = 'PASS' | 'FAIL' | 'ROLLBACK' | 'STUCK';

type WebMicSession = {
  context: AudioContext;
  analyser: AnalyserNode;
  data: Uint8Array;
  frame: number;
  stream: MediaStream;
};

type Persona = {
  id: PersonaId;
  label: string;
  subtitle: string;
  voiceHint: string;
  color: string;
  feedbackIntro: string;
  speechRate: number;
  speechPitch: number;
  voicePick: 'first' | 'last';
};

const PERSONAS: Persona[] = [
  {
    id: 'junior',
    label: 'Junior Ben',
    subtitle: 'Daha hizli, daha direkt audit okur.',
    voiceHint: 'net / hizli',
    color: '#0f766e',
    feedbackIntro: 'Junior ben: hizli okuyorum, ilk uygulanabilir tamir noktasini one cikariyorum.',
    speechRate: 1.28,
    speechPitch: 1.35,
    voicePick: 'first',
  },
  {
    id: 'senior',
    label: 'Senior Ben',
    subtitle: 'Daha sakin, forge sonucuna odaklanir.',
    voiceHint: 'sakin / dusuk',
    color: '#b45309',
    feedbackIntro: 'Senior ben: daha sakin okuyorum, rollback ve risk kararini ayirarak yorumluyorum.',
    speechRate: 0.72,
    speechPitch: 0.72,
    voicePick: 'last',
  },
];

const sampleReport = `## Voice Audit Report

Ekran: Avatar Lab
Bulgu: Mikrofon dalgasi konusurken canlaniyor ama sessizlikte daha hizli sonmeli.
Beklenti: Avatar dudak hareketi RMS sinyaliyle 200ms altinda takip etmeli.
Forge input: Voice visualizer decay ve stuck bridge birlikte dogrulansin.`;

const avatarAsset = require('@/assets/avatar.glb');

function base64ToArrayBuffer(base64: string) {
  const binary = globalThis.atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return buffer;
}

async function readAvatarArrayBuffer() {
  const asset = Asset.fromModule(avatarAsset);
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  if (!uri) {
    throw new Error('avatar.glb asset URI bulunamadi.');
  }

  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`avatar.glb indirilemedi: ${response.status}`);
    }
    return response.arrayBuffer();
  }

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64ToArrayBuffer(base64);
}

async function loadAvatarScene() {
  if (!(globalThis as any).self) {
    (globalThis as any).self = globalThis;
  }
  const arrayBuffer = await readAvatarArrayBuffer();
  const loader = new GLTFLoader();
  return new Promise<Object3D>((resolve, reject) => {
    loader.parse(
      arrayBuffer,
      '',
      gltf => resolve(gltf.scene),
      error => reject(error),
    );
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function dbToRms(db?: number) {
  if (typeof db !== 'number') return 0;
  const normalized = (db + 70) / 70;
  return clamp(normalized, 0, 1);
}

function getViseme(rms: number) {
  if (rms < 0.08) return 'rest';
  if (rms < 0.28) return 'ih';
  if (rms < 0.58) return 'aa';
  return 'oh';
}

function WaveBars({ levels, accent }: { levels: number[]; accent: string }) {
  return (
    <View style={styles.wavePanel}>
      {levels.map((level, index) => (
        <View key={`${index}-${levels.length}`} style={styles.barTrack}>
          <Animated.View
            style={[
              styles.bar,
              {
                height: `${18 + level * 82}%`,
                backgroundColor: index % 3 === 0 ? accent : '#111827',
                opacity: 0.26 + level * 0.74,
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

type MorphMesh = Mesh & {
  morphTargetDictionary?: Record<string, number>;
  morphTargetInfluences?: number[];
};

function getMouthTargetWeight(name: string, rms: number) {
  const key = name.toLowerCase();
  if (key.includes('jaw') || key.includes('mouthopen')) return rms;
  if (key.includes('viseme_aa') || key.includes('viseme_ah') || key.includes('mouthopen')) {
    return clamp(rms * 1.1, 0, 1);
  }
  if (key.includes('viseme_o') || key.includes('viseme_oh')) return clamp(rms * 0.72, 0, 1);
  if (key.includes('viseme_i') || key.includes('viseme_ih')) return clamp(rms * 0.42, 0, 1);
  if (key.includes('mouth') || key.includes('viseme')) return clamp(rms * 0.55, 0, 1);
  return 0;
}

function AvatarModel({ scene, rms }: { scene: Object3D; rms: number }) {
  const group = useRef<Group>(null);
  const morphMeshes = useRef<MorphMesh[]>([]);

  const fittedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse(child => {
      const mesh = child as MorphMesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.frustumCulled = false;
      }
    });

    return clone;
  }, [scene]);

  useEffect(() => {
    const nextMorphMeshes: MorphMesh[] = [];
    fittedScene.traverse(child => {
      const mesh = child as MorphMesh;
      if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
        nextMorphMeshes.push(mesh);
      }
    });
    morphMeshes.current = nextMorphMeshes;
  }, [fittedScene]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.8) * 0.05;
      group.current.position.y = Math.sin(t * 1.4) * 0.006;
    }
    morphMeshes.current.forEach(mesh => {
      if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
      Object.entries(mesh.morphTargetDictionary).forEach(([name, index]) => {
        const nextWeight = getMouthTargetWeight(name, rms);
        const previousWeight = mesh.morphTargetInfluences?.[index] ?? 0;
        if (nextWeight > 0 || previousWeight > 0.001) {
          mesh.morphTargetInfluences![index] = previousWeight * 0.38 + nextWeight * 0.62;
        }
      });
    });
  });

  return (
    <group ref={group}>
      <primitive object={fittedScene} />
    </group>
  );
}

function HeadCamera() {
  const { camera } = useThree();

  useFrame(() => {
    camera.position.set(0, 1.62, 1.15);
    camera.lookAt(0, 1.62, 0);
    camera.updateProjectionMatrix();
  });

  return null;
}

function PlaceholderRig({ rms, accent }: { rms: number; accent: string }) {
  const group = useRef<Group>(null);
  const mouth = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.8) * 0.08;
      group.current.position.y = Math.sin(t * 1.4) * 0.025;
    }
    if (mouth.current) {
      mouth.current.scale.y = 0.16 + rms * 2.2;
      mouth.current.scale.x = 0.8 + rms * 0.38;
    }
  });

  return (
    <group ref={group}>
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.82, 48, 48]} />
        <meshStandardMaterial color="#f2c7a8" roughness={0.62} />
      </mesh>
      <mesh position={[0, 1.03, 0.02]}>
        <sphereGeometry args={[0.62, 32, 16]} />
        <meshStandardMaterial color="#1f2937" roughness={0.55} />
      </mesh>
      <mesh position={[-0.28, 0.46, 0.72]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh position={[0.28, 0.46, 0.72]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh ref={mouth} position={[0, 0.08, 0.78]}>
        <boxGeometry args={[0.34, 0.08, 0.035]} />
        <meshStandardMaterial color={accent} />
      </mesh>
      <mesh position={[0, -0.78, 0]}>
        <capsuleGeometry args={[0.48, 0.76, 12, 24]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>
    </group>
  );
}

function AvatarStage({ rms, accent }: { rms: number; accent: string }) {
  const [scene, setScene] = useState<Object3D | null>(null);
  const [assetState, setAssetState] = useState<'loading' | 'ready' | 'fallback'>('loading');

  useEffect(() => {
    let alive = true;
    loadAvatarScene()
      .then(nextScene => {
        if (!alive) return;
        setScene(nextScene);
        setAssetState('ready');
      })
      .catch(error => {
        console.warn('avatar.glb yuklenemedi', error);
        if (alive) setAssetState('fallback');
      });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <View style={styles.avatarFrame}>
      <Canvas camera={{ position: [0, 1.62, 1.15], fov: 18, near: 0.01, far: 20 }}>
        <Suspense fallback={null}>
          <HeadCamera />
          <ambientLight intensity={1.15} />
          <directionalLight position={[2, 3, 5]} intensity={2.6} />
          <directionalLight position={[-3, 1.5, 2]} intensity={0.8} />
          {scene ? <AvatarModel scene={scene} rms={rms} /> : <PlaceholderRig rms={rms} accent={accent} />}
        </Suspense>
      </Canvas>
      <Text style={styles.assetNote}>
        {assetState === 'ready'
          ? 'assets/avatar.glb aktif - head camera'
          : assetState === 'fallback'
            ? 'avatar.glb yuklenemedi, fallback rig aktif'
            : 'avatar.glb yukleniyor'}
      </Text>
    </View>
  );
}

export function VoiceAvatarLab() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [webMicActive, setWebMicActive] = useState(false);
  const [rms, setRms] = useState(0);
  const [levels, setLevels] = useState(() => Array.from({ length: 28 }, () => 0));
  const [personaId, setPersonaId] = useState<PersonaId>('junior');
  const [dictation, setDictation] = useState(sampleReport);
  const [forgeLog, setForgeLog] = useState<ForgeState[]>(['PASS', 'PASS', 'ROLLBACK']);
  const [bridgeOpen, setBridgeOpen] = useState(false);
  const webMic = useRef<WebMicSession | null>(null);
  const speechFrame = useRef<number | null>(null);
  const persona = PERSONAS.find(item => item.id === personaId) ?? PERSONAS[0];
  const consecutiveBad = useMemo(() => {
    let count = 0;
    for (let index = forgeLog.length - 1; index >= 0; index -= 1) {
      if (forgeLog[index] === 'FAIL' || forgeLog[index] === 'ROLLBACK') count += 1;
      else break;
    }
    return count;
  }, [forgeLog]);
  const isStuck = consecutiveBad >= 2 || forgeLog.at(-1) === 'STUCK';
  const jitsiUrl = 'https://meet.jit.si/nokta-231118009-forge-bridge#config.prejoinPageEnabled=false';

  useEffect(() => {
    return () => {
      recording?.stopAndUnloadAsync().catch(() => undefined);
      stopWebMic();
      if (speechFrame.current !== null) {
        cancelAnimationFrame(speechFrame.current);
        speechFrame.current = null;
      }
      Speech.stop();
    };
  }, [recording]);

  const pushLevel = (nextRms: number) => {
    setRms(previous => previous * 0.34 + nextRms * 0.66);
    setLevels(previous => [...previous.slice(1), nextRms]);
  };

  const startMic = async () => {
    if (recording || webMicActive) return;
    if (Platform.OS === 'web') {
      await startWebMic();
      return;
    }
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Mikrofon izni gerekli', 'Voice visualizer icin mikrofon izni vermen gerekiyor.');
      return;
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    const options = {
      ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
      isMeteringEnabled: true,
    };
    const created = await Audio.Recording.createAsync(
      options,
      status => pushLevel(dbToRms(status.metering)),
      80,
    );
    setRecording(created.recording);
  };

  const stopMic = async () => {
    if (webMicActive) {
      stopWebMic();
      pushLevel(0);
      return;
    }
    if (!recording) return;
    const active = recording;
    setRecording(null);
    await active.stopAndUnloadAsync();
    pushLevel(0);
  };

  const startWebMic = async () => {
    const mediaDevices = globalThis.navigator?.mediaDevices;
    if (!mediaDevices?.getUserMedia) {
      Alert.alert('Mikrofon desteklenmiyor', 'Bu tarayicida getUserMedia bulunamadi.');
      return;
    }

    try {
      const stream = await mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      const AudioContextClass = globalThis.AudioContext || (globalThis as any).webkitAudioContext;
      const context = new AudioContextClass();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.55;
      source.connect(analyser);
      const data = new Uint8Array(analyser.fftSize);

      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let index = 0; index < data.length; index += 1) {
          const centered = (data[index] - 128) / 128;
          sum += centered * centered;
        }
        const raw = Math.sqrt(sum / data.length);
        pushLevel(clamp(raw * 5.2, 0, 1));
        if (webMic.current) {
          webMic.current.frame = requestAnimationFrame(tick);
        }
      };

      webMic.current = {
        context,
        analyser,
        data,
        frame: requestAnimationFrame(tick),
        stream,
      };
      setWebMicActive(true);
    } catch (error) {
      Alert.alert(
        'Mikrofon acilamadi',
        error instanceof Error ? error.message : 'Tarayici mikrofon izni vermedi.',
      );
    }
  };

  const stopWebMic = () => {
    const session = webMic.current;
    if (!session) return;
    cancelAnimationFrame(session.frame);
    session.stream.getTracks().forEach(track => track.stop());
    session.context.close().catch(() => undefined);
    webMic.current = null;
    setWebMicActive(false);
  };

  const stopSpeechAnimation = () => {
    if (speechFrame.current !== null) {
      cancelAnimationFrame(speechFrame.current);
      speechFrame.current = null;
    }
    pushLevel(0);
  };

  const pickVoice = async (selectedPersona = persona) => {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      const turkishVoices = voices.filter(voice => voice.language.toLowerCase().startsWith('tr'));
      const candidates = turkishVoices.length > 0 ? turkishVoices : voices;
      const voice =
        selectedPersona.voicePick === 'first'
          ? candidates[0]
          : candidates[Math.max(candidates.length - 1, 0)];
      return voice?.identifier;
    } catch {
      return undefined;
    }
  };

  const speakWithPersona = async (text: string, selectedPersona = persona) => {
    Speech.stop();
    stopSpeechAnimation();
    const voice = await pickVoice(selectedPersona);
    Speech.speak(text, {
      language: 'tr-TR',
      rate: selectedPersona.speechRate,
      pitch: selectedPersona.speechPitch,
      voice,
    });
  };

  const selectPersona = (nextPersona: Persona) => {
    setPersonaId(nextPersona.id);
    speakWithPersona(nextPersona.feedbackIntro, nextPersona);
  };

  const readReport = async () => {
    const spokenText = `${persona.feedbackIntro}\n\n${dictation.replace(/[#*`]/g, '')}`;
    await speakWithPersona(spokenText);
  };

  const startDictation = () => {
    if (Platform.OS !== 'web') {
      Alert.alert(
        'STT web demosunda aktif',
        'Expo AV mikrofon sinyali native cihazda calisir; tarayici demosunda Web Speech API raporu markdown olarak doldurur.',
      );
      return;
    }
    const SpeechRecognition =
      (globalThis as any).SpeechRecognition || (globalThis as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      Alert.alert('STT desteklenmiyor', 'Bu tarayicida Web Speech API bulunamadi.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        setDictation(`## Dikte Audit Report\n\n${transcript}`);
      }
    };
    recognition.start();
  };

  const addCycle = (state: ForgeState) => {
    setForgeLog(previous => [...previous, state]);
    if (state === 'STUCK') {
      setBridgeOpen(true);
    }
  };

  const openBridge = async () => {
    if (Platform.OS === 'web') {
      await Linking.openURL(jitsiUrl);
      return;
    }
    setBridgeOpen(true);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Phase A + B + C</Text>
        <Text style={styles.title}>Voice Avatar Forge</Text>
        <Text style={styles.copy}>
          Mikrofon RMS sinyali barlara ve avatar viseme durumuna ayni anda gider.
        </Text>
      </View>

      <View style={styles.personaRow}>
        {PERSONAS.map(item => (
          <Pressable
            key={item.id}
            style={[
              styles.personaButton,
              item.id === persona.id && { borderColor: item.color, backgroundColor: '#ffffff' },
            ]}
            onPress={() => selectPersona(item)}
          >
            <Text style={[styles.personaTitle, item.id === persona.id && { color: item.color }]}>
              {item.label}
            </Text>
            <Text style={styles.personaMeta}>{item.voiceHint}</Text>
          </Pressable>
        ))}
      </View>

      <AvatarStage rms={rms} accent={persona.color} />

      <View style={styles.signalHeader}>
        <View>
          <Text style={styles.panelTitle}>Voice signal</Text>
          <Text style={styles.panelMeta}>RMS {rms.toFixed(2)} / viseme {getViseme(rms)}</Text>
        </View>
        <View style={[styles.liveDot, (recording || webMicActive) && { backgroundColor: persona.color }]} />
      </View>
      <WaveBars levels={levels} accent={persona.color} />

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionButton, (recording || webMicActive) && styles.stopButton]}
          onPress={recording || webMicActive ? stopMic : startMic}
        >
          <Text style={styles.actionText}>
            {recording || webMicActive ? 'Mikrofonu Durdur' : 'Mikrofonu Baslat'}
          </Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={readReport}>
          <Text style={styles.secondaryText}>Raporu Avatar Okusun</Text>
        </Pressable>
      </View>

      <View style={styles.editor}>
        <Text style={styles.panelTitle}>Dikte raporu</Text>
        <TextInput
          value={dictation}
          onChangeText={setDictation}
          multiline
          style={styles.textArea}
          placeholder="Voice -> STT markdown raporu burada duzenlenir"
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.forgePanel}>
        <Text style={styles.panelTitle}>Forge stuck heuristigi</Text>
        <Text style={styles.panelMeta}>
          2 ardil FAIL/ROLLBACK veya STUCK secimi uzmana baglan butonunu acik duruma getirir.
        </Text>
        <View style={styles.cycleRow}>
          <Pressable style={styles.cycleButton} onPress={startDictation}>
            <Text style={styles.cycleText}>DIKTE ET</Text>
          </Pressable>
        </View>
        <View style={styles.cycleRow}>
          {(['PASS', 'FAIL', 'ROLLBACK', 'STUCK'] as ForgeState[]).map(state => (
            <Pressable key={state} style={styles.cycleButton} onPress={() => addCycle(state)}>
              <Text style={styles.cycleText}>{state}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.logText}>{forgeLog.join(' -> ')}</Text>
        <Pressable
          style={[styles.bridgeButton, !isStuck && styles.bridgeButtonIdle]}
          onPress={openBridge}
          disabled={!isStuck}
        >
          <Text style={styles.bridgeText}>{isStuck ? 'Uzmana Baglan' : 'Bridge kilitli'}</Text>
        </Pressable>
      </View>

      {bridgeOpen ? (
        <View style={styles.bridgeFrame}>
          <View style={styles.bridgeHeader}>
            <Text style={styles.panelTitle}>Jitsi Expert Bridge</Text>
            <Pressable onPress={() => setBridgeOpen(false)}>
              <Text style={styles.closeText}>Kapat</Text>
            </Pressable>
          </View>
          <WebView
            source={{ uri: jitsiUrl }}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
            style={styles.webview}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f4f6f5',
  },
  content: {
    padding: 18,
    paddingTop: 58,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 16,
  },
  kicker: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#10201d',
    fontSize: 30,
    fontWeight: '900',
    marginTop: 4,
  },
  copy: {
    color: '#4b5d58',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  personaRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  personaButton: {
    flex: 1,
    minHeight: 66,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d6ddd9',
    backgroundColor: '#fbfcfb',
    padding: 12,
    justifyContent: 'center',
  },
  personaTitle: {
    color: '#10201d',
    fontSize: 15,
    fontWeight: '900',
  },
  personaMeta: {
    color: '#64746f',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  avatarFrame: {
    height: 300,
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#dfe9e5',
    borderWidth: 1,
    borderColor: '#cbd8d3',
    marginBottom: 12,
  },
  assetNote: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 10,
    color: '#344541',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  signalHeader: {
    minHeight: 54,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe3df',
    borderBottomWidth: 0,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelTitle: {
    color: '#10201d',
    fontSize: 16,
    fontWeight: '900',
  },
  panelMeta: {
    color: '#66756f',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  liveDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ced8d3',
  },
  wavePanel: {
    height: 108,
    padding: 12,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe3df',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  barTrack: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    width: '100%',
    minHeight: 8,
    borderRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10201d',
  },
  stopButton: {
    backgroundColor: '#b91c1c',
  },
  actionText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd8d3',
  },
  secondaryText: {
    color: '#10201d',
    fontWeight: '900',
  },
  editor: {
    marginTop: 16,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe3df',
  },
  textArea: {
    minHeight: 150,
    color: '#111827',
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'top',
    padding: 12,
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: '#f7f9f8',
    borderWidth: 1,
    borderColor: '#dbe3df',
  },
  forgePanel: {
    marginTop: 16,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe3df',
  },
  cycleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  cycleButton: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e7ece9',
  },
  cycleText: {
    color: '#10201d',
    fontSize: 12,
    fontWeight: '900',
  },
  logText: {
    color: '#344541',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 12,
  },
  bridgeButton: {
    minHeight: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b91c1c',
    marginTop: 12,
  },
  bridgeButtonIdle: {
    backgroundColor: '#9aa8a2',
  },
  bridgeText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  bridgeFrame: {
    height: 480,
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd8d3',
    marginTop: 16,
  },
  bridgeHeader: {
    minHeight: 48,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#dbe3df',
  },
  closeText: {
    color: '#dc2626',
    fontWeight: '900',
  },
  webview: {
    flex: 1,
  },
});
