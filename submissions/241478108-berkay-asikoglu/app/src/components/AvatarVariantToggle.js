import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function AvatarVariantToggle({ variant, onToggle }) {
  return (
    <TouchableOpacity onPress={onToggle} style={styles.fab} activeOpacity={0.8}>
      <Text style={styles.fabText}>
        {variant === 'junior-sen' ? '👶 junior-sen' : '🧠 senior-sen'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  fabText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
