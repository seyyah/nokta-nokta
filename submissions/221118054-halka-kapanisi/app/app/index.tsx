// app/index.tsx — MirrorScreen
// Ana ekran. Mikrofona dokun → ses yakalanır → RMS hesaplanır →
// VoiceVisualizer barları zıplar → AvatarScene'in mouthOpen
// morph target'i seninle senkron oynar. Aynaya konuşmak gibi.

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMicAnalyzer } from '../src/voice/useMicAnalyzer';
import { VoiceVisualizer } from '../src/voice/VoiceVisualizer';
import { AvatarScene } from '../src/avatar/AvatarScene';

export default function MirrorScreen() {
  const router = useRouter();
  const mic = useMicAnalyzer();

  const handleToggle = async () => {
    if (mic.isRecording) {
      await mic.stop();
    } else {
      await mic.start();
      if (mic.error) Alert.alert('🎙️ Mikrofon Hatası', mic.error, [{ text: 'Tamam', style: 'default' }]);
    }
  };

  return (
    <View style={s.container}>
      {/* Avatar — ekranın üst yarısı */}
      <View style={s.avatarBox}>
        <AvatarScene level={mic.level} />
      </View>

      {/* Voice visualizer */}
      <View style={s.vizBox}>
        <VoiceVisualizer level={mic.level} active={mic.isRecording} />
        <Text style={s.levelLabel}>
          {mic.isRecording
            ? `seviye: ${Math.round(mic.level * 100)}%`
            : 'mikrofon kapalı'}
        </Text>
      </View>

      {/* Mic button */}
      <TouchableOpacity
        style={[s.micBtn, mic.isRecording && s.micBtnActive]}
        onPress={handleToggle}
        testID="mic-button"
      >
        <Text style={s.micEmoji}>{mic.isRecording ? '⏹️' : '🎙️'}</Text>
        <Text style={s.micText}>
          {mic.isRecording ? 'Durdur' : 'Konuş'}
        </Text>
      </TouchableOpacity>

      {/* Bottom nav */}
      <View style={s.bottomNav}>
        <TouchableOpacity
          style={s.navBtn}
          onPress={() => router.push('/forge')}
        >
          <Text style={s.navEmoji}>🔨</Text>
          <Text style={s.navText}>Forge</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.navBtn}
          onPress={() => router.push('/bridge')}
        >
          <Text style={s.navEmoji}>📞</Text>
          <Text style={s.navText}>Uzmana Bağlan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117', padding: 16 },
  avatarBox: {
    flex: 1,
    minHeight: 280,
    borderRadius: 16,
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#30363d',
    overflow: 'hidden',
    marginBottom: 16,
  },
  vizBox: { alignItems: 'center', marginBottom: 16 },
  levelLabel: {
    color: '#8b949e',
    fontSize: 12,
    marginTop: 8,
    fontFamily: 'monospace',
  },
  micBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#1f6feb',
    borderRadius: 28,
    paddingVertical: 16,
    marginBottom: 16,
  },
  micBtnActive: { backgroundColor: '#da3633' },
  micEmoji: { fontSize: 22 },
  micText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  bottomNav: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  navBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  navEmoji: { fontSize: 22, marginBottom: 4 },
  navText: { color: '#f0f6fc', fontSize: 13, fontWeight: '600' },
});
