import React, { Suspense, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei/native';
import { Audio } from 'expo-av';
import * as THREE from 'three';
import Animated, { useSharedValue, useAnimatedStyle, interpolate, withTiming, SharedValue } from 'react-native-reanimated';
import { auditStorage } from '@/utils/auditStorage';
import { WebView } from 'react-native-webview';

// 3D Canvas'taki Avatar için ses şiddetini tutacağımız global değişken. 
let currentVolume = 0;

function Avatar() {
  const { scene, nodes, animations } = useGLTF(require('../assets/avatar.glb') as any) as any;
  const { actions } = useAnimations(animations, scene);
  const meshRef = useRef<THREE.SkinnedMesh | null>(null);

  useEffect(() => {
    // 1. T-Pose Kodlarını Sil ve Animasyonu Oynat
    if (actions && animations && animations.length > 0) {
      const actionName = animations[0].name;
      const action = actions[actionName];
      if (action) {
        action.play();
      }
    }

    if (scene) {
      scene.traverse((child: any) => {
        // Lipsync Fix: Morph target'ı barındıran mesh'i bulma
        if (child.isMesh && child.morphTargetDictionary) {
          meshRef.current = child;
        }
      });
    }
  }, [scene, actions, animations]);

  useFrame(() => {
    if (meshRef.current && meshRef.current.morphTargetInfluences && meshRef.current.morphTargetDictionary) {
      const dict = meshRef.current.morphTargetDictionary;
      const influences = meshRef.current.morphTargetInfluences;

      // Tüm olası çene ve ağız hareketlerini yakala (büyük/küçük harf bağımsız)
      const keys = Object.keys(dict).filter(k => {
        const lower = k.toLowerCase();
        return lower.includes('jawopen') || 
               lower.includes('mouthopen') || 
               lower.includes('viseme_aa') || 
               lower.includes('viseme_o') || 
               lower.includes('viseme_a');
      });

      keys.forEach(key => {
        const targetIndex = dict[key];
        if (targetIndex !== undefined) {
          const currentInfluence = influences[targetIndex];
          const targetInfluence = Math.min(currentVolume * 1.5, 1);
          influences[targetIndex] = THREE.MathUtils.lerp(currentInfluence, targetInfluence, 0.4);
        }
      });
    }
  });

  return <primitive object={scene} scale={2.2} position={[0, -2.2, 0]} />;
}

// Ses Görselleştirici Overlay Bileşeni
function VoiceVisualizer({ volumeShared }: { volumeShared: SharedValue<number> }) {
  const bars = [0, 1, 2, 3, 4];

  return (
    <View style={styles.visualizerContainer} pointerEvents="none">
      {bars.map((i) => {
        const rStyle = useAnimatedStyle(() => {
          const multipliers = [0.3, 0.7, 1.0, 0.7, 0.3];
          const factor = multipliers[i];
          
          const height = interpolate(
            volumeShared.value * factor,
            [0, 1],
            [6, 80]
          );

          const opacity = interpolate(
            volumeShared.value * factor,
            [0, 1],
            [0.4, 1.0]
          );

          return {
            height,
            opacity,
          };
        });

        return <Animated.View key={i} style={[styles.bar, rStyle]} />;
      })}
    </View>
  );
}

// Fallback yükleme ekranı
function LoadingFallback() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#ffffff" />
      <Text style={styles.loadingText}>Avatar Yükleniyor...</Text>
    </View>
  );
}

