import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
  StatusBar,
} from 'react-native';
import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { AvatarScene } from './AvatarScene';
import { VoiceVisualizer } from './VoiceVisualizer';

const { width: W, height: H } = Dimensions.get('window');

export default function AvatarVoiceScreen() {
  const navigation = useNavigation<any>();
  const [isRecording, setIsRecording] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isSenior, setIsSenior] = useState(false);

  // Animations
  const buttonScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const statusOpacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  // Pulse animation on recording
  useEffect(() => {
    if (isRecording) {
      pulseLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
        ])
      );
      pulseLoopRef.current.start();

      Animated.timing(statusOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();

      timerRef.current = setInterval(() => {
        setSessionSeconds((s) => s + 1);
      }, 1000);
    } else {
      pulseLoopRef.current?.stop();
      pulseAnim.setValue(0);
      Animated.timing(statusOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setSessionSeconds(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, pulseAnim, statusOpacity]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleToggle = useCallback(async () => {
    if (!isRecording) {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return;
    }

    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    setIsRecording((prev) => !prev);
    if (isRecording) setVolumeLevel(0);
  }, [isRecording, buttonScale]);

  const handleVolumeChange = useCallback((level: number) => {
    setVolumeLevel(level);
  }, []);

  const pulseInterpolated = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.18],
  });

  const pulseOpacityInterp = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0],
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#080c18" translucent />

      {/* ── AVATAR 3D ── */}
      <View style={styles.avatarContainer}>
        <AvatarScene volumeLevel={volumeLevel} />

        {/* Canlı rozet */}
        <Animated.View style={[styles.liveBadge, { opacity: statusOpacity }]}>
          <Animated.View style={[styles.liveDot, { opacity: pulseOpacityInterp }]} />
          <View style={styles.liveDotSolid} />
          <Text style={styles.liveText}>CANLI  {formatTime(sessionSeconds)}</Text>
        </Animated.View>

        {isSenior && (
           <View style={styles.seniorOverlay} pointerEvents="none" />
        )}
        
        <View style={styles.topRightControls}>
           <TouchableOpacity 
             style={styles.expertBtnTop}
             onPress={() => navigation.navigate('ExpertCall')}
           >
             <Text style={styles.expertBtnTopText}>📞 Uzmana Bağlan</Text>
           </TouchableOpacity>
           
           {isSenior && (
             <View style={styles.seniorBadge}>
               <Text style={styles.seniorBadgeText}>★ UZMAN MODU</Text>
             </View>
           )}
        </View>

        {/* Alt gradient overlay */}
        <View style={styles.avatarGradientOverlay} pointerEvents="none" />
      </View>

      {/* ── ALT PANEL ── */}
      <View style={styles.bottomPanel}>

        {/* Başlık */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>{isSenior ? 'Senior Sen' : 'Junior Sen'}</Text>
            <Text style={styles.subtitle}>Sesini duyunca ağzı oynuyor</Text>
          </View>
          
          <TouchableOpacity 
             onPress={() => setIsSenior(!isSenior)} 
             style={styles.toggleBtn}>
            <Text style={styles.toggleText}>👤 {isSenior ? 'Junior\'a Geç' : 'Senior\'a Geç'}</Text>
          </TouchableOpacity>

          <View style={[styles.statusDot, { backgroundColor: isRecording ? '#00e676' : '#444' }]} />
        </View>

        {/* ── VİZUALİZER ── */}
        <View style={styles.vizCard}>
          <View style={styles.vizHeader}>
            <Text style={styles.vizLabel}>
              {isRecording ? '🎙  Ses seviyesi' : '🎙  Bekleniyor'}
            </Text>
            {isRecording && (
              <Text style={styles.volValue}>{Math.round(volumeLevel * 100)}%</Text>
            )}
          </View>
          <View style={styles.vizWrapper}>
            <VoiceVisualizer isRecording={isRecording} onVolumeChange={handleVolumeChange} />
          </View>
        </View>

        {/* ── BUTON ── */}
        <View style={styles.buttonRow}>
          {/* Pulse ring */}
          {isRecording && (
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  transform: [{ scale: pulseInterpolated }],
                  opacity: pulseOpacityInterp,
                },
              ]}
            />
          )}

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[styles.button, isRecording && styles.buttonActive]}
              onPress={handleToggle}
              activeOpacity={0.9}
            >
              <Text style={styles.buttonIcon}>{isRecording ? '⏹' : '🎤'}</Text>
              <Text style={styles.buttonText}>
                {isRecording ? 'Durdur' : 'Konuşmaya Başla'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Latency note */}
        <Text style={styles.hint}>mic → avatar latency &lt; 200ms  ·  Phase A</Text>
      </View>
    </View>
  );
}

const AVATAR_H = H * 0.56;
const BOTTOM_H = H - AVATAR_H;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#080c18',
  },
  // Avatar bölümü
  avatarContainer: {
    height: AVATAR_H,
    width: W,
    overflow: 'hidden',
  },
  avatarGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'transparent',
    // Gradient efekti için shadow trick
    borderBottomWidth: 80,
    borderBottomColor: '#080c18',
    borderLeftWidth: (W / 2),
    borderRightWidth: (W / 2),
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    opacity: 0.9,
  },
  liveBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 36,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,80,80,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 7,
  },
  liveDot: {
    position: 'absolute',
    left: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff4444',
  },
  liveDotSolid: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4444',
    marginLeft: 2,
  },
  liveText: {
    color: '#ff8888',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
  },

  // Alt panel
  bottomPanel: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#e8f0ff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: 'rgba(140,170,255,0.5)',
    fontSize: 12,
    marginTop: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  toggleBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  toggleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  seniorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(243, 156, 18, 0.1)',
  },
  topRightControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 36,
    right: 16,
    alignItems: 'flex-end',
    gap: 8,
  },
  expertBtnTop: {
    backgroundColor: '#e74c3c', // Kırmızı (STUCK olduğu için)
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  expertBtnTopText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  seniorBadge: {
    backgroundColor: '#f39c12',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  seniorBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Visualizer kartı
  vizCard: {
    backgroundColor: 'rgba(20,30,60,0.7)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(80,120,255,0.18)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flex: 1,
    marginBottom: 14,
  },
  vizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  vizLabel: {
    color: 'rgba(160,190,255,0.7)',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  volValue: {
    color: '#5599ff',
    fontSize: 12,
    fontWeight: '600',
  },
  vizWrapper: {
    flex: 1,
    justifyContent: 'center',
  },

  // Buton
  buttonRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#c0392b',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#3b5bfc',
    paddingHorizontal: 32,
    paddingVertical: 15,
    borderRadius: 50,
    shadowColor: '#3b5bfc',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  buttonActive: {
    backgroundColor: '#c0392b',
    shadowColor: '#c0392b',
  },
  buttonIcon: {
    fontSize: 18,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  expertBtn: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(243, 156, 18, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(243, 156, 18, 0.5)',
    marginBottom: 10,
  },
  expertBtnText: {
    color: '#f39c12',
    fontWeight: 'bold',
    fontSize: 14,
  },
  hint: {
    textAlign: 'center',
    color: 'rgba(100,140,200,0.35)',
    fontSize: 10,
    letterSpacing: 0.8,
  },
});