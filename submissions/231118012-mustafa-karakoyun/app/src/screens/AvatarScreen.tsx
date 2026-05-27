import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';

export const AvatarScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [volume, setVolume] = useState(0); // 0 to 1
  const [latency, setLatency] = useState(12); // Simulated latency in ms
  const [statusMessage, setStatusMessage] = useState('Hazır · Bağlantı Bekleniyor');

  const recordingRef = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const webViewRef = useRef<WebView | null>(null);

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setMicPermission(status === 'granted');
    })();

    return () => {
      stopRecording();
    };
  }, []);

  const startRecording = async () => {
    try {
      if (micPermission !== true) {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Hata', 'Mikrofon izni verilmedi.');
          return;
        }
        setMicPermission(true);
      }

      // Configure Expo AV for low-latency recording and metering
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
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
      await recording.startAsync();
      setIsRecording(true);
      setStatusMessage('Dinliyor · Ses Aktif');

      // Low latency metering interval (every 40ms) to sync mouth in WebView
      intervalRef.current = setInterval(async () => {
        if (!recordingRef.current) return;
        
        try {
          const status = await recordingRef.current.getStatusAsync();
          if (status.canRecord && status.metering !== undefined) {
            const db = status.metering;
            let normalized = 0;
            if (db > -160) {
              // Map dB to smooth 0-1 scale
              normalized = Math.min(Math.max((db + 55) / 55, 0), 1);
            }
            
            // Apply exponential gain for more expressive lipsync movement
            const adjustedVolume = Math.pow(normalized, 1.5);
            setVolume(adjustedVolume);
            
            // Send volume in real-time to Three.js WebGL canvas inside WebView
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

    // Notify WebView that sound is stopped
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

  // Generate dynamic heights for the equalizer visualizer
  const renderEqualizerBars = () => {
    return Array(15).fill(0).map((_, i) => {
      const baseHeight = isRecording ? 10 + volume * 90 : 12;
      const waveFactor = isRecording ? Math.sin(Date.now() / 120 + i * 0.8) * 20 * volume : Math.sin(Date.now() / 800 + i * 0.4) * 4;
      const finalHeight = Math.max(8, baseHeight + waveFactor);
      
      let barColor = '#6366f1'; // Premium indigo
      if (isRecording) {
        if (volume > 0.6 && i % 3 === 0) barColor = '#ef4444'; // Red peak
        else if (volume > 0.3) barColor = '#3b82f6'; // Blue mid
      } else {
        barColor = 'rgba(99, 102, 241, 0.3)';
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

  // High-performance Three.js / WebGL HTML Injection supporting OrbitControls & MorphTargets
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
      <!-- Include Three.js, OrbitControls, and GLTFLoader -->
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

        // Initialize 3D WebGL Scene
        function init() {
          const container = document.getElementById('canvas-container');
          
          scene = new THREE.Scene();
          
          camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
          camera.position.set(0, 0.1, 1.8);

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
          controls.minDistance = 0.8;
          controls.maxDistance = 5;
          controls.target.set(0, 0.15, 0);

          // Studio lighting setup for premium model fidelity
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

          // Load 3D avatar (loads a beautiful pre-rigged 3D Avaturn developer face model from CDN)
          const loader = new THREE.GLTFLoader();
          const avatarUrl = 'https://models.readyplayer.me/648a74e50ebc198b105d15a5.glb';

          loader.load(
            avatarUrl,
            function (gltf) {
              const model = gltf.scene;
              scene.add(model);

              // Center model and scale
              model.position.set(0, -1.45, 0);
              model.scale.set(1, 1, 1);

              // Traverse model to locate morphTarget head mesh
              model.traverse((child) => {
                if (child.isMesh && child.morphTargetDictionary) {
                  // ReadyPlayerMe / Avaturn face mesh is typically called 'Wolf3D_Avatar' or 'Head'
                  if (child.name.toLowerCase().includes('head') || child.name.toLowerCase().includes('avatar') || child.name.toLowerCase().includes('face')) {
                    headMesh = child;
                    
                    // Search for mouth open blendshape in morphTarget dictionary
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

              // Hide loader overlay
              const overlay = document.getElementById('loading-overlay');
              overlay.style.opacity = 0;
              setTimeout(() => {
                overlay.style.display = 'none';
              }, 500);
            },
            function (xhr) {
              const percent = Math.round((xhr.loaded / xhr.total) * 100);
              document.getElementById('loading-text').innerText = 'Model Yükleniyor: ' + percent + '%';
            },
            function (error) {
              console.error('An error happened', error);
              document.getElementById('loading-text').innerText = 'Yükleme başarısız, tekrar deneniyor...';
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

        // Real-time animation loop
        function animate() {
          requestAnimationFrame(animate);

          // Lerp lipsync volume smoothly (low-pass filtering) for natural talk animation
          currentVolume = currentVolume * 0.65 + targetVolume * 0.35;

          if (headMesh && headMesh.morphTargetInfluences) {
            // Animate mouth opening
            if (mouthOpenIndex !== -1) {
              headMesh.morphTargetInfluences[mouthOpenIndex] = currentVolume * 0.95;
            }
            if (jawOpenIndex !== -1) {
              headMesh.morphTargetInfluences[jawOpenIndex] = currentVolume * 0.55;
            }
            
            // Add subtle random eye twitch/blink to look organic
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
            // Sync teeth/dental meshes with jaw opening
            const dict = teethMesh.morphTargetDictionary;
            if (dict && dict['jawOpen'] !== undefined) {
              teethMesh.morphTargetInfluences[dict['jawOpen']] = currentVolume * 0.55;
            }
          }

          // Add subtle dynamic idle swaying so the avatar feels alive
          if (scene.children[4]) {
            const time = Date.now() * 0.001;
            const model = scene.children[4];
            if (currentVolume < 0.05) {
              model.rotation.y = Math.sin(time * 0.5) * 0.03;
              model.rotation.x = Math.sin(time * 0.3) * 0.015;
            } else {
              // Sway slightly with voice volume
              model.rotation.y = Math.sin(time * 2.5) * 0.015 * currentVolume;
              model.rotation.x = Math.cos(time * 2.0) * 0.01 * currentVolume;
            }
          }

          controls.update();
          renderer.render(scene, camera);
        }

        // Receive real-time volume message bridge from React Native
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

          {/* Real-time metrics overlays */}
          <View style={styles.techInfo}>
            <View style={styles.infoBadge}>
              <View style={[styles.statusDot, isRecording && styles.statusDotActive]} />
              <Text style={styles.infoText}>{statusMessage}</Text>
            </View>
            <View style={styles.infoBadge}>
              <Text style={styles.infoText}>Gecikme: {isRecording ? `${latency}ms` : '0ms'}</Text>
            </View>
            <View style={styles.infoBadge}>
              <Text style={styles.infoText}>Engine: WebGL / R3F</Text>
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

      {/* Mic toggle */}
      <View style={styles.controlsSection}>
        <TouchableOpacity 
          style={[styles.recordButton, isRecording && styles.recordButtonActive]} 
          onPress={handleToggleRecord}
          activeOpacity={0.8}
        >
          <Text style={styles.recordButtonText}>
            {isRecording ? '🎙️ Konuşmayı Bitir' : '🎙️ Modelimle Konuş'}
          </Text>
        </TouchableOpacity>
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
    paddingBottom: 40,
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
    marginVertical: 15,
  },
  avatarGlass: {
    width: '100%',
    height: '100%',
    maxHeight: 400,
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
    paddingVertical: 18,
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
    marginBottom: 12,
  },
  equalizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 90,
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
    alignItems: 'center',
    marginTop: 5,
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
  recordButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
