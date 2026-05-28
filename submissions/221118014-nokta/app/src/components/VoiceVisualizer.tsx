import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Audio } from 'expo-av';

export default function VoiceVisualizer({ 
  onAudioLevel,
  onDebugError
}: { 
  onAudioLevel?: (level: number) => void;
  onDebugError?: (error: string) => void;
}) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const bars = useRef(Array.from({ length: 15 }).map(() => new Animated.Value(0.1))).current;
  const onAudioLevelRef = useRef(onAudioLevel);
  onAudioLevelRef.current = onAudioLevel;

  useEffect(() => {
    let isMounted = true;
    let currentRecording: Audio.Recording | null = null;

    async function startRecording() {
      try {
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) return;

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        // Set custom recording options to enable metering
        const recordingOptions = {
          android: {
            extension: '.m4a',
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 64000,
          },
          ios: {
            extension: '.m4a',
            outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 64000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: {
            mimeType: 'audio/webm',
            bitsPerSecond: 64000,
          },
          isMeteringEnabled: true, // MUST BE TRUE
        };

        const { recording: newRecording } = await Audio.Recording.createAsync(
          recordingOptions,
          (status) => {
            if (status.isRecording && isMounted) {
              const metering = status.metering;
              // Metering is in dB, usually from -160 to 0. 
              // Human speech is usually in the range of -50dB to -10dB.
              if (metering !== undefined) {
                let level = (metering + 55) / 45; // map -55dB...-10dB to 0...1
                level = Math.max(0, Math.min(1, level));

                if (onAudioLevelRef.current) {
                  onAudioLevelRef.current(level);
                }

                // Smoothly animate visualizer bars
                bars.forEach((bar, index) => {
                  const distanceToCenter = Math.abs(index - 7) / 7;
                  const baseScale = Math.max(0.15, 1 - distanceToCenter);
                  const randomScale = 0.1 + (level * baseScale * (0.8 + Math.random() * 0.45));
                  
                  Animated.timing(bar, {
                    toValue: level < 0.05 ? 0.1 : randomScale,
                    duration: 60,
                    useNativeDriver: true,
                  }).start();
                });
              }
            }
          },
          60 // update every 60ms for low latency (<200ms)
        );

        if (isMounted) {
          setRecording(newRecording);
          currentRecording = newRecording;
        } else {
          await newRecording.stopAndUnloadAsync();
        }
      } catch (err: any) {
        console.error('Failed to start recording with metering', err);
        if (onDebugError) onDebugError(err.message || String(err));
      }
    }

    startRecording();

    return () => {
      isMounted = false;
      if (currentRecording) {
        currentRecording.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {bars.map((bar, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            { transform: [{ scaleY: bar }] },
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
    height: 100,
    backgroundColor: 'transparent',
  },
  bar: {
    width: 6,
    height: 80,
    backgroundColor: '#00ffcc',
    marginHorizontal: 3,
    borderRadius: 3,
    shadowColor: '#00ffcc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
});
