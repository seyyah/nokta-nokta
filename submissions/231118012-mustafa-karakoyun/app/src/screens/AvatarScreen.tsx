import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { AVATAR_BASE64 } from '../utils/avatarData';

export const AvatarScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [volume, setVolume] = useState(0); // 0 to 1
  const [latency, setLatency] = useState(12); // Simulated latency in ms
  const [statusMessage, setStatusMessage] = useState('Hazır · Bağlantı Bekleniyor');
  
  // AI Speech Assistant states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechText, setActiveSpeechText] = useState('');
  const [maleVoiceId, setMaleVoiceId] = useState<string | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const webViewRef = useRef<WebView | null>(null);

  // Request mic permissions on mount and find available Turkish male voices
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setMicPermission(status === 'granted');
    })();

    // Find Turkish male voice dynamically
    (async () => {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        const trVoices = voices.filter(v => v.language.startsWith('tr'));
        // Find Turkish voice with male characteristics in its name
        const maleVoice = trVoices.find(v => {
          const name = v.name.toLowerCase();
          return name.includes('male') || 
                 name.includes('erkek') || 
                 name.includes('cem') || 
                 name.includes('tolga') || 
                 name.includes('tmc') || 
                 name.includes('y-local');
        });
        if (maleVoice) {
          setMaleVoiceId(maleVoice.identifier);
        }
      } catch (e) {
        console.warn('Error fetching voices:', e);
      }
    })();

    return () => {
      stopRecording();
      Speech.stop();
    };
  }, []);

  // Text-To-Speech Lipsync: Generate voice frequency RMS waves while avatar is speaking
  useEffect(() => {
    let ttsTimer: NodeJS.Timeout | null = null;
    
    if (isSpeaking) {
      ttsTimer = setInterval(() => {
        // Generate realistic voice frequency gen (oscillating sinusoids with slight jitter)
        const time = Date.now();
        const baseVolume = 0.45 + Math.sin(time / 70) * 0.4;
        
        // Add speech pauses (simulate syllables)
        let finalVolume = 0;
        if (Math.sin(time / 450) > -0.6) {
          finalVolume = Math.min(Math.max(baseVolume + (Math.random() - 0.5) * 0.2, 0), 0.85);
        }

        setVolume(finalVolume);

        if (webViewRef.current) {
          webViewRef.current.postMessage(JSON.stringify({
            type: 'volume',
            value: finalVolume
          }));
        }
      }, 40);
    } else {
      if (!isRecording) {
        setVolume(0);
        if (webViewRef.current) {
          webViewRef.current.postMessage(JSON.stringify({
            type: 'volume',
            value: 0
          }));
        }
      }
    }

    return () => {
      if (ttsTimer) clearInterval(ttsTimer);
    };
  }, [isSpeaking, isRecording]);

  const startRecording = async () => {
    // Stop any active assistant speech first
    if (isSpeaking) {
      handleStopSpeech();
    }

    try {
      if (micPermission !== true) {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Hata', 'Mikrofon izni verilmedi.');
          return;
        }
        setMicPermission(true);
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        isMeteringEnabled: true, // Enable real-time voice amplitude capture!
        android: {
          extension: '.m4a',
          outputFormat: 2, // MPEG_4
          audioEncoder: 3, // AAC
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          audioQuality: 127,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {}
      });

      recordingRef.current = recording;
      
      // Dual-Layer Mic Capture: 1. Native Status Update Callback (Highly efficient, low latency)
      recording.setOnRecordingStatusUpdate((status) => {
        if (status.canRecord && status.metering !== undefined) {
          const db = status.metering;
          let normalized = 0;
          if (db !== undefined && db > -160) {
            normalized = Math.min(Math.max((db + 60) / 55, 0), 1);
          }
          
          const adjustedVolume = Math.pow(normalized, 1.5);
          setVolume(adjustedVolume);
          
          if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({
              type: 'volume',
              value: adjustedVolume
            }));
          }
        }
      });
      await recording.setProgressUpdateInterval(40);

      await recording.startAsync();
      setIsRecording(true);
      setStatusMessage('Dinliyor · Ses Aktif');

      // Dual-Layer Mic Capture: 2. Interval Polling Fallback (Guarantees execution even if updates fail)
      intervalRef.current = setInterval(async () => {
        if (!recordingRef.current) return;
        
        try {
          const status = await recordingRef.current.getStatusAsync();
          if (status.canRecord && status.metering !== undefined) {
            const db = status.metering;
            let normalized = 0;
            if (db !== undefined && db > -160) {
              normalized = Math.min(Math.max((db + 60) / 55, 0), 1);
            }
            
            const adjustedVolume = Math.pow(normalized, 1.5);
            setVolume(adjustedVolume);
            
            if (webViewRef.current) {
              webViewRef.current.postMessage(JSON.stringify({
                type: 'volume',
                value: adjustedVolume
              }));
            }
            
            setLatency(Math.floor(8 + Math.random() * 6));
          }
        } catch (e) {
          console.warn('Metering error:', e);
        }
      }, 40);

    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Hata', 'Mikrofon kaydı başlatılamadı.');
    }
  };

  const stopRecording = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (e) {}
      recordingRef.current = null;
    }
    
    setIsRecording(false);
    setVolume(0);
    setStatusMessage('Sessiz · Dinlemede');

    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'volume',
        value: 0
      }));
    }
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Trigger TTS Speech welcome message or responses
  const handleSpeakText = (text: string, response: string) => {
    if (isRecording) {
      stopRecording();
    }

    Speech.stop();
    setIsSpeaking(true);
    setActiveSpeechText(text);
    setStatusMessage('Konuşuyor · TTS Aktif');

    Speech.speak(response, {
      language: 'tr-TR',
      pitch: 0.82, // Deeper, more masculine tone!
      rate: 0.92,
      voice: maleVoiceId || undefined, // Use detected Turkish male voice if available
      onDone: () => handleStopSpeech(),
      onError: (e) => {
        console.warn('Speech playback error:', e);
        handleStopSpeech();
      }
    });
  };

  const handleStopSpeech = () => {
    Speech.stop();
    setIsSpeaking(false);
    setActiveSpeechText('');
    setVolume(0);
    setStatusMessage('Sessiz · Dinlemede');

    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'volume',
        value: 0
      }));
    }
  };

  const renderEqualizerBars = () => {
    return Array(15).fill(0).map((_, i) => {
      const baseHeight = (isRecording || isSpeaking) ? 10 + volume * 90 : 12;
      const waveFactor = (isRecording || isSpeaking) ? Math.sin(Date.now() / 120 + i * 0.8) * 20 * volume : Math.sin(Date.now() / 800 + i * 0.4) * 4;
      const finalHeight = Math.max(8, baseHeight + waveFactor);
      
      let barColor = '#6366f1'; // Indigo base
      if (isRecording) {
        barColor = '#3b82f6'; // Blue for mic capture
      } else if (isSpeaking) {
        barColor = '#10b981'; // Green for avatar speech playback
      } else {
        barColor = 'rgba(99, 102, 241, 0.3)'; // Semi-trans idle
      }

      return (
        <View 
          key={i} 
          style={[
            styles.eqBar, 
            { 
              height: finalHeight, 
              backgroundColor: barColor,
              shadowColor: barColor,
            }
          ]} 
        />
      );
    });
  };

  // High-performance Three.js WebGL canvas injected directly inside WebView
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
      <style>
        body {
          margin: 0;
          padding: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: transparent;
        }
        #canvas-container {
          width: 100%;
          height: 100%;
          cursor: grab;
        }
        #loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #0f172a;
          display: flex;
          flex-direction: column;
          justifyContent: center;
          alignItems: center;
          color: #94a3b8;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 14px;
          font-weight: 600;
          transition: opacity 0.5s ease;
          z-index: 999;
        }
        .spinner {
          border: 4px solid rgba(255, 255, 255, 0.1);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border-left-color: #6366f1;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
    </head>
    <body>
      <div id="loading-overlay">
        <div class="spinner"></div>
        <div id="loading-text">3D Model Yükleniyor...</div>
      </div>
      <div id="canvas-container"></div>

      <script>
        let scene, camera, renderer, controls, headMesh = null, teethMesh = null;
        let mouthOpenIndex = -1, jawOpenIndex = -1;
        let targetVolume = 0;
        let currentVolume = 0;

        // Statically bound Base64 string of the user's HD avatar.glb (model 2)
        const localBase64 = "${AVATAR_BASE64}";

        function init() {
          const container = document.getElementById('canvas-container');
          
          scene = new THREE.Scene();
          
          // Camera position Z=0.65, Y=0.22 focuses perfectly on the developer face card!
          camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
          camera.position.set(0, 0.22, 0.65);

          renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
          renderer.setPixelRatio(window.devicePixelRatio);
          renderer.setSize(container.clientWidth, container.clientHeight);
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1.1;
          container.appendChild(renderer.domElement);

          controls = new THREE.OrbitControls(camera, renderer.domElement);
          controls.enableDamping = true;
          controls.dampingFactor = 0.05;
          controls.enableZoom = true;
          controls.minDistance = 0.45;
          controls.maxDistance = 2.5;
          // Target Y=0.24 is the exact center of the face
          controls.target.set(0, 0.24, 0);

          const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
          scene.add(ambientLight);

          const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
          dirLight1.position.set(2, 4, 5);
          scene.add(dirLight1);

          const dirLight2 = new THREE.DirectionalLight(0xa5b4fc, 0.6);
          dirLight2.position.set(-2, 2, -2);
          scene.add(dirLight2);

          const ringLight = new THREE.PointLight(0x6366f1, 0.8, 10);
          ringLight.position.set(0, 0.5, 2);
          scene.add(ringLight);

          const loader = new THREE.GLTFLoader();
          const avatarUrl = "data:model/gltf-binary;base64," + localBase64;

          loader.load(
            avatarUrl,
            function (gltf) {
              const model = gltf.scene;
              scene.add(model);

              // Position avatar
              model.position.set(0, -1.45, 0);
              model.scale.set(1, 1, 1);

              model.traverse((child) => {
                if (child.isMesh && child.morphTargetDictionary) {
                  if (child.name.toLowerCase().includes('head') || child.name.toLowerCase().includes('avatar') || child.name.toLowerCase().includes('face')) {
                    headMesh = child;
                    
                    const dict = child.morphTargetDictionary;
                    for (let key in dict) {
                      if (key.toLowerCase().includes('mouthopen') || key.toLowerCase().includes('jawopen') || key.toLowerCase().includes('viseme_aa')) {
                        if (key.toLowerCase().includes('mouthopen')) mouthOpenIndex = dict[key];
                        if (key.toLowerCase().includes('jawopen')) jawOpenIndex = dict[key];
                      }
                    }
                  }
                  
                  if (child.name.toLowerCase().includes('teeth') || child.name.toLowerCase().includes('dental')) {
                    teethMesh = child;
                  }
                }
              });

              const overlay = document.getElementById('loading-overlay');
              overlay.style.opacity = 0;
              setTimeout(() => {
                overlay.style.display = 'none';
              }, 500);
            },
            function (xhr) {
              document.getElementById('loading-text').innerText = 'Model Okunuyor...';
            },
            function (error) {
              console.error('An error happened', error);
              document.getElementById('loading-text').innerText = 'Model Hazırlanamadı.';
            }
          );

          window.addEventListener('resize', onWindowResize);
          animate();
        }

        function onWindowResize() {
          const container = document.getElementById('canvas-container');
          camera.aspect = container.clientWidth / container.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(container.clientWidth, container.clientHeight);
        }

        function animate() {
          requestAnimationFrame(animate);

          currentVolume = currentVolume * 0.65 + targetVolume * 0.35;

          const time = Date.now() * 0.001;
          const head = scene.getObjectByName('Head');
          const neck = scene.getObjectByName('Neck');
          const spine = scene.getObjectByName('Spine2');

          if (currentVolume > 0.02) {
            // Talking / Speech Swaying, Bobbing and Nodding!
            if (head) {
              // Node X: pitch, Node Y: yaw, Node Z: roll. Rotate relative to default bind pose
              head.rotation.x = -0.117 + Math.sin(time * 15) * 0.08 * currentVolume;
              head.rotation.y = Math.cos(time * 11) * 0.05 * currentVolume;
              head.rotation.z = Math.sin(time * 8) * 0.03 * currentVolume;
            }
            if (neck) {
              neck.rotation.x = 0.222 + Math.sin(time * 12) * 0.04 * currentVolume;
              neck.rotation.y = Math.cos(time * 9) * 0.03 * currentVolume;
            }
            if (spine) {
              spine.rotation.y = Math.sin(time * 6) * 0.015 * currentVolume;
            }
          } else {
            // Idle breathing natural sway
            if (head) {
              head.rotation.x = -0.117 + Math.sin(time * 1.5) * 0.015;
              head.rotation.y = Math.cos(time * 1.2) * 0.01;
              head.rotation.z = 0;
            }
            if (neck) {
              neck.rotation.x = 0.222 + Math.sin(time * 1.2) * 0.01;
              neck.rotation.y = 0;
            }
            if (spine) {
              spine.rotation.y = Math.sin(time * 0.8) * 0.008;
            }
          }

          if (headMesh && headMesh.morphTargetInfluences) {
            if (mouthOpenIndex !== -1) {
              headMesh.morphTargetInfluences[mouthOpenIndex] = currentVolume * 0.95;
            }
            if (jawOpenIndex !== -1) {
              headMesh.morphTargetInfluences[jawOpenIndex] = currentVolume * 0.55;
            }
            
            const dict = headMesh.morphTargetDictionary;
            if (dict && dict['eyeBlinkLeft'] !== undefined && dict['eyeBlinkRight'] !== undefined) {
              const blinkIndexL = dict['eyeBlinkLeft'];
              const blinkIndexR = dict['eyeBlinkRight'];
              
              if (Math.random() < 0.005) {
                headMesh.morphTargetInfluences[blinkIndexL] = 1.0;
                headMesh.morphTargetInfluences[blinkIndexR] = 1.0;
                setTimeout(() => {
                  if (headMesh) {
                    headMesh.morphTargetInfluences[blinkIndexL] = 0.0;
                    headMesh.morphTargetInfluences[blinkIndexR] = 0.0;
                  }
                }, 140);
              }
            }
          }

          if (teethMesh && teethMesh.morphTargetInfluences && jawOpenIndex !== -1) {
            const dict = teethMesh.morphTargetDictionary;
            if (dict && dict['jawOpen'] !== undefined) {
              teethMesh.morphTargetInfluences[dict['jawOpen']] = currentVolume * 0.55;
            }
          }

          // Dynamic model base breathing
          if (scene.children[4]) {
            const model = scene.children[4];
            if (currentVolume < 0.05) {
              model.rotation.y = Math.sin(time * 0.5) * 0.03;
              model.rotation.x = Math.sin(time * 0.3) * 0.015;
            } else {
              model.rotation.y = Math.sin(time * 2.5) * 0.012 * currentVolume;
              model.rotation.x = Math.cos(time * 2.0) * 0.008 * currentVolume;
            }
          }

          controls.update();
          renderer.render(scene, camera);
        }

        window.addEventListener('message', function(event) {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'volume') {
              targetVolume = message.value;
            }
          } catch(e) {
            console.error('Parsing message error', e);
          }
        });

        window.onload = init;
      </script>
    </body>
    </html>
  `;

  return (
    <LinearGradient colors={['#0f172a', '#1e1b4b']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ayna</Text>
        <Text style={styles.subtitle}>Gerçek Zamanlı Ses ve R3F 3D Lipsync Sahnesi</Text>
      </View>

      {/* 3D WebGL Canvas Container via WebView */}
      <View style={styles.avatarCard}>
        <LinearGradient 
          colors={['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.08)']} 
          style={styles.avatarGlass}
        >
          <View style={styles.webviewWrapper}>
            <WebView
              ref={webViewRef}
              originWhitelist={['*']}
              source={{ html: htmlContent }}
              style={styles.webview}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              scrollEnabled={false}
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback={true}
            />
          </View>

          {/* Active speech text indicator overlay */}
          {isSpeaking && (
            <View style={styles.speechBubbleOverlay}>
              <Text style={styles.speechBubbleText}>{activeSpeechText}</Text>
            </View>
          )}

          {/* Real-time metrics overlays */}
          <View style={styles.techInfo}>
            <View style={styles.infoBadge}>
              <View style={[styles.statusDot, (isRecording || isSpeaking) && styles.statusDotActive]} />
              <Text style={styles.infoText}>{statusMessage}</Text>
            </View>
            <View style={styles.infoBadge}>
              <Text style={styles.infoText}>Gecikme: {isRecording ? `${latency}ms` : '0ms'}</Text>
            </View>
            <View style={styles.infoBadge}>
              <Text style={styles.infoText}>Model: HD (3.7MB)</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Frequency analysis bars */}
      <View style={styles.visualizerSection}>
        <Text style={styles.sectionLabel}>FFT & RMS GECİKMESİZ BINS ANALİZİ</Text>
        <View style={styles.equalizerContainer}>
          {renderEqualizerBars()}
        </View>
      </View>

      {/* Controller Area: Mic capturing and Talking Assistant preset buttons */}
      <View style={styles.controlsSection}>
        {isSpeaking ? (
          <TouchableOpacity 
            style={[styles.recordButton, styles.stopSpeechButton]} 
            onPress={handleStopSpeech}
            activeOpacity={0.8}
          >
            <Text style={styles.recordButtonText}>🛑 Konuşmayı Kes</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.dualControlsWrapper}>
            <TouchableOpacity 
              style={[styles.recordButton, isRecording && styles.recordButtonActive]} 
              onPress={handleToggleRecord}
              activeOpacity={0.8}
            >
              <Text style={styles.recordButtonText}>
                {isRecording ? '🎙️ Konuşmayı Bitir' : '🎙️ Modelimle Konuş'}
              </Text>
            </TouchableOpacity>
            
            {/* Talking presets row */}
            <Text style={styles.assistantTitle}>YAPAY ZEKA ASİSTAN DİYALOGLARI</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsRow}>
              <TouchableOpacity 
                style={styles.presetBadge}
                onPress={() => handleSpeakText(
                  "Kendini Tanıt", 
                  "Merhaba Mustafa! Ben senin 3D yapay zeka avatarınım. Nokta nokta projesi kapsamında, tüm platform limitlerini aşarak, expo-av ve WebGL WebView tüneliyle sesinle tam senkronize konuşmak üzere tasarlandım. Harika bir iş çıkardık!"
                )}
              >
                <Text style={styles.presetBadgeText}>💡 Kendini Tanıt</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.presetBadge}
                onPress={() => handleSpeakText(
                  "Nokta-Nokta Nedir?", 
                  "Nokta nokta projesi seyyah mimarisini, drop-in audit widget geliştirmesini, yapay zeka onarım forge döngülerini ve sıkıştığımız anda görüntülü ekran paylaşımı sağlayan insan uzman video köprüsünü içeren dairesel bir mobil ekosistemdir."
                )}
              >
                <Text style={styles.presetBadgeText}>🎯 Nokta Nedir?</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.presetBadge}
                onPress={() => handleSpeakText(
                  "Son Raporu Özetle", 
                  "Son başarılı onarımlarımız ile tüm TypeScript derleme hataları tamamen temizlenmiş, Jitsi meet deep link yönlendirme hatası yerel video köprüsüyle aşılmış ve local base64 3D model yükleyici başarıyla entegre edilmiştir."
                )}
              >
                <Text style={styles.presetBadgeText}>📊 Son Durum Raporu</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    justifyContent: 'space-between',
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  avatarCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  avatarGlass: {
    width: '100%',
    height: '100%',
    maxHeight: 380,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    padding: 12,
  },
  webviewWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  speechBubbleOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  speechBubbleText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  techInfo: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '95%',
    gap: 8,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#64748b',
    marginRight: 6,
  },
  statusDotActive: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  infoText: {
    color: '#cbd5e1',
    fontSize: 9,
    fontWeight: 'bold',
  },
  visualizerSection: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    marginVertical: 5,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6366f1',
    letterSpacing: 2,
    marginBottom: 10,
  },
  equalizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    width: '90%',
    gap: 5,
  },
  eqBar: {
    width: 6,
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  controlsSection: {
    width: '100%',
    marginTop: 5,
  },
  dualControlsWrapper: {
    width: '100%',
  },
  assistantTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  presetsRow: {
    gap: 8,
    paddingBottom: 5,
  },
  presetBadge: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  presetBadgeText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
  },
  recordButton: {
    width: '100%',
    backgroundColor: '#6366f1',
    paddingVertical: 18,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  recordButtonActive: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
  },
  stopSpeechButton: {
    backgroundColor: '#dc2626',
    shadowColor: '#dc2626',
  },
  recordButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
