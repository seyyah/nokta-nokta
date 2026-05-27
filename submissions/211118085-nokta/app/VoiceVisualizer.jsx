/**
 * VoiceVisualizer.jsx
 * Mikrofon → expo-av FFT/RMS → animasyonlu bar visualizer
 * OpenAI voice-mode estetiği: sessizlikte söner, konuşunca canlanır
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';

const BAR_COUNT = 32;
const SAMPLE_INTERVAL = 60; // ms — ~16fps, <200ms latency hedefi için yeterli
const SILENCE_THRESHOLD = 0.015;
const SMOOTHING = 0.6; // exponential smoothing katsayısı

/**
 * Tek bir bar widget'ı — Animated.Value ile yumuşak yükseklik geçişi
 */
const Bar = React.memo(({ animValue, index, totalBars }) => {
  const center = totalBars / 2;
  const distFromCenter = Math.abs(index - center) / center; // 0..1
  // Ortadaki barlar en uzun olabilir — gradyan renk efekti için hue shift
  const hue = Math.round(60 + distFromCenter * 30); // sarı-yeşil arası

  const height = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 80],
    extrapolate: 'clamp',
  });

  const opacity = animValue.interpolate({
    inputRange: [0, 0.05, 1],
    outputRange: [0.15, 0.7, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          height,
          opacity,
          backgroundColor: `hsl(${hue}, 100%, 55%)`,
        },
      ]}
    />
  );
});

/**
 * Ana VoiceVisualizer bileşeni
 *
 * Props:
 *   onRmsChange(rms: number) — dışarıya RMS değeri ilet (avatar lipsync için)
 *   onTranscript(text: string) — STT entegrasyonu için hook (opsiyonel)
 *   style — dış container stili
 */
export default function VoiceVisualizer({ onRmsChange, style }) {
  const [isRecording, setIsRecording] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const recordingRef = useRef(null);
  const intervalRef = useRef(null);
  const animValues = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(0))
  ).current;
  const prevValues = useRef(new Array(BAR_COUNT).fill(0));

  // İzin iste
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setPermissionGranted(status === 'granted');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    })();
    return () => stopRecording();
  }, []);

  /**
   * getStatus() → metering enabled ise dB değeri döner.
   * expo-av Recording.getStatusAsync() → { metering: dB }
   * dB'yi 0..1 normalize ediyoruz: dBToLinear(db) = 10^(db/20)
   */
  const dBToLinear = (db) => {
    if (db === undefined || db === null || db < -160) return 0;
    return Math.pow(10, db / 20);
  };

  /**
   * Pseudo-FFT: tek metering değerinden BAR_COUNT bar üret.
   * Gerçek FFT expo-av'da erişilemez; bunun yerine RMS + sinüs tabanlı
   * spektral dağılım simülasyonu yapıyoruz. Kulağa ve gözе gerçekçi görünür.
   */
  const rmsToSpectrum = useCallback((rms, timestamp) => {
    const spectrum = new Array(BAR_COUNT).fill(0);
    if (rms < SILENCE_THRESHOLD) return spectrum;

    const t = timestamp / 1000;
    for (let i = 0; i < BAR_COUNT; i++) {
      const freq = (i / BAR_COUNT) * Math.PI * 2;
      // Düşük frekanslarda daha fazla enerji (konuşma spektrumu taklidi)
      const formantBoost = i < 8 ? 1.4 : i < 16 ? 1.0 : 0.6;
      const noise = (Math.random() * 0.3 + 0.7); // hafif rastgelelik
      const wave = 0.5 + 0.5 * Math.sin(freq * 3 + t * (2 + i * 0.1));
      spectrum[i] = rms * formantBoost * noise * wave;
    }
    return spectrum;
  }, []);

  const startRecording = async () => {
    if (!permissionGranted || isRecording) return;
    try {
      const { recording } = await Audio.Recording.createAsync(
        {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
          isMeteringEnabled: true,
        }
      );
      recordingRef.current = recording;
      setIsRecording(true);

      // Polling loop
      intervalRef.current = setInterval(async () => {
        if (!recordingRef.current) return;
        try {
          const status = await recordingRef.current.getStatusAsync();
          const rms = dBToLinear(status.metering ?? -160);

          // Dışarıya RMS ilet (lipsync için)
          onRmsChange?.(rms);

          const spectrum = rmsToSpectrum(rms, Date.now());

          // Exponential smoothing + Animated.setValue (JS thread, no bridge overhead)
          spectrum.forEach((target, i) => {
            const prev = prevValues.current[i];
            const smoothed = prev * SMOOTHING + target * (1 - SMOOTHING);
            prevValues.current[i] = smoothed;
            animValues[i].setValue(smoothed);
          });
        } catch (_) {
          // recording durdurulmuş olabilir
        }
      }, SAMPLE_INTERVAL);
    } catch (e) {
      console.warn('VoiceVisualizer startRecording error:', e);
    }
  };

  const stopRecording = async () => {
    clearInterval(intervalRef.current);
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (_) {}
      recordingRef.current = null;
    }
    // Barları sıfırla — fade out animasyonu
    animValues.forEach((av) => {
      Animated.timing(av, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }).start();
    });
    setIsRecording(false);
    onRmsChange?.(0);
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  return (
    <View style={[styles.container, style]}>
      {/* Bar sahası */}
      <View style={styles.barsContainer}>
        {animValues.map((av, i) => (
          <Bar key={i} animValue={av} index={i} totalBars={BAR_COUNT} />
        ))}
      </View>

      {/* Mikrofon butonu */}
      <TouchableOpacity
        style={[styles.micButton, isRecording && styles.micButtonActive]}
        onPress={toggleRecording}
        activeOpacity={0.8}
      >
        <Text style={styles.micIcon}>{isRecording ? '⏹' : '🎙️'}</Text>
        <Text style={styles.micLabel}>
          {!permissionGranted
            ? 'İzin Gerekli'
            : isRecording
            ? 'Dinleniyor...'
            : 'Konuş'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 90,
    gap: 3,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  bar: {
    width: 6,
    borderRadius: 3,
    alignSelf: 'flex-end',
  },
  micButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  micButtonActive: {
    borderColor: '#e8ff00',
    backgroundColor: '#1a1f00',
  },
  micIcon: { fontSize: 20 },
  micLabel: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '600',
  },
});
