import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Audio } from 'expo-av';

export default function VoiceVisualizer({ onAudioLevel }) {
  const [recording, setRecording] = useState(null);
  const animationValues = useRef([...Array(5)].map(() => new Animated.Value(10))).current;

  useEffect(() => {
    let active = true;
    let rec = null;

    const startRecording = async () => {
      try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY,
          (status) => {
            if (active && status.isRecording) {
              const currentMetering = status.metering || -160;
              if (onAudioLevel) onAudioLevel(currentMetering);

              // Map -60 to 0 (db) to a multiplier (0 to 1)
              const volume = Math.max(0, (currentMetering + 60) / 60);
              const targetHeight = 10 + volume * 100;

              animationValues.forEach((val) => {
                const randomHeight = targetHeight * (0.5 + Math.random() * 0.5);
                Animated.spring(val, {
                  toValue: Math.max(10, randomHeight),
                  friction: 5,
                  tension: 100,
                  useNativeDriver: false,
                }).start();
              });
            }
          },
          100 // Update every 100ms
        );
        if (active) {
          rec = recording;
          setRecording(recording);
        }
      } catch (err) {
        console.warn('Microphone access denied or failed.', err);
      }
    };

    startRecording();

    return () => {
      active = false;
      if (rec) {
        rec.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {animationValues.map((val, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            { height: val }
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
    height: 120,
    gap: 8,
    marginVertical: 10,
  },
  bar: {
    width: 12,
    backgroundColor: '#7DF9FF',
    borderRadius: 6,
  }
});
