import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';

interface VoiceVisualizerProps {
  /** Eğer false ise görselleştirici sönük/bekleme durumuna geçer. */
  isActive?: boolean;
  /** Bar rengini dışarıdan alabilmek için (Karanlık/Aydınlık mod) */
  color?: string;
}

export default function VoiceVisualizer({ isActive = false, color = '#10B981' }: VoiceVisualizerProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  
  // 5 barlık bir dalga formu (OpenAI voice-mode stili)
  const animValues = useRef([
    new Animated.Value(4),
    new Animated.Value(4),
    new Animated.Value(4),
    new Animated.Value(4),
    new Animated.Value(4),
  ]).current;

  useEffect(() => {
    let isSubscribed = true;

    async function startRecording() {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') return;

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        
        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.LOW_QUALITY,
          (statusUpdate) => {
            if (!isSubscribed) return;
            if (statusUpdate.isRecording && statusUpdate.isMeteringEnabled && statusUpdate.metering !== undefined) {
              // Metering genelde -160 (sessiz) ile 0 (en yüksek) arasındadır.
              // Biz minDb = -60 üzerinden 0 ile 1 arasında normalize ediyoruz.
              const minDb = -60;
              const normalized = Math.max(0, (statusUpdate.metering - minDb) / Math.abs(minDb));
              
              // Her bar için merkezde yüksek, kenarlarda düşük olacak şekilde varyasyonlu genlik
              const multipliers = [0.6, 0.8, 1.0, 0.8, 0.6];
              
              animValues.forEach((anim, i) => {
                const target = isActive ? 8 + (normalized * 45 * multipliers[i] * (Math.random() * 0.3 + 0.7)) : 4;
                Animated.timing(anim, {
                  toValue: target,
                  duration: 80, // 80ms ile < 200ms latency hedefine uygun hızlı tepki
                  useNativeDriver: false,
                }).start();
              });
            }
          },
          80 // 80ms interval for extremely fast visual feedback
        );
        
        if (isSubscribed) {
          setRecording(newRecording);
        } else {
          newRecording.stopAndUnloadAsync();
        }
      } catch (err) {
        console.warn('Failed to start audio recording for visualizer', err);
      }
    }

    if (isActive) {
      startRecording();
    } else {
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
        setRecording(null);
      }
      // Sessizlikte sönme (4px yüksekliğe geri dön)
      animValues.forEach((anim) => {
        Animated.timing(anim, {
          toValue: 4,
          duration: 300,
          useNativeDriver: false,
        }).start();
      });
    }

    return () => {
      isSubscribed = false;
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, [isActive]);

  return (
    <View style={styles.container}>
      {animValues.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            { backgroundColor: color, height: anim }
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    gap: 6,
  },
  bar: {
    width: 6,
    borderRadius: 3,
  },
});
