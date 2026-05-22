import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Text,
} from 'react-native';
import { Audio } from 'expo-av';

interface VoiceVisualizerProps {
  isRecording: boolean;
  onVolumeChange?: (level: number) => void;
}

const BAR_COUNT = 20;

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  isRecording,
  onVolumeChange,
}) => {
  const barAnims = useRef<Animated.Value[]>(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(4))
  ).current;

  const [permissionGranted, setPermissionGranted] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  // Idle gentle breathing animation
  const startIdleAnimation = useCallback(() => {
    barAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 6 + Math.random() * 10,
            duration: 600 + i * 40,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 4,
            duration: 600 + i * 40,
            useNativeDriver: false,
          }),
        ])
      ).start();
    });
  }, [barAnims]);

  const stopIdleAnimation = useCallback(() => {
    barAnims.forEach((anim) => anim.stopAnimation());
  }, [barAnims]);

  // Animate bars based on volume (–160 dBFS → 0 dBFS range)
  const animateBars = useCallback(
    (db: number) => {
      // db is typically in range -160 to 0. Normalize: -55 to 0 range mapped to 0-1
      const normalised = Math.max(0, Math.min(1, (db + 55) / 55));
      barAnims.forEach((anim, i) => {
        const phase = Math.sin((i / BAR_COUNT) * Math.PI);
        const jitter = Math.random() * 0.3;
        const height = 4 + (normalised + jitter) * phase * 90;
        Animated.spring(anim, {
          toValue: Math.max(4, height),
          useNativeDriver: false,
          speed: 30,
          bounciness: 4,
        }).start();
      });
      onVolumeChange?.(normalised);
    },
    [barAnims, onVolumeChange]
  );

  // Permissions
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setPermissionGranted(status === 'granted');
    })();
    return () => {
      stopIdleAnimation();
    };
  }, [stopIdleAnimation]);

  // Handle Recording State
  useEffect(() => {
    let isCurrent = true;

    const stopRecording = async () => {
      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch (e) {
          console.warn('Error stopping recording:', e);
        }
        recordingRef.current = null;
      }
      
      // Reset bars to idle
      barAnims.forEach((anim) => {
        anim.stopAnimation();
        Animated.spring(anim, {
          toValue: 4,
          useNativeDriver: false,
          speed: 10,
          bounciness: 2,
        }).start();
      });
      startIdleAnimation();
    };

    const startRecording = async () => {
      if (!permissionGranted) {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') return;
        setPermissionGranted(true);
      }
      
      stopIdleAnimation();
      
      try {
        // iOS ve Android için ses modunu tamamen kayıt moduna ayarlıyoruz
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const newRecording = new Audio.Recording();
        await newRecording.prepareToRecordAsync({
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
          isMeteringEnabled: true,
          ios: {
            ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
          },
          android: {
            ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
          }
        });

        newRecording.setProgressUpdateInterval(50);
        newRecording.setOnRecordingStatusUpdate((status) => {
          if (status.isRecording && status.metering !== undefined) {
            const db = status.metering ?? -160;
            if (isCurrent) {
              animateBars(db);
            }
          }
        });

        recordingRef.current = newRecording;
        try {
          await newRecording.startAsync();
        } catch (startError) {
          await newRecording.stopAndUnloadAsync().catch(() => {});
          throw startError;
        }
      } catch (e) {
        console.warn('VoiceVisualizer recording error:', e);
      }
    };

    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }

    return () => {
      isCurrent = false;
    };
  }, [isRecording, permissionGranted, animateBars, startIdleAnimation, stopIdleAnimation, barAnims]);

  // Start idle animation on mount
  useEffect(() => {
    startIdleAnimation();
    return () => stopIdleAnimation();
  }, [startIdleAnimation, stopIdleAnimation]);

  return (
    <View style={styles.container}>
      <View style={styles.barsContainer}>
        {barAnims.map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.bar,
              {
                height: anim,
                opacity: isRecording ? 1 : 0.45,
                backgroundColor: isRecording
                  ? `hsl(${200 + (i / BAR_COUNT) * 60}, 100%, 65%)`
                  : 'rgba(150,180,255,0.5)',
              },
            ]}
          />
        ))}
      </View>
      {!permissionGranted && (
        <Text style={styles.permText}>Mikrofon izni gerekli</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 110,
  },
  bar: {
    width: 8,
    borderRadius: 4,
    minHeight: 4,
  },
  permText: {
    color: '#ff6b6b',
    marginTop: 8,
    fontSize: 13,
  },
});
