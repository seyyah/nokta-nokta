import React, { useRef, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Vibration, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BridgeButton({ visible, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    Vibration.vibrate(200);
    // Scale pulse animation
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.92, useNativeDriver: true, friction: 4 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 4 }),
    ]).start();
    onPress();
  }, [onPress, scaleAnim]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity onPress={handlePress} style={styles.button} activeOpacity={0.8}>
          <Ionicons name="videocam" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.text}>Uzmana Bağlan</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 180,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff5555',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#ff5555',
    shadowOpacity: 0.6,
    shadowRadius: 24,
  },
  text: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
