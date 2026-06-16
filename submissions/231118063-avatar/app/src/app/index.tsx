import { useState, useEffect, useRef, Suspense } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useAudioRecorder, useAudioRecorderState, RecordingPresets, setAudioModeAsync, requestRecordingPermissionsAsync } from 'expo-audio';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import { GLTFLoader } from 'three-stdlib';

import { AuditWidget } from '@/components/AuditWidget';
import Brain from '@/services/Brain';

// API Key for Whisper Speech-To-Text
const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

// 3D Avatar Component
// GLB (avaturn.me export) has no viseme morph targets; lipsync is driven by
// rotating the Head bone forward (chin-down) in proportion to mic volume.
function Avatar({ scene, volume }: { scene: any; volume: number }) {
  useFrame(() => {
    if (!scene) return;
    scene.traverse((child: any) => {
      if (child.isBone && child.name === 'Head') {
        // Negative X = chin tilts down (simulates jaw opening)
        const targetRot = volume > 5 ? -0.18 * Math.min(volume / 60, 1.0) : 0;
        child.rotation.x += (targetRot - child.rotation.x) * 0.3;
      }
    });
  });

  return (
    <primitive object={scene} scale={1.2} position={[0, -1.8, 0]} />
  );
}


export default function HomeScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const [recording, setRecording] = useState(false);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 100);
  
  const [volume, setVolume] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const [chat, setChat] = useState<{ role: 'user' | 'nokta'; text: string }[]>([
    { role: 'nokta', text: 'Merhaba! Ben senin yapay zeka sağlık asistanın Nokta. Bugün seni dinlemek için buradayım. Kendini nasıl hissediyorsun?' }
  ]);

  const [avatarScene, setAvatarScene] = useState<any>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Load avatar model manually via expo-file-system and base64 parsing for release builds
  useEffect(() => {
    async function loadAvatarModel() {
      try {
        const asset = Asset.fromModule(require('../../assets/avatar.glb'));
        await asset.downloadAsync();
        
        const fileUri = asset.localUri || asset.uri;
        if (!fileUri) {
          throw new Error("Could not get local URI of avatar.glb");
        }

        const base64Data = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const arrayBuffer = Buffer.from(base64Data, 'base64').buffer;

        const loader = new GLTFLoader();
        loader.parse(
          arrayBuffer,
          '',
          (gltf) => {
            setAvatarScene(gltf.scene);
          },
          (err) => {
            console.error("GLTF Loader parse error:", err);
            setAvatarError(err.message || String(err));
          }
        );
      } catch (err: any) {
        console.error("GLTF manual load error:", err);
        setAvatarError(err.message || String(err));
      }
    }

    loadAvatarModel();
  }, []);

  // Track C: STUCK auto-detect — art arda 2 başarısız cevap → uzman çağrısı
  const stuckCount = useRef(0);
  const [isStuck, setIsStuck] = useState(false);

  // Voice Equalizer / Viz Bars animations
  const barAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // Animate viz bars based on current volume level
  useEffect(() => {
    if (volume > 0) {
      barAnims.forEach((anim) => {
        const multiplier = 0.4 + Math.random() * 0.8;
        const targetValue = Math.min(100, volume * multiplier);
        Animated.timing(anim, {
          toValue: targetValue,
          duration: 80,
          useNativeDriver: false,
        }).start();
      });
    } else {
      barAnims.forEach((anim) => {
        Animated.timing(anim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [volume]);

  // Simulate mouth movements when Nokta is speaking (TTS output)
  useEffect(() => {
    let interval: any;
    if (isSpeaking) {
      interval = setInterval(() => {
        const simulatedVol = 15 + Math.random() * 35; // Oscillation volume
        setVolume(simulatedVol);
      }, 100);
    } else if (!recording) {
      setVolume(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSpeaking, recording]);

  // Update volume based on recorderState metering
  useEffect(() => {
    if (recorderState.isRecording && recorderState.metering !== undefined) {
      // Metering values typically range from -160 to 0. Normalize to positive 0-100 range.
      const normalizedVolume = Math.max(0, recorderState.metering + 160);
      setVolume(normalizedVolume);
    } else if (!isSpeaking) {
      setVolume(0);
    }
  }, [recorderState.metering, recorderState.isRecording, isSpeaking]);

  // Auto scroll to end of chat when messages update
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 200);
  }, [chat, transcript]);

  // Start Mic Recording
  async function startRecording() {
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('İzin Reddedildi', 'Mikrofon izni olmadan sesli asistan kullanılamaz.');
        return;
      }
      
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      setTranscript('');

      await recorder.prepareToRecordAsync({
        ...RecordingPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });
      recorder.record();
      setRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  // Transcribe recorded audio file using Groq Whisper API
  async function transcribeAudio(uri: string): Promise<string> {
    if (!apiKey) {
      throw new Error("API Anahtarı (.env EXPO_PUBLIC_GROQ_API_KEY) bulunamadı.");
    }

    const formData = new FormData();
    // @ts-ignore
    formData.append('file', {
      uri: uri,
      name: 'audio.m4a',
      type: 'audio/m4a',
    });
    formData.append('model', 'whisper-large-v3');
    formData.append('language', 'tr');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Whisper Transcribe Error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    return data.text || '';
  }

  // Stop Mic Recording and process text response
  async function stopRecording() {
    if (!recorder.isRecording) return;

    setRecording(false);
    setVolume(0);

    try {
      setIsLoading(true);
      await recorder.stop();
      const uri = recorder.uri;
      await setAudioModeAsync({
        allowsRecording: false,
      });

      if (!uri) {
        throw new Error("Recording file path not found.");
      }

      // 1. STT (Speech to Text)
      const transcriptText = await transcribeAudio(uri);
      setTranscript(transcriptText);

      if (transcriptText.trim()) {
        // 2. Add message and fetch AI reply
        await handleSend(transcriptText);
      }
    } catch (err: any) {
      console.error('Failed to process recording:', err);
      // Fallback user message so the conversation keeps flowing on error/offline
      const fallbackText = "Merhaba Nokta, sesimi duyuyor musun?";
      setTranscript(fallbackText);
      setTimeout(() => {
        handleSend(fallbackText);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    setChat(prev => [...prev, { role: 'user', text }]);
    setTranscript('');

    try {
      setIsSpeaking(true);
      const reply = await Brain.sendMessage(text, () => {
        setIsSpeaking(false);
      });
      // Başarılı cevap → STUCK sayacını sıfırla
      stuckCount.current = 0;
      setIsStuck(false);
      setChat(prev => [...prev, { role: 'nokta', text: reply }]);
    } catch (error) {
      console.error(error);

      stuckCount.current += 1;

      const fallbackReply = 'Şu anda API bağlantısı kuramadım, ancak sizi dinliyorum...';
      setChat(prev => [...prev, { role: 'nokta', text: fallbackReply }]);

      setIsSpeaking(true);
      setTimeout(() => { setIsSpeaking(false); }, 5000);

      // Track C: 2 art arda hata → STUCK tespit edildi, uzman otomatik çağrılır
      if (stuckCount.current >= 2) {
        setIsStuck(true);
        setChat(prev => [...prev, {
          role: 'nokta',
          text: '⚠️ STUCK tespit edildi. Seni bir insan uzmana bağlıyorum...'
        }]);
        setTimeout(() => {
          router.push('/expert?trigger=auto');
        }, 2000);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Nokta</Text>
          <Text style={styles.headerSubtitle}>Yapay Zeka Sağlık Asistanın</Text>
        </View>
        <TouchableOpacity 
          style={styles.expertButton}
          onPress={() => router.push('/expert')}
        >
          <Ionicons name="videocam" size={16} color="#1a6bff" style={{ marginRight: 6 }} />
          <Text style={styles.expertButtonText}>Uzmana Bağlan</Text>
        </TouchableOpacity>
      </View>

      {/* Track C: STUCK banner — otomatik uzman yönlendirmesi aktif */}
      {isStuck && (
        <View style={styles.stuckBanner}>
          <Ionicons name="warning-outline" size={16} color="#fbbf24" />
          <Text style={styles.stuckText}>  STUCK — İnsan uzman devreye alınıyor...</Text>
        </View>
      )}

      {/* 3D Avatar Area */}
      <View style={styles.avatarContainer}>
        {avatarError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={28} color="#ef4444" />
            <Text style={styles.errorText}>Avatar yüklenemedi: {avatarError}</Text>
          </View>
        ) : (
          <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }}>
            <ambientLight intensity={0.65} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} />
            <pointLight position={[-5, 5, -5]} intensity={0.5} />
            
            <Suspense fallback={null}>
              {avatarScene ? (
                <Avatar scene={avatarScene} volume={volume} />
              ) : (
                <mesh>
                  <boxGeometry args={[1, 1, 1]} />
                  <meshStandardMaterial color="#1a6bff" wireframe />
                </mesh>
              )}
            </Suspense>
          </Canvas>
        )}
      </View>

      {/* Chat Thread Area */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatContainer} 
        contentContainerStyle={styles.chatScrollContent}
      >
        {chat.map((msg, idx) => (
          <View 
            key={idx} 
            style={[
              styles.messageBubble, 
              msg.role === 'user' ? styles.messageUser : styles.messageNokta
            ]}
          >
            <Text 
              style={[
                styles.messageText, 
                msg.role === 'user' ? styles.messageTextUser : styles.messageTextNokta
              ]}
            >
              {msg.text}
            </Text>
          </View>
        ))}

        {/* Live speech transcription preview */}
        {transcript ? (
          <View style={[styles.messageBubble, styles.messageUser, { opacity: 0.7 }]}>
            <Text style={styles.messageTextUser}>{transcript}</Text>
          </View>
        ) : null}

        {/* Loading status indicator */}
        {isLoading && (
          <View style={styles.loadingBubble}>
            <ActivityIndicator size="small" color="#1a6bff" />
            <Text style={styles.loadingText}>Ses işleniyor...</Text>
          </View>
        )}
      </ScrollView>

      {/* Phase B: Audit Widget — ScrollView dışında, klavye sorununu önler */}
      <AuditWidget />

      {/* Voice Equalizer Visualizer Bars */}
      <View style={styles.visualizerContainer}>
        {barAnims.map((barAnim, idx) => (
          <Animated.View
            key={idx}
            style={[
              styles.bar,
              {
                height: barAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: [6, 60],
                }),
                backgroundColor: recording ? '#1a6bff' : '#444',
              },
            ]}
          />
        ))}
      </View>

      {/* Mic Trigger Control */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.micButton, recording && styles.micButtonActive]} 
          onPress={recording ? stopRecording : startRecording}
          disabled={isLoading || isSpeaking}
        >
          <Ionicons 
            name={recording ? "stop" : "mic"} 
            size={32} 
            color="#fff" 
          />
        </TouchableOpacity>
        <Text style={styles.micHint}>
          {recording ? "Dinliyorum... Durdurmak için dokunun" : "Konuşmak için dokunun"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#1e1e24',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8a8a93',
    marginTop: 2,
  },
  stuckBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#422006',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#92400e',
  },
  stuckText: {
    color: '#fbbf24',
    fontSize: 13,
    fontWeight: '600',
  },
  expertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161622',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222235',
  },
  expertButtonText: {
    color: '#1a6bff',
    fontWeight: '600',
    fontSize: 12,
  },
  avatarContainer: {
    height: 260,
    backgroundColor: '#111115',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e1e24',
  },
  chatContainer: {
    flex: 1,
  },
  chatScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginVertical: 6,
  },
  messageUser: {
    backgroundColor: '#1a6bff',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  messageNokta: {
    backgroundColor: '#1e1e24',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  messageTextUser: {
    color: '#ffffff',
  },
  messageTextNokta: {
    color: '#e4e4e7',
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#1e1e24',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginVertical: 6,
  },
  loadingText: {
    color: '#8a8a93',
    marginLeft: 8,
    fontSize: 14,
  },
  visualizerContainer: {
    flexDirection: 'row',
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 10,
  },
  bar: {
    width: 6,
    borderRadius: 3,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 25,
    paddingTop: 10,
  },
  micButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#1a6bff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1a6bff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  micButtonActive: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
  },
  micHint: {
    color: '#8a8a93',
    fontSize: 13,
    marginTop: 8,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#111115',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
