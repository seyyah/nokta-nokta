import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform, Animated, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuditWidget from '../components/AuditWidget';
import * as Speech from 'expo-speech';

// Lazy load Canvas + Avatar only on native (not web)
let Canvas: any = null;
let AvatarView: any = null;
let VoiceVisualizer: any = null;
let OrbitControls: any = null;
let WebViewComponent: any = null;

if (Platform.OS !== 'web') {
  Canvas = require('@react-three/fiber').Canvas;
  AvatarView = require('../components/AvatarView').default;
  VoiceVisualizer = require('../components/VoiceVisualizer').default;
  OrbitControls = require('@react-three/drei').OrbitControls;
  WebViewComponent = require('react-native-webview').WebView;
}

// Web-only fake visualizer bars animated with JS
function WebVisualizer({ audioLevel }: { audioLevel: number }) {
  const bars = useRef(Array.from({ length: 15 }).map(() => new Animated.Value(0.1))).current;

  useEffect(() => {
    bars.forEach((bar, index) => {
      const distanceToCenter = Math.abs(index - 7) / 7;
      const baseScale = Math.max(0.1, 1 - distanceToCenter);
      const randomScale = 0.1 + (audioLevel * baseScale * (0.8 + Math.random() * 0.4));
      Animated.timing(bar, {
        toValue: audioLevel < 0.05 ? 0.1 : randomScale,
        duration: 80,
        useNativeDriver: true,
      }).start();
    });
  }, [audioLevel]);

  return (
    <View style={vizStyles.container}>
      {bars.map((bar, i) => (
        <Animated.View key={i} style={[vizStyles.bar, { transform: [{ scaleY: bar }] }]} />
      ))}
    </View>
  );
}

const vizStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  bar: {
    width: 6,
    height: 80,
    backgroundColor: '#00ffcc',
    marginHorizontal: 3,
    borderRadius: 3,
  },
});

// Web-only fake avatar placeholder
function WebAvatarPlaceholder({ audioLevel }: { audioLevel: number }) {
  const mouthScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(mouthScale, {
      toValue: 1 + audioLevel * 0.5,
      duration: 80,
      useNativeDriver: true,
    }).start();
  }, [audioLevel]);

  return (
    <View style={avatarStyles.container}>
      {/* Face circle */}
      <View style={avatarStyles.face}>
        {/* Eyes */}
        <View style={avatarStyles.eyes}>
          <View style={avatarStyles.eye} />
          <View style={avatarStyles.eye} />
        </View>
        {/* Animated mouth */}
        <Animated.View style={[avatarStyles.mouth, { transform: [{ scaleY: mouthScale }] }]} />
      </View>
      <Text style={avatarStyles.label}>🎙️ Avatar (Mobil için 3D)</Text>
    </View>
  );
}

const avatarStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
  },
  face: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#1e3a3a',
    borderWidth: 3,
    borderColor: '#00ffcc',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00ffcc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  eyes: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 20,
  },
  eye: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00ffcc',
  },
  mouth: {
    width: 60,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00ffcc',
  },
  label: {
    color: '#666',
    marginTop: 16,
    fontSize: 12,
  },
});

const AI_EXPERT_RESPONSES = [
  "Endişelenmeyin, logları inceledim. Veritabanı whitelist ayarlarınızda 5432 portu kapalı görünüyor. Güvenlik grubuna bu izni eklediğinizde sistem düzelecektir.",
  "Sorun soğutma vanalarındaki termal eşik aşımı. Konfigürasyon dosyasındaki max-temp limitini 85 dereceye yükseltip Forge döngüsünü tekrar deneyin.",
  "Sistem günlüklerinde yetki hatası (Permission Denied) görüyorum. Derleme klasöründeki yazma izinlerini chmod ile güncelleyip tekrar deneyin.",
  "Endişelenmeyin, veritabanı IP whitelist ayarlarını güncelledim. Şimdi test döngüsünü tekrar başlatabilirsiniz."
];

