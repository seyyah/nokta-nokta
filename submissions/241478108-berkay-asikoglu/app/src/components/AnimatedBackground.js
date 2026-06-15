import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Dimensions, Easing, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function AnimatedBackground() {
  const rotateAnim1 = useRef(new Animated.Value(0)).current;
  const rotateAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim1, {
        toValue: 1,
        duration: 25000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim2, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  const spin1 = rotateAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const spin2 = rotateAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg']
  });

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 20]
  });

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <LinearGradient
        colors={['#020617', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />
      <Animated.View
        style={[
          styles.blob1,
          { transform: [{ rotate: spin1 }, { translateY }] }
        ]}
      >
         <LinearGradient
          colors={['rgba(168, 85, 247, 0.4)', 'rgba(59, 130, 246, 0.1)']}
          style={StyleSheet.absoluteFillObject}
          start={{x: 0, y: 0}} end={{x: 1, y: 1}}
        />
      </Animated.View>
      
      <Animated.View
        style={[
          styles.blob2,
          { transform: [{ rotate: spin2 }, { translateX: translateY }] }
        ]}
      >
        <LinearGradient
          colors={['rgba(6, 182, 212, 0.4)', 'rgba(168, 85, 247, 0.1)']}
          style={StyleSheet.absoluteFillObject}
          start={{x: 1, y: 0}} end={{x: 0, y: 1}}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  blob1: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: (width * 1.5) / 2,
    top: -height * 0.2,
    left: -width * 0.4,
    opacity: 0.6,
  },
  blob2: {
    position: 'absolute',
    width: width * 1.8,
    height: width * 1.8,
    borderRadius: (width * 1.8) / 2,
    bottom: -height * 0.4,
    right: -width * 0.6,
    opacity: 0.5,
  }
});
