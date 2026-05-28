import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Web ortamında 'three' kütüphanesi import.meta SyntaxError'ı verdiği için
// Metro Bundler tarafından sadece web'de bu dosya yüklenecektir.
export default function AvatarScene({ isSpeaking = false }: { isSpeaking?: boolean }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>3D Avatar sadece Mobil (Native) uygulamada çalışır.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  text: {
    color: '#94A3B8',
    textAlign: 'center',
  }
});