export default function HomeScreen() {
  const [audioLevel, setAudioLevel] = useState(0);
  const [expertCallActive, setExpertCallActive] = useState(false);
  const [debugError, setDebugError] = useState<string | null>(null);
  const [morphCount, setMorphCount] = useState<number | null>(null);
  const [agentSpeakingText, setAgentSpeakingText] = useState<string | null>(null);
  const [expertMode, setExpertMode] = useState<'ai' | 'webrtc'>('ai');
  const [userQuestion, setUserQuestion] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const isWeb = Platform.OS === 'web';

  const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyDydw1Cmq3KxxqMTyMiRZvXC0U577MvBHk';

  const askAIExpert = async () => {
    const question = userQuestion.trim() || "Sistem kilitlendi, ne yapmalıyım? Lütfen kısa ve net Türkçe teknik çözüm önerisi sun.";
    setIsAiLoading(true);
    setUserQuestion('');
    setAgentSpeakingText("Düşünüyorum...");

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: question }]
            }],
            systemInstruction: {
              parts: [{
                text: "Sen bir devops/yazılım uzmanı yapay zekasın. Kullanıcı ve Forge agent sistemi kilitledi. Onlara çok kısa, net, teknik ve çözüm odaklı Türkçe cevap ver. Maksimum 2-3 kısa cümle olsun."
              }]
            }
          })
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP Error ${response.status}`);
      }

      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Bağlantı hatası oluştu, lütfen tekrar deneyin.";
      const cleanText = responseText.replace(/\*\*/g, '').replace(/\*/g, '');
      setAgentSpeakingText(cleanText);

      Speech.stop();
      Speech.speak(cleanText, {
        language: 'tr-TR',
        onStart: () => {
          let t = 0;
          const talkInterval = setInterval(() => {
            setAudioLevel(0.2 + Math.sin(t) * 0.25 + Math.random() * 0.1);
            t += 0.55;
          }, 80);
          (global as any).talkIntervalId = talkInterval;
        },
        onDone: () => {
          clearInterval((global as any).talkIntervalId);
          setAudioLevel(0);
          setAgentSpeakingText(null);
        },
        onError: () => {
          clearInterval((global as any).talkIntervalId);
          setAudioLevel(0);
          setAgentSpeakingText(null);
        }
      });

    } catch (err: any) {
      console.error(err);
      setDebugError(err.message || String(err));
      const fallbackText = "Veritabanı whitelist ayarlarınızı ve 5432 portunu kontrol edin.";
      setAgentSpeakingText(fallbackText);
      Speech.stop();
      Speech.speak(fallbackText, { language: 'tr-TR' });
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    if (expertCallActive) {
      const introText = "Merhaba uzmanım! Geliştiriciyle yürüttüğümüz Forge döngüsü iki cycle üst üste başarısız oldu ve sistem kilitlendi. İncelemeniz için FORGE.md dosyasını ekranınıza yansıtıyorum. Desteğinizi rica ederiz.";
      setAgentSpeakingText(introText);

      // Start speaking
      Speech.speak(introText, {
        language: 'tr-TR',
        onStart: () => {
          let t = 0;
          const talkInterval = setInterval(() => {
            // Fluctuate level for mouth movement / head bobbing
            setAudioLevel(0.25 + Math.sin(t) * 0.25 + Math.random() * 0.1);
            t += 0.5;
          }, 80);
          (global as any).talkIntervalId = talkInterval;
        },
        onDone: () => {
          clearInterval((global as any).talkIntervalId);
          setAudioLevel(0);
          setAgentSpeakingText(null);
        },
        onError: (err) => {
          console.error("Speech error", err);
          clearInterval((global as any).talkIntervalId);
          setAudioLevel(0);
          setAgentSpeakingText(null);
        }
      });
    } else {
      Speech.stop();
      if ((global as any).talkIntervalId) {
        clearInterval((global as any).talkIntervalId);
      }
      setAudioLevel(0);
      setAgentSpeakingText(null);
    }

    return () => {
      Speech.stop();
      if ((global as any).talkIntervalId) {
        clearInterval((global as any).talkIntervalId);
      }
    };
  }, [expertCallActive]);

  // Web mic simulation - tap the screen area to simulate talking
  const simulateTalk = () => {
    let count = 0;
    const id = setInterval(() => {
      setAudioLevel(Math.random() * 0.8 + 0.1);
      count++;
      if (count > 20) {
        clearInterval(id);
        setAudioLevel(0);
      }
    }, 80);
  };

  if (expertCallActive) {
    return (
      <SafeAreaView style={styles.expertContainer}>
        {/* Toggle Segment Bar */}
        <View style={styles.toggleRow}>
          <TouchableOpacity 
            style={[styles.toggleBtn, expertMode === 'ai' && styles.toggleBtnActive]} 
            onPress={() => {
              Speech.stop();
              setExpertMode('ai');
            }}
          >
            <Text style={styles.toggleText}>🤖 Yapay Zeka Uzmanı</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, expertMode === 'webrtc' && styles.toggleBtnActive]} 
            onPress={() => {
              Speech.stop();
              setExpertMode('webrtc');
            }}
          >
            <Text style={styles.toggleText}>🎥 Jitsi Canlı Arama</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.expertTitle}>
          {expertMode === 'ai' ? '🤖 Yapay Zeka Uzmanı' : '🎥 Canlı Uzman Görüşmesi'}
        </Text>
        <Text style={styles.expertSubtitle}>Destek Hattı</Text>
        
        <View style={styles.videoPlaceholder}>
          {expertMode === 'webrtc' ? (
            <>
              {isWeb ? (
                <iframe 
                  src="https://meet.jit.si/NoktaNoktaExpertBridge999999#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false" 
                  style={{ width: '100%', height: '100%', borderRadius: 20, border: 'none' }}
                  allow="camera; microphone; display-capture; fullscreen"
                />
              ) : (
                WebViewComponent ? (
                  <WebViewComponent
                    source={{ uri: 'https://meet.jit.si/NoktaNoktaExpertBridge999999#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false' }}
                    style={{ flex: 1, width: '100%', borderRadius: 20, backgroundColor: '#111' }}
                    originWhitelist={['*']}
                    mediaPlaybackRequiresUserAction={false}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    allowsInlineMediaPlayback={true}
                  />
                ) : (
                  <Text style={styles.videoText}>WebRTC Yüklenemedi</Text>
                )
              )}
              {/* Floating PIP Avatar */}
              <View style={styles.pipAvatar}>
                {isWeb ? (
                  <WebAvatarPlaceholder audioLevel={audioLevel} />
                ) : (
                  Canvas && AvatarView ? (
                    <Canvas camera={{ position: [0, 1.55, 0.95], fov: 40 }}>
                      <ambientLight intensity={1.2} />
                      <directionalLight position={[0, 2, 5]} intensity={1.5} />
                      <React.Suspense fallback={null}>
                        <AvatarView audioLevel={audioLevel} onMorphTargetsCount={setMorphCount} />
                      </React.Suspense>
                      {OrbitControls && <OrbitControls target={[0, 1.55, 0]} enableZoom={false} enableRotate={false} />}
                    </Canvas>
                  ) : null
                )}
              </View>
            </>
          ) : (
            // Full Screen AI Expert Avatar Mode
            <View style={{ flex: 1, width: '100%', borderRadius: 20, overflow: 'hidden', backgroundColor: '#111' }}>
              {isWeb ? (
                <WebAvatarPlaceholder audioLevel={audioLevel} />
              ) : (
                Canvas && AvatarView ? (
                  <Canvas camera={{ position: [0, 1.55, 0.95], fov: 40 }}>
                    <ambientLight intensity={1.2} />
                    <directionalLight position={[0, 2, 5]} intensity={1.5} />
                    <React.Suspense fallback={null}>
                      <AvatarView audioLevel={audioLevel} onMorphTargetsCount={setMorphCount} />
                    </React.Suspense>
                    {OrbitControls && <OrbitControls target={[0, 1.55, 0]} />}
                  </Canvas>
                ) : null
              )}
            </View>
          )}
        </View>

        {/* Subtitles Overlay */}
        {agentSpeakingText && (
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitleTitle}>🤖 Yapay Zeka Asistanı:</Text>
            <Text style={styles.subtitleText}>{agentSpeakingText}</Text>
          </View>
        )}

        {/* AI Mode Controls */}
        {expertMode === 'ai' && (
          <View style={{ width: '88%', alignItems: 'center', gap: 10 }}>
            <TextInput
              style={styles.chatInput}
              placeholder="Uzmana sorunuzu yazın... (örn: Hata nasıl çözülür?)"
              placeholderTextColor="#666"
              value={userQuestion}
              onChangeText={setUserQuestion}
              editable={!isAiLoading}
            />
            <TouchableOpacity 
              style={[styles.btn, { backgroundColor: '#00ffcc', paddingVertical: 12, borderRadius: 25, width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }]} 
              onPress={askAIExpert}
              disabled={isAiLoading}
            >
              {isAiLoading ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <Text style={[styles.btnText, { color: '#000' }]}>🗣️ Yapay Zeka Uzmanına Sor</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.endCallBtn} onPress={() => setExpertCallActive(false)}>
          <Text style={styles.btnText}>🔴 Görüşmeyi Sonlandır</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Avatar Alanı */}
      <TouchableOpacity style={styles.avatarContainer} onPress={isWeb ? simulateTalk : undefined} activeOpacity={isWeb ? 0.8 : 1}>
        {isWeb ? (
          <WebAvatarPlaceholder audioLevel={audioLevel} />
        ) : (
          Canvas && AvatarView ? (
            <Canvas camera={{ position: [0, 1.55, 0.95], fov: 40 }}>
              <ambientLight intensity={1.2} />
              <directionalLight position={[0, 2, 5]} intensity={1.5} />
              <React.Suspense fallback={null}>
                <AvatarView audioLevel={audioLevel} onMorphTargetsCount={setMorphCount} />
              </React.Suspense>
              {OrbitControls && <OrbitControls target={[0, 1.55, 0]} />}
            </Canvas>
          ) : null
        )}
        {isWeb && (
          <Text style={styles.tapHint}>👆 Konuşmayı simüle etmek için tıkla</Text>
        )}
      </TouchableOpacity>

      {/* Dev Debug Indicator */}
      <View style={{ alignItems: 'center', marginVertical: 4 }}>
        <Text style={{ color: '#00ffcc', fontSize: 13, fontFamily: 'monospace' }}>
          🎤 Mikrofon: {audioLevel.toFixed(2)} | Blendshapes: {morphCount !== null ? morphCount : 'Yükleniyor...'}
        </Text>
        {debugError && (
          <Text style={{ color: '#ff4444', fontSize: 12, marginTop: 4 }}>
            Hata: {debugError}
          </Text>
        )}
      </View>

      {/* Ses Görselleştirici */}
      <View style={styles.visualizerContainer}>
        {isWeb ? (
          <WebVisualizer audioLevel={audioLevel} />
        ) : (
          VoiceVisualizer ? (
            <VoiceVisualizer onAudioLevel={setAudioLevel} onDebugError={setDebugError} />
          ) : null
        )}
      </View>

      {/* Forge Widget */}
      <ScrollView style={styles.forgeContainer} contentContainerStyle={{ paddingBottom: 30 }}>
        <AuditWidget 
          onExpertCall={() => setExpertCallActive(true)} 
          onDictateStart={isWeb ? simulateTalk : undefined}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
  avatarContainer: {
    flex: 1,
    minHeight: 280,
  },
  tapHint: {
    color: '#444',
    textAlign: 'center',
    fontSize: 12,
    paddingBottom: 8,
  },
  visualizerContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d0d0d',
  },
  forgeContainer: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  expertContainer: {
    flex: 1,
    backgroundColor: '#050505',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  expertTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
  },
  expertSubtitle: {
    color: '#00ffcc',
    fontSize: 14,
    marginTop: -8,
  },
  videoPlaceholder: {
    width: '88%',
    height: 260,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00ffcc44',
    gap: 8,
  },
  videoIcon: {
    fontSize: 48,
  },
  videoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  videoSubText: {
    color: '#666',
    fontSize: 12,
  },
  endCallBtn: {
    backgroundColor: '#cc2222',
    paddingVertical: 15,
    paddingHorizontal: 36,
    borderRadius: 30,
    marginTop: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pipAvatar: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#00ffcc',
    overflow: 'hidden',
    backgroundColor: '#111',
    shadowColor: '#00ffcc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  subtitleContainer: {
    position: 'absolute',
    top: 90,
    left: '8%',
    right: '8%',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderWidth: 1,
    borderColor: '#00ffcc44',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    zIndex: 999,
  },
  subtitleTitle: {
    color: '#00ffcc',
    fontWeight: 'bold',
    fontSize: 11,
    marginBottom: 2,
  },
  subtitleText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 25,
    padding: 4,
    marginBottom: 8,
    width: '88%',
    justifyContent: 'space-between',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 21,
  },
  toggleBtnActive: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#00ffcc44',
  },
  toggleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  btn: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  chatInput: {
    width: '100%',
    backgroundColor: '#111',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});