// 🚨 UZMANA BAĞLAN (WebRTC Bridge) BİLEŞENİ
function ExpertBridge({ onClose }: { onClose: () => void }) {
  const webrtcUrl = "https://meet.jit.si/NoktaExpertSupportRoom_12345";
  
  return (
    <View style={styles.bridgeContainer}>
      <View style={[styles.bridgeHeader, { paddingTop: Platform.OS === 'ios' ? 40 : 10 }]}>
        <View style={styles.bridgeHeaderInner}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={styles.recordingDot} />
            <Text style={styles.bridgeTitle}> STUCK Durumu: Uzmana Bağlanıldı</Text>
          </View>
          <TouchableOpacity style={styles.closeBridgeBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.closeBridgeText}>Görüşmeyi Sonlandır</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <WebView 
        source={{ uri: webrtcUrl }}
        style={{ flex: 1 }}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
}

export default function IndexScreen() {
  const insets = useSafeAreaInsets();
  const recordingRef = useRef<Audio.Recording | null>(null);
  const volumeShared = useSharedValue(0);
  
  const [isDictating, setIsDictating] = useState(false);

  // -----------------------------------------------------
  // TRACK C (Otonomi): HEURISTIC STUCK DETECTION
  // -----------------------------------------------------
  const [consecutiveFails, setConsecutiveFails] = useState(0);
  const isStuck = consecutiveFails >= 2;

  const handleInjectFailCycle = () => {
    setConsecutiveFails(prev => prev + 1);
  };

  const handleCloseBridge = () => {
    setConsecutiveFails(0);
    alert("✅ Uzman tavsiyesi BRIDGE.md dosyasına deşifre edildi. Yönerge alınarak yeni Forge döngüsüne giriliyor...");
  };
  // -----------------------------------------------------

  useEffect(() => {
    async function startAudioMonitoring() {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Mikrofon izni reddedildi!');
          return;
        }

        // 2. Mikrofon İzinleri Fix (Sesi almak için en önemli yapılandırma)
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const recordingOptions: any = {
          ...Audio.RecordingOptionsPresets.LOW_QUALITY,
          isMeteringEnabled: true,
          android: { ...Audio.RecordingOptionsPresets.LOW_QUALITY.android, metering: true },
          ios: { ...Audio.RecordingOptionsPresets.LOW_QUALITY.ios, metering: true },
        };

        const { recording } = await Audio.Recording.createAsync(
          recordingOptions,
          (status) => {
            if (status.metering !== undefined) {
              // Hata ayıklama için terminale ses yazdırıyoruz
              console.log("Ses Seviyesi:", status.metering);
              
              const minDb = -80; 
              const maxDb = -10;
              let db = status.metering;
              
              if (db < minDb) db = minDb;
              if (db > maxDb) db = maxDb;

              const volume = (db - minDb) / (maxDb - minDb);
              
              currentVolume = volume;
              volumeShared.value = withTiming(volume, { duration: 50 });
            }
          },
          30 // 30ms polling rate (FPS)
        );

        recordingRef.current = recording;
      } catch (err) {
        console.error('Mikrofon izleme başlatılırken hata:', err);
      }
    }

    startAudioMonitoring();

    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(console.error);
      }
    };
  }, []);

  const handleDictationPressIn = () => setIsDictating(true);
  const handleDictationPressOut = async () => {
    setIsDictating(false);
    const mockText = "Hata: Dikte butonu bazen basılı kalıyor ve dinleme bitmiyor. UI donuyor. Onarılmalı.";
    try {
      const notes = await auditStorage.loadNotes();
      const newNote = {
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString(),
        screenName: '/',
        note: `[Sesli Dikte]: ${mockText}`,
        reporterId: 'voice-assistant',
      };
      await auditStorage.saveNotes([...notes, newNote]);
    } catch (e) {
      console.error('Rapor kaydedilemedi', e);
    }
  };

  return (
    <View style={styles.container}>
      
      {/* 2. UI İçin Son İkaz (Absolute Positioning) */}
      <View style={{ position: 'absolute', top: 70, width: '100%', zIndex: 9999, flexDirection: 'row', justifyContent: 'center' }} pointerEvents="box-none">
        
        {/* Otonomi Simülatörü: Heuristic Fail Ekleme */}
        <View style={styles.debugPanel}>
          <Text style={styles.debugText}>Forge Fails: {consecutiveFails}</Text>
          <TouchableOpacity style={styles.debugBtn} onPress={handleInjectFailCycle} activeOpacity={0.6}>
            <Text style={styles.debugBtnText}>⚠️ Inject Fail Cycle</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dictationContainer}>
          <TouchableOpacity
            style={[styles.dictationButton, isDictating && styles.dictationButtonActive]}
            onPressIn={handleDictationPressIn}
            onPressOut={handleDictationPressOut}
            activeOpacity={0.8}
          >
            <Text style={styles.dictationText}>
              {isDictating ? "🎤 Dinleniyor..." : "🎤 Basılı Tut & Raporla"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Suspense fallback={<LoadingFallback />}>
        <Canvas style={styles.canvas}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 10]} intensity={2} />
          <Avatar />
        </Canvas>
      </Suspense>
      
      <VoiceVisualizer volumeShared={volumeShared} />

      {isStuck && (
        <ExpertBridge onClose={handleCloseBridge} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  topSafeArea: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  canvas: {
    flex: 1,
  },
  visualizerContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 80,
    zIndex: 10,
  },
  bar: {
    width: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  dictationContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  dictationButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  dictationButtonActive: {
    backgroundColor: 'rgba(230, 60, 60, 0.9)',
    borderColor: '#ff4444',
  },
  dictationText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    zIndex: 5,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  
  debugPanel: {
    position: 'absolute',
    top: 0,
    right: 16,
    zIndex: 50,
    alignItems: 'flex-end',
    marginTop: 0, // PaddingTop from parent handles this now
  },
  debugText: {
    color: '#ff4444',
    fontWeight: 'bold',
    marginBottom: 6,
    fontSize: 12
  },
  debugBtn: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ff4444'
  },
  debugBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold'
  },

  bridgeContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    backgroundColor: '#000'
  },
  bridgeHeader: {
    backgroundColor: '#dc2626',
  },
  bridgeHeaderInner: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  bridgeTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  recordingDot: {
    width: 10, 
    height: 10, 
    borderRadius: 5, 
    backgroundColor: '#fff',
    marginRight: 8
  },
  closeBridgeBtn: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  closeBridgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13
  }
});
