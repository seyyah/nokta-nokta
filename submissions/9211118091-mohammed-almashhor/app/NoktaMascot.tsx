import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export type MascotEmotion = 'idle' | 'thinking' | 'done' | 'error' | 'speaking';

interface Props {
  emotion: MascotEmotion;
  size?: number;
}

export default function NoktaMascot({ emotion, size = 28 }: Props) {
  const translateY = useRef(new Animated.Value(0)).current;
  const mouthScaleY = useRef(new Animated.Value(1)).current;
  const eyeScaleY = useRef(new Animated.Value(1)).current;

  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const speakRef = useRef<Animated.CompositeAnimation | null>(null);

  // Main body animation
  useEffect(() => {
    animRef.current?.stop();
    translateY.setValue(0);
    eyeScaleY.setValue(1);

    if (emotion === 'idle' || emotion === 'speaking') {
      animRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, { toValue: -2, duration: 1000, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 2, duration: 1000, useNativeDriver: true }),
        ])
      );
      animRef.current.start();
    } else if (emotion === 'thinking') {
      // Squint eyes
      eyeScaleY.setValue(0.2);
      animRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, { toValue: -1, duration: 400, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      );
      animRef.current.start();
    } else if (emotion === 'done') {
      animRef.current = Animated.sequence([
        Animated.timing(translateY, { toValue: -8, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]);
      animRef.current.start();
    } else if (emotion === 'error') {
      animRef.current = Animated.sequence([
        Animated.timing(translateY, { toValue: 5, duration: 100, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -5, duration: 100, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]);
      animRef.current.start();
    }

    return () => { animRef.current?.stop(); };
  }, [emotion]);

  // Mouth animation
  useEffect(() => {
    speakRef.current?.stop();
    if (emotion === 'speaking') {
      speakRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(mouthScaleY, { toValue: 3.5, duration: 150, useNativeDriver: true }),
          Animated.timing(mouthScaleY, { toValue: 0.5, duration: 150, useNativeDriver: true }),
          Animated.timing(mouthScaleY, { toValue: 2, duration: 100, useNativeDriver: true }),
          Animated.timing(mouthScaleY, { toValue: 1, duration: 150, useNativeDriver: true }),
        ])
      );
      speakRef.current.start();
    } else if (emotion === 'thinking') {
      mouthScaleY.setValue(0.3);
    } else if (emotion === 'done') {
      mouthScaleY.setValue(2);
    } else {
      mouthScaleY.setValue(1);
    }
    return () => { speakRef.current?.stop(); };
  }, [emotion]);

  const primaryColor = emotion === 'error' ? '#ff6b6b' : (emotion === 'done' ? '#4caf50' : '#A882FF');
  const headSize = size * 1.2;

  return (
    <View style={[styles.wrapper, { width: headSize, height: headSize, marginRight: 8 }]}>
      <Animated.View style={[styles.head, { backgroundColor: primaryColor, transform: [{ translateY }] }]}>
        <View style={styles.eyesRow}>
          <Animated.View style={[styles.eye, { transform: [{ scaleY: eyeScaleY }] }]} />
          <Animated.View style={[styles.eye, { transform: [{ scaleY: eyeScaleY }] }]} />
        </View>
        <Animated.View style={[styles.mouth, { transform: [{ scaleY: mouthScaleY }] }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center' },
  head: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '15%',
    shadowColor: '#A882FF',
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  eyesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '50%',
    marginBottom: '15%',
  },
  eye: {
    width: '25%',
    aspectRatio: 1,
    backgroundColor: '#0F0F14',
    borderRadius: 10,
  },
  mouth: {
    width: '40%',
    height: '10%',
    backgroundColor: '#0F0F14',
    borderRadius: 5,
  },
});
