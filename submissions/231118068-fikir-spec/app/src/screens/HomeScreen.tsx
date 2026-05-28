import React, { Suspense, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import { Audio } from 'expo-av';
import { File, Paths } from 'expo-file-system';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { useGLTF } from '@react-three/drei/native';
import * as THREE from 'three';
import WebView from 'react-native-webview';
import Animated, {
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { StackNavigationProp as NativeStackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { loadMessages } from '../utils/messageStorage';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const VOICE_BAR_COUNT = 4;
const AVATAR_URI = Image.resolveAssetSource(require('../../avatar.glb')).uri;
const JITSI_ROOM_URL = 'https://meet.jit.si/nokta-uzman-231118068';
const LIPSYNC_TARGETS = [
  'jawOpen',
  'mouthOpen',
  'viseme_aa',
  'viseme_AA',
  'viseme_O',
  'viseme_U',
  'mouthFunnel',
  'mouthPucker',
  'MouthOpen',
  'JawOpen',
];

type SpeechSubscription = {
  remove: () => void;
};

type LipsyncMesh = {
  mesh: THREE.Mesh;
  activeIndices: number[];
  resetIndices: number[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function meteringToLevel(metering?: number) {
  if (typeof metering !== 'number') {
    return 0;
  }

  return clamp((metering + 58) / 58, 0, 1);
}

function formatDraft(text: string) {
  const trimmed = text.trim();

  return trimmed.length > 0 ? `## Sesli Fikir Taslağı\n\n${trimmed}` : '';
}

function AvatarModel({ levelRef }: { levelRef: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const targetMeshesRef = useRef<LipsyncMesh[]>([]);
  const jawBonesRef = useRef<THREE.Bone[]>([]);
  const currentMouthRef = useRef(0);
  const gltf = useGLTF(AVATAR_URI);

  useEffect(() => {
    const targetMeshes: LipsyncMesh[] = [];
    const jawBones: THREE.Bone[] = [];

    gltf.scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      const dictionary = mesh.morphTargetDictionary;
      const influences = mesh.morphTargetInfluences;

      if (dictionary && influences) {
        const entries = Object.entries(dictionary);
        const activeIndices = entries
          .filter(([name]) => LIPSYNC_TARGETS.some((target) => name.toLowerCase() === target.toLowerCase()))
          .map(([, index]) => index);
        const resetIndices = entries
          .filter(([name]) => /viseme|mouth|jaw|lips/i.test(name))
          .map(([, index]) => index);

        if (activeIndices.length > 0 || resetIndices.length > 0) {
          targetMeshes.push({ mesh, activeIndices, resetIndices });
        }
      }

      if (object instanceof THREE.Bone && /jaw|mouth|chin/i.test(object.name)) {
        jawBones.push(object);
      }
    });

    targetMeshesRef.current = targetMeshes;
    jawBonesRef.current = jawBones;
  }, [gltf.scene]);

  useFrame((_, delta) => {
    const targetMouth = clamp(levelRef.current * 1.35, 0, 1);
    currentMouthRef.current += (targetMouth - currentMouthRef.current) * Math.min(1, delta * 18);

    for (const { mesh, activeIndices, resetIndices } of targetMeshesRef.current) {
      if (!mesh.morphTargetInfluences) {
        continue;
      }

      for (const index of resetIndices) {
        mesh.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          mesh.morphTargetInfluences[index],
          0,
          0.42
        );
      }

      for (const index of activeIndices) {
        mesh.morphTargetInfluences[index] = currentMouthRef.current;
      }
    }

    for (const bone of jawBonesRef.current) {
      bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, currentMouthRef.current * 0.34, 0.35);
    }
  });

  return (
    <group ref={groupRef} position={[0, -1.6, 0]} rotation={[0, 0, 0]} scale={1}>
      <primitive object={gltf.scene} />
    </group>
  );
}

function AvatarStage({ levelRef }: { levelRef: React.MutableRefObject<number> }) {
  return (
    <View style={styles.avatarStage}>
      <Canvas
        style={styles.avatarCanvas}
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0.18, 1.2], fov: 42 }}
      >
        <color attach="background" args={['#111111']} />
        <ambientLight intensity={1.7} />
        <directionalLight position={[1.8, 2.4, 3.2]} intensity={2.6} />
        <directionalLight position={[-1.6, 1.4, 1.4]} intensity={0.7} />
        <Suspense fallback={null}>
          <AvatarModel levelRef={levelRef} />
        </Suspense>
      </Canvas>
    </View>
  );
}

