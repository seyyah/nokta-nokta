// Phase A composite: avatar on top, mirrored bar visualizer in the middle,
// record / stop toggle at the bottom. Uses the existing theme tokens so it
// matches Hafta-2 dark/light surfaces.

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import VoiceVisualizer from './VoiceVisualizer';
import AvatarScene from './AvatarScene';
import { createAnalyzer } from '../lib/audioAnalyzer';

export default function VoiceAvatarScreen({ theme, onBack }) {
  const analyzer = useMemo(() => createAnalyzer(), []);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      // ensure mic releases on unmount
      analyzer.stop().catch(() => {});
    };
  }, [analyzer]);

  const handleToggle = async () => {
    try {
      if (recording) {
        await analyzer.stop();
        setRecording(false);
      } else {
        setError(null);
        await analyzer.start();
        setRecording(true);
      }
    } catch (e) {
      const msg = e?.message ?? String(e);
      setError(msg);
      setRecording(false);
      if (Platform.OS !== 'web') Alert.alert('Mic error', msg);
    }
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16, gap: 20, maxWidth: 680, alignSelf: 'center', width: '100%' }}>

      {/* ── Header ── */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ color: theme.text, fontSize: 26, fontWeight: '900', letterSpacing: -0.8 }}>Voice</Text>
          <Text style={{ color: theme.textMuted, fontWeight: '700', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase' }}>
            Mirror &middot; Lipsync
          </Text>
        </View>
        <TouchableOpacity onPress={onBack}>
          <Text style={{ fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, color: theme.textMuted }}>
            ← Back
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Avatar ── */}
      <AvatarScene analyzer={analyzer} theme={theme} height={300} />

      {/* ── Visualizer ── */}
      <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 8 }}>
        <VoiceVisualizer analyzer={analyzer} isActive={recording} theme={theme} width={320} />
      </View>

      {/* ── Record toggle ── */}
      <View style={{ alignItems: 'center', gap: 10 }}>
        <TouchableOpacity
          onPress={handleToggle}
          style={{
            width: 76, height: 76, borderRadius: 38,
            borderWidth: 3, borderColor: theme.borderStrong,
            backgroundColor: recording ? '#dc2626' : theme.btnBg,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <View
            style={{
              width: recording ? 22 : 30,
              height: recording ? 22 : 30,
              borderRadius: recording ? 4 : 15,
              backgroundColor: recording ? '#fff' : theme.btnText,
            }}
          />
        </TouchableOpacity>
        <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2, color: theme.textMuted }}>
          {recording ? 'Listening — tap to stop' : 'Tap to start mic'}
        </Text>
        {error && (
          <Text style={{ fontSize: 11, color: '#dc2626', textAlign: 'center' }}>
            {error}
          </Text>
        )}
      </View>

    </View>
  );
}
