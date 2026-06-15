import { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AvatarStage } from '@/src/components/avatar-stage';
import { VoiceBars } from '@/src/components/voice-bars';
import { useMicrophoneLevel } from '@/src/hooks/use-microphone-level';

type Persona = 'junior' | 'senior';

const PERSONA_COPY: Record<Persona, string> = {
  junior: 'Junior-sen: hizli, net, enerjik; audit raporunu aksiyon listesine cevirir.',
  senior: 'Senior-sen: yavas, sakin, supheci; rollback riskini once sorar.',
};

export default function AvatarScreen() {
  const [persona, setPersona] = useState<Persona>('junior');
  const { error, isListening, level, start, stop } = useMicrophoneLevel();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Phase B</Text>
          <Text style={styles.title}>Senin avatarin</Text>
          <Text style={styles.subtitle}>
            Avaturn GLB modeli react-three-fiber sahnesinde yuklenir; mikrofon RMS seviyesi
            viseme/mouth morph targetlarini surer.
          </Text>
        </View>

        <AvatarStage level={level} persona={persona} speaking={isListening} />

        <View style={styles.personaRow}>
          <TouchableOpacity
            style={[styles.personaButton, persona === 'junior' && styles.personaActive]}
            onPress={() => setPersona('junior')}>
            <Text style={[styles.personaText, persona === 'junior' && styles.personaTextActive]}>
              Junior-sen
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.personaButton, persona === 'senior' && styles.personaActive]}
            onPress={() => setPersona('senior')}>
            <Text style={[styles.personaText, persona === 'senior' && styles.personaTextActive]}>
              Senior-sen
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.personaCopy}>{PERSONA_COPY[persona]}</Text>

        <View style={styles.miniWave}>
          <VoiceBars level={level} mode="wave" />
        </View>

        <TouchableOpacity
          style={[styles.micButton, isListening && styles.micButtonStop]}
          onPress={isListening ? stop : start}>
          <Text style={styles.micText}>{isListening ? 'Lipsync durdur' : 'Mikrofonla konustur'}</Text>
        </TouchableOpacity>

        {error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#10131b',
    flex: 1,
  },
  content: {
    gap: 16,
    padding: 20,
    paddingBottom: 50,
  },
  header: {
    gap: 8,
  },
  eyebrow: {
    color: '#f5f0a6',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#f7fafc',
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: '#aab4c2',
    fontSize: 15,
    lineHeight: 22,
  },
  personaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  personaButton: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
  },
  personaActive: {
    backgroundColor: '#f5f0a6',
    borderColor: '#f5f0a6',
  },
  personaText: {
    color: '#f7fafc',
    fontWeight: '800',
  },
  personaTextActive: {
    color: '#10131b',
  },
  personaCopy: {
    color: '#d8dee9',
    fontSize: 14,
    lineHeight: 20,
  },
  miniWave: {
    height: 86,
    overflow: 'hidden',
  },
  micButton: {
    alignItems: 'center',
    backgroundColor: '#58f0d5',
    borderRadius: 8,
    paddingVertical: 14,
  },
  micButtonStop: {
    backgroundColor: '#ff776d',
  },
  micText: {
    color: '#10131b',
    fontSize: 16,
    fontWeight: '800',
  },
  error: {
    color: '#ffb0aa',
  },
});
