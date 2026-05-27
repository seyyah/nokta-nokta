import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export default function ProcessingScreen({ route, navigation }) {
  const { ideaDump } = route.params;
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Breathing pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();

    // Rotate slow
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Mock processing delay -> Move to Clarification or Result
    const timer = setTimeout(() => {
      // Move to Insight screen to show detailed understanding
      navigation.replace('Insight', { ideaDump });
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#020617', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.content}>
        <View style={styles.orbContainer}>
           <Animated.View style={[
             styles.orbOuter, 
             { transform: [{ scale: pulseAnim }], opacity: opacityAnim }
           ]} />
           <Animated.View style={[
             styles.orbInner,
             { transform: [{ rotate: spin }] }
           ]}>
             <LinearGradient
               colors={['#a855f7', '#06b6d4']}
               style={StyleSheet.absoluteFillObject}
               start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
             />
           </Animated.View>
        </View>

        <BlurView intensity={30} tint="dark" style={styles.textContainer}>
          <Text style={styles.processingText}>Bağlam Çözümleniyor...</Text>
          <Text style={styles.subText}>AI Mimari Çerçeveyi Kuruyor</Text>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 80,
  },
  orbOuter: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.4)',
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
  },
  orbInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    shadowColor: '#06b6d4',
    shadowOpacity: 0.8,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },
  textContainer: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.2)',
  },
  processingText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  }
});
