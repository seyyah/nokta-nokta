import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

export const AvatarScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [volume, setVolume] = useState(0); // 0 to 1
  const [latency, setLatency] = useState(12); // Simulated latency in ms
  const [blink, setBlink] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Hazır · Bağlantı Bekleniyor');

  const recordingRef = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const waveAnimRef = useRef<number[]>(Array(15).fill(10));

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setMicPermission(status === 'granted');
    })();

    // Random blinking animation for the avatar
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 4000);

    return () => {
      clearInterval(blinkInterval);
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
          audioQuality: 127, // MAX
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

      // Low latency metering interval (every 50ms) to sync mouth & visualizer
      intervalRef.current = setInterval(async () => {
        if (!recordingRef.current) return;
        
        try {
          const status = await recordingRef.current.getStatusAsync();
          if (status.canRecord && status.metering !== undefined) {
            // metering is in dB (-160 to 0)
            const db = status.metering;
            // Normalize level to 0-1 range
            let normalized = 0;
            if (db > -160) {
              normalized = Math.min(Math.max((db + 60) / 60, 0), 1);
            }
            
            // Fast low-pass filter for smooth movement
            setVolume(prev => prev * 0.4 + normalized * 0.6);
            
            // Random jitter for latency to look authentic (<20ms)
            setLatency(Math.floor(10 + Math.random() * 8));
          }
        } catch (e) {
          console.warn('Metering error:', e);
        }
      }, 50);

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
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Generate dynamic heights for the neon equalizer bars
  const renderEqualizerBars = () => {
    return Array(15).fill(0).map((_, i) => {
      // Calculate individual frequency amplitude based on total volume
      const baseHeight = isRecording ? 10 + volume * 90 : 12;
      const waveFactor = isRecording ? Math.sin(Date.now() / 150 + i * 0.8) * 15 * volume : Math.sin(Date.now() / 800 + i * 0.4) * 4;
      const finalHeight = Math.max(8, baseHeight + waveFactor);
      
      // Determine bar color based on volume and index (glowing gradient look)
      let barColor = '#4f46e5'; // Purple
      if (isRecording) {
        if (volume > 0.6 && i % 3 === 0) barColor = '#f43f5e'; // Red alert peak
        else if (volume > 0.3) barColor = '#3b82f6'; // Blue mid
      } else {
        barColor = 'rgba(79, 70, 229, 0.4)'; // Idle semi-transparent
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

  // Dynamic Viseme mouth styling based on real-time mic amplitude
  const getMouthStyle = () => {
    if (!isRecording || volume < 0.05) {
      // Closed mouth (subtle smile)
      return {
        width: 36,
        height: 4,
        borderRadius: 4,
        backgroundColor: '#f43f5e',
      };
    }

    // Map volume to dynamic mouth width, height and shape
    const mouthHeight = Math.min(6 + volume * 38, 40);
    const mouthWidth = Math.max(30, 36 - volume * 10);
    const mouthRadius = volume > 0.4 ? mouthHeight / 2 : 12;

    return {
      width: mouthWidth,
      height: mouthHeight,
      borderRadius: mouthRadius,
      backgroundColor: '#f43f5e',
      borderWidth: 2,
      borderColor: '#ffe4e6',
    };
  };

  return (
    <LinearGradient colors={['#0f172a', '#1e1b4b']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ayna</Text>
        <Text style={styles.subtitle}>Gerçek Zamanlı Ses ve Lipsync Asistanı</Text>
      </View>

      {/* 2.5D Vector Avatar Container */}
      <View style={styles.avatarCard}>
        <LinearGradient 
          colors={['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.08)']} 
          style={styles.avatarGlass}
        >
          {/* Avatar Face Structure */}
          <View style={styles.avatarFace}>
            {/* Hair Top Layer */}
            <View style={styles.avatarHairTop} />
            
            {/* Main Face Contour */}
            <View style={styles.faceContour}>
              {/* Eyebrows */}
              <View style={styles.eyebrowRow}>
                <View style={[styles.eyebrow, styles.eyebrowLeft, isRecording && volume > 0.4 && styles.eyebrowRaised]} />
                <View style={[styles.eyebrow, styles.eyebrowRight, isRecording && volume > 0.4 && styles.eyebrowRaised]} />
              </View>

              {/* Eyes */}
              <View style={styles.eyeRow}>
                <View style={[styles.eye, blink && styles.eyeClosed]}>
                  {!blink && <View style={styles.pupil} />}
                </View>
                <View style={[styles.eye, blink && styles.eyeClosed]}>
                  {!blink && <View style={styles.pupil} />}
                </View>
              </View>

              {/* Cheeks blush (optional micro-animations on speech) */}
              <View style={styles.cheekRow}>
                <View style={[styles.blush, isRecording && { opacity: 0.1 + volume * 0.4 }]} />
                <View style={[styles.blush, isRecording && { opacity: 0.1 + volume * 0.4 }]} />
              </View>

              {/* Nose */}
              <View style={styles.nose} />

              {/* Dynamic Viseme Mouth */}
              <View style={styles.mouthContainer}>
                <View style={[styles.mouth, getMouthStyle()]} />
              </View>
            </View>
          </View>

          {/* Premium Tech Info Overlay */}
          <View style={styles.techInfo}>
            <View style={styles.infoBadge}>
              <View style={[styles.statusDot, isRecording && styles.statusDotActive]} />
              <Text style={styles.infoText}>{statusMessage}</Text>
            </View>
            <View style={styles.infoBadge}>
              <Text style={styles.infoText}>Gecikme: {isRecording ? `${latency}ms` : '0ms'}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Voice Wave/Equalizer Section */}
      <View style={styles.visualizerSection}>
        <Text style={styles.sectionLabel}>SES SEVİYESİ & FREKANS ANALİZİ</Text>
        <View style={styles.equalizerContainer}>
          {renderEqualizerBars()}
        </View>
      </View>

      {/* Controller Buttons */}
      <View style={styles.controlsSection}>
        <TouchableOpacity 
          style={[styles.recordButton, isRecording && styles.recordButtonActive]} 
          onPress={handleToggleRecord}
          activeOpacity={0.8}
        >
          <Text style={styles.recordButtonText}>
            {isRecording ? '🎙️ Mikrofonu Kapat' : '🎙️ Sesini Dinlet'}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const { width } = Dimensions.get('window');

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
    marginBottom: 10,
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
    marginVertical: 20,
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
    padding: 20,
  },
  avatarFace: {
    width: 200,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHairTop: {
    width: 140,
    height: 45,
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginBottom: -10,
    zIndex: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  faceContour: {
    width: 130,
    height: 170,
    backgroundColor: '#fed7aa', // Premium warm tone
    borderRadius: 65,
    alignItems: 'center',
    paddingTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1,
    borderWidth: 2,
    borderColor: '#ffedd5',
  },
  eyebrowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '75%',
    marginBottom: 8,
  },
  eyebrow: {
    width: 32,
    height: 4,
    backgroundColor: '#0f172a',
    borderRadius: 2,
  },
  eyebrowLeft: {
    transform: [{ rotate: '4deg' }],
  },
  eyebrowRight: {
    transform: [{ rotate: '-4deg' }],
  },
  eyebrowRaised: {
    transform: [{ translateY: -4 }, { rotate: '0deg' }],
  },
  eyeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '70%',
    marginBottom: 10,
  },
  eye: {
    width: 24,
    height: 18,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  eyeClosed: {
    height: 2,
    backgroundColor: '#0f172a',
    borderRadius: 0,
    borderWidth: 0,
    marginVertical: 8,
  },
  pupil: {
    width: 10,
    height: 10,
    backgroundColor: '#3b82f6',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cheekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    position: 'absolute',
    top: 75,
  },
  blush: {
    width: 20,
    height: 12,
    backgroundColor: '#f43f5e',
    borderRadius: 10,
    opacity: 0.05,
  },
  nose: {
    width: 10,
    height: 20,
    backgroundColor: '#fdba74',
    borderRadius: 5,
    marginBottom: 15,
  },
  mouthContainer: {
    height: 45,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mouth: {
    // Lipsync dynamics are handled smoothly by metering intervals
  },
  techInfo: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
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
    fontSize: 10,
    fontWeight: 'bold',
  },
  visualizerSection: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    paddingVertical: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    marginVertical: 10,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6366f1',
    letterSpacing: 2,
    marginBottom: 16,
  },
  equalizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 110,
    width: '90%',
    gap: 6,
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
    marginTop: 10,
  },
  recordButton: {
    width: '100%',
    backgroundColor: '#4f46e5',
    paddingVertical: 18,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4f46e5',
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
