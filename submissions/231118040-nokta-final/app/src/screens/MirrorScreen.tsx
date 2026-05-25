import { Mic, MicOff } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AvatarStage } from '../components/AvatarStage';
import { Waveform } from '../components/Waveform';
import { colors } from '../theme';

type VoiceController = {
  active: boolean;
  decibels: number;
  error: string;
  level: number;
  sampleIntervalMs: number;
  start: () => Promise<void>;
  stop: () => Promise<void>;
};

export function MirrorScreen({ voice }: { voice: VoiceController }) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <AvatarStage active={voice.active} level={voice.level} />
      <Waveform active={voice.active} decibels={voice.decibels} level={voice.level} />

      <View style={styles.controls}>
        <Pressable
          onPress={() => void (voice.active ? voice.stop() : voice.start())}
          style={[styles.micButton, voice.active && styles.micButtonLive]}
        >
          {voice.active ? <MicOff color="#ffffff" size={20} /> : <Mic color="#ffffff" size={20} />}
          <Text style={styles.micText}>{voice.active ? 'Dinlemeyi Durdur' : 'Mikrofonu Baslat'}</Text>
        </Pressable>
        <View style={styles.latency}>
          <Text style={styles.latencyValue}>&lt; {voice.sampleIntervalMs * 4} ms</Text>
          <Text style={styles.latencyLabel}>mouth response target</Text>
        </View>
      </View>
      {voice.error ? <Text style={styles.error}>{voice.error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingBottom: 22,
    paddingHorizontal: 18,
  },
  controls: {
    flexDirection: 'row',
    gap: 10,
  },
  micButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 54,
  },
  micButtonLive: {
    backgroundColor: colors.voice,
  },
  micText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  latency: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
    width: 126,
  },
  latencyValue: {
    color: colors.voice,
    fontSize: 15,
    fontWeight: '800',
  },
  latencyLabel: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 2,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
});