function VoiceBar({
  index,
  level,
  pulse,
}: {
  index: number;
  level: SharedValue<number>;
  pulse: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const pulseLift = interpolate(pulse.value, [0, 1], [0.76, 1.18 + index * 0.04]);
    const voiceLift = interpolate(level.value, [0, 1], [10 + index * 2, 58 - Math.abs(index - 1.5) * 7]);
    const height = voiceLift * (level.value > 0.04 ? pulseLift : 1);

    return {
      height,
      opacity: interpolate(level.value, [0, 1], [0.32, 1]),
      transform: [{ scaleY: interpolate(level.value, [0, 1], [0.82, 1]) }],
    };
  }, [index]);

  return <Animated.View style={[styles.voiceBar, animatedStyle]} />;
}

function VoiceVisualizer({
  level,
  pulse,
}: {
  level: SharedValue<number>;
  pulse: SharedValue<number>;
}) {
  return (
    <View style={styles.visualizer} accessibilityLabel="Ses görselleştirici">
      {Array.from({ length: VOICE_BAR_COUNT }).map((_, index) => (
        <VoiceBar key={index} index={index} level={level} pulse={pulse} />
      ))}
    </View>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const [idea, setIdea] = useState('');
  const [replyCount, setReplyCount] = useState(0);
  const [hasMessages, setHasMessages] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceDraft, setVoiceDraft] = useState('');
  const [interimText, setInterimText] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [forgeFailCount, setForgeFailCount] = useState(0);
  const [isExpertCallActive, setIsExpertCallActive] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState('');
  const recordingRef = useRef<Audio.Recording | null>(null);
  const speechSubscriptionsRef = useRef<SpeechSubscription[]>([]);
  const finalTranscriptRef = useRef('');
  const interimTranscriptRef = useRef('');
  const voiceLevelRef = useRef(0);
  const level = useSharedValue(0);
  const pulse = useSharedValue(0);

  useFocusEffect(
    React.useCallback(() => {
      loadMessages().then((msgs) => {
        setHasMessages(msgs.length > 0);
        setReplyCount(msgs.filter((m) => m.replies.length > 0).length);
      });
    }, [])
  );

  useEffect(() => {
    return () => {
      void stopVoiceCapture(false);
    };
  }, []);

  const canProceed = idea.trim().length >= 10;

  function updateDraft(finalText: string, interim = '') {
    const draft = formatDraft([finalText.trim(), interim.trim()].filter(Boolean).join(' '));

    setVoiceDraft(draft);
    interimTranscriptRef.current = interim;
    setInterimText(interim);
  }

  function clearSpeechSubscriptions() {
    speechSubscriptionsRef.current.forEach((subscription) => subscription.remove());
    speechSubscriptionsRef.current = [];
  }

  async function startVoiceCapture() {
    setVoiceError('');
    finalTranscriptRef.current = '';
    updateDraft('', '');

    try {
      const audioPermission = await Audio.requestPermissionsAsync();
      const speechPermission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!audioPermission.granted || speechPermission.status !== 'granted') {
        setVoiceError('Mikrofon ve konuşma tanıma izni gerekli.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });

      const recording = new Audio.Recording();
      recording.setProgressUpdateInterval(90);
      recording.setOnRecordingStatusUpdate((status) => {
        const nextLevel = status.isRecording ? meteringToLevel(status.metering) : 0;
        voiceLevelRef.current = nextLevel;
        level.value = withTiming(nextLevel, { duration: 120 });
      });

      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.LOW_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;

      clearSpeechSubscriptions();
      speechSubscriptionsRef.current = [
        ExpoSpeechRecognitionModule.addListener('result', (event) => {
          const transcript = event.results[0]?.transcript?.trim() ?? '';

          if (!transcript) {
            return;
          }

          if (event.isFinal) {
            finalTranscriptRef.current = [finalTranscriptRef.current, transcript]
              .filter(Boolean)
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim();
            updateDraft(finalTranscriptRef.current, '');
          } else {
            updateDraft(finalTranscriptRef.current, transcript);
          }
        }),
        ExpoSpeechRecognitionModule.addListener('error', (event) => {
          setVoiceError(event.message || 'Konuşma tanıma başlatılamadı.');
        }),
        ExpoSpeechRecognitionModule.addListener('end', () => {
          pulse.value = withTiming(0, { duration: 180 });
          level.value = withTiming(0, { duration: 180 });
          setIsRecording(false);
        }),
      ];

      ExpoSpeechRecognitionModule.start({
        lang: 'tr-TR',
        interimResults: true,
        continuous: true,
        addsPunctuation: true,
        volumeChangeEventOptions: {
          enabled: true,
          intervalMillis: 100,
        },
      });

      pulse.value = withRepeat(withTiming(1, { duration: 520 }), -1, true);
      setIsRecording(true);
    } catch (error) {
      setVoiceError(error instanceof Error ? error.message : 'Ses yakalama başlatılamadı.');
      await stopVoiceCapture(false);
    }
  }

  async function stopVoiceCapture(keepDraft = true) {
    cancelAnimation(pulse);
    voiceLevelRef.current = 0;
    pulse.value = withTiming(0, { duration: 180 });
    level.value = withTiming(0, { duration: 180 });

    try {
      ExpoSpeechRecognitionModule.stop();
      await new Promise((resolve) => setTimeout(resolve, 350));
    } catch {
      // The native recognizer may already be stopped by the platform.
    }

    clearSpeechSubscriptions();

    const recording = recordingRef.current;
    recordingRef.current = null;

    if (recording) {
      recording.setOnRecordingStatusUpdate(null);

      try {
        await recording.stopAndUnloadAsync();
      } catch {
        // Android can throw if stop happens before native audio has flushed.
      }
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    const readyDraft = formatDraft(
      [finalTranscriptRef.current.trim(), interimTranscriptRef.current.trim()].filter(Boolean).join(' ')
    );

    if (keepDraft && readyDraft) {
      setVoiceDraft(readyDraft);
      setIdea(readyDraft);
    }

    setInterimText('');
    setIsRecording(false);
  }

  function handleVoiceButtonPress() {
    if (isRecording) {
      void stopVoiceCapture(true);
      return;
    }

    void startVoiceCapture();
  }

  function openExpertCall() {
    setBridgeStatus('');
    setIsExpertCallActive(true);
  }

  function simulateForgeRollback() {
    setForgeFailCount((currentCount) => {
      const nextCount = currentCount + 1;

      if (nextCount >= 2) {
        setIsExpertCallActive(true);
      }

      return nextCount;
    });
  }

  async function endExpertCall() {
    const bridgeContent = [
      '# BRIDGE',
      '',
      '## Görüşme Özeti',
      '- Kullanıcı FORGE döngüsünde takıldı ve uzman görüşmesine bağlandı.',
      '- Jitsi odası: https://meet.jit.si/nokta-uzman-231118068',
      '- Uzman, fikrin kapsamını netleştirdi ve sonraki iterasyon için karar noktalarını belirledi.',
      '',
      '## Otomatik Transkript Simülasyonu',
      'Kullanıcı: Fikir spec aşamasında iki kez geri döndü ve hangi varsayımı test edeceğini netleştiremedi.',
      'Uzman: Önce hedef kullanıcıyı, sonra tek ana problemi ve başarı metriğini sabitleyelim.',
      'Kullanıcı: Tamam, FORGE döngüsüne bu üç netlikle geri dönüyorum.',
      '',
      `## Mevcut Sesli Taslak`,
      voiceDraft || idea || 'Henüz taslak yok.',
      '',
    ].join('\n');

    const bridgeFile = new File(Paths.document, 'BRIDGE.md');
    bridgeFile.write(bridgeContent);
    console.log(bridgeContent);
    setBridgeStatus(`BRIDGE.md yazıldı: ${bridgeFile.uri}`);
    setIsExpertCallActive(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.title}>NOKTA</Text>
          <Text style={styles.subtitle}>Fikir Yakalama ve Geliştirme</Text>
        </View>

        <AvatarStage levelRef={voiceLevelRef} />

        <Text style={styles.label}>Ham fikrin</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={6}
          placeholder="Fikrini bir iki cümleyle anlat. Filtreleme — sadece noktayı yakala."
          placeholderTextColor="#666"
          value={idea}
          onChangeText={setIdea}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>
          {idea.trim().length} karakter{idea.trim().length < 10 ? ' (min 10)' : ''}
        </Text>

        <View style={styles.voicePanel}>
          <View style={styles.voiceHeader}>
            <View>
              <Text style={styles.voiceTitle}>Sesli Taslak</Text>
              <Text style={styles.voiceStatus}>{isRecording ? 'Dinleniyor' : 'Hazır'}</Text>
            </View>
            <VoiceVisualizer level={level} pulse={pulse} />
          </View>

          <Text style={styles.voiceDraft} numberOfLines={5}>
            {voiceDraft || 'Konuşmaya başladığında markdown taslağı burada akacak.'}
          </Text>

          {voiceError ? <Text style={styles.voiceError}>{voiceError}</Text> : null}

          <TouchableOpacity
            style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
            onPress={handleVoiceButtonPress}
            activeOpacity={0.86}
          >
            <Text style={styles.voiceButtonText}>{isRecording ? 'Kaydı Bitir' : 'Sesle Yakala'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stuckPanel}>
          <View style={{ flex: 1 }}>
            <Text style={styles.stuckTitle}>STUCK Yönetimi</Text>
            <Text style={styles.stuckSub}>
              FORGE fail/rollback: {forgeFailCount}/2
            </Text>
            {bridgeStatus ? <Text style={styles.bridgeStatus}>{bridgeStatus}</Text> : null}
          </View>
          <View style={styles.stuckActions}>
            <TouchableOpacity
              style={styles.stuckGhostButton}
              onPress={simulateForgeRollback}
              activeOpacity={0.86}
            >
              <Text style={styles.stuckGhostText}>FAIL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stuckButton}
              onPress={openExpertCall}
              activeOpacity={0.86}
            >
              <Text style={styles.stuckButtonText}>Uzmana Bağlan</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, !canProceed && styles.buttonDisabled]}
          onPress={() => navigation.navigate('Questions', { idea: idea.trim() })}
          disabled={!canProceed}
        >
          <Text style={styles.buttonText}>Yakala →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.expertBanner}
          onPress={() => navigation.navigate('Experts', {})}
          activeOpacity={0.85}
        >
          <Text style={styles.bannerIcon}>👨‍💼</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Uzman Desteği Al</Text>
            <Text style={styles.bannerSub}>Deneyimli mentorlarla çalış</Text>
          </View>
          <Text style={styles.bannerArrow}>›</Text>
        </TouchableOpacity>

        {hasMessages && (
          <TouchableOpacity
            style={styles.inboxBanner}
            onPress={() => navigation.navigate('UserInbox')}
            activeOpacity={0.85}
          >
            <Text style={styles.bannerIcon}>📬</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Gönderilen Mesajlarım</Text>
              <Text style={styles.bannerSub}>
                {replyCount > 0 ? `${replyCount} uzman cevap verdi` : 'Cevap bekleniyor'}
              </Text>
            </View>
            <Text style={styles.bannerArrow}>›</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.hint}>
          AI fikrni spec'e dönüştürmek için 5 mühendislik sorusu soracak.
        </Text>
      </ScrollView>

      <Modal
        visible={isExpertCallActive}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => void endExpertCall()}
      >
        <View style={styles.callModal}>
          <View style={styles.callHeader}>
            <View>
              <Text style={styles.callTitle}>Uzman Görüşmesi</Text>
              <Text style={styles.callSub}>meet.jit.si/nokta-uzman-231118068</Text>
            </View>
            <TouchableOpacity style={styles.endCallButton} onPress={() => void endExpertCall()}>
              <Text style={styles.endCallText}>Görüşmeyi Sonlandır</Text>
            </TouchableOpacity>
          </View>

          <WebView
            source={{ uri: JITSI_ROOM_URL }}
            style={styles.callWebView}
            allowsInlineMediaPlayback
            allowsFullscreenVideo
            javaScriptEnabled
            domStorageEnabled
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            mediaPlaybackRequiresUserAction={false}
            mediaCapturePermissionGrantType="grant"
            javaScriptCanOpenWindowsAutomatically
            setSupportMultipleWindows={false}
            geolocationEnabled
            allowFileAccess
            allowFileAccessFromFileURLs
            allowUniversalAccessFromFileURLs
            mixedContentMode="always"
            originWhitelist={['https://*']}
            startInLoadingState
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  inner: { flexGrow: 1, padding: 24, justifyContent: 'center', gap: 0 },
  header: { alignItems: 'center', marginBottom: 40 },
  dot: { fontSize: 64, color: '#6c47ff', lineHeight: 64 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 6 },
  subtitle: { fontSize: 13, color: '#888', marginTop: 4, letterSpacing: 2 },
  avatarStage: {
    height: 220,
    overflow: 'hidden',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#242424',
    backgroundColor: '#111',
    marginBottom: 22,
  },
  avatarCanvas: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  charCount: { color: '#555', fontSize: 12, marginTop: 6, textAlign: 'right' },
  voicePanel: {
    backgroundColor: '#111',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#242424',
    padding: 14,
    marginTop: 16,
  },
  voiceHeader: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  voiceTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  voiceStatus: {
    color: '#777',
    fontSize: 12,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  visualizer: {
    width: 96,
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  voiceBar: {
    width: 10,
    minHeight: 10,
    borderRadius: 999,
    backgroundColor: '#f4f0ff',
    shadowColor: '#8b6dff',
    shadowOpacity: 0.55,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  voiceDraft: {
    minHeight: 86,
    color: '#d8d8d8',
    backgroundColor: '#181818',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#282828',
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  voiceError: { color: '#ff8c8c', fontSize: 12, lineHeight: 18, marginTop: 8 },
  voiceButton: {
    backgroundColor: '#f4f0ff',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 12,
  },
  voiceButtonActive: { backgroundColor: '#ff5f7a' },
  voiceButtonText: { color: '#0b0b0b', fontSize: 15, fontWeight: '800' },
  stuckPanel: {
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#2b253b',
    marginTop: 12,
  },
  stuckTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  stuckSub: { color: '#888', fontSize: 12, marginTop: 4 },
  bridgeStatus: { color: '#8fd8a8', fontSize: 11, lineHeight: 16, marginTop: 6 },
  stuckActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stuckGhostButton: {
    minWidth: 52,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#393939',
  },
  stuckGhostText: { color: '#bbb', fontSize: 12, fontWeight: '800' },
  stuckButton: {
    backgroundColor: '#35d0ba',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  stuckButtonText: { color: '#051310', fontSize: 12, fontWeight: '900' },
  callModal: { flex: 1, backgroundColor: '#050505' },
  callHeader: {
    minHeight: 96,
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  callTitle: { color: '#fff', fontSize: 17, fontWeight: '900' },
  callSub: { color: '#777', fontSize: 11, marginTop: 4 },
  endCallButton: {
    backgroundColor: '#ff5f7a',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  endCallText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  callWebView: { flex: 1, backgroundColor: '#050505' },
  button: {
    backgroundColor: '#6c47ff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  buttonDisabled: { opacity: 0.35 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 1 },
  expertBanner: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 10,
  },
  inboxBanner: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#1e3a2a',
    marginBottom: 10,
  },
  bannerIcon: { fontSize: 28 },
  bannerTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  bannerSub: { color: '#888', fontSize: 12, marginTop: 2 },
  bannerArrow: { color: '#6c47ff', fontSize: 22 },
  hint: { color: '#444', fontSize: 13, textAlign: 'center', marginTop: 10, lineHeight: 20 },
});
