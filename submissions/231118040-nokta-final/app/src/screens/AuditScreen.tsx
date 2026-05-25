import { useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Check, ClipboardCopy, Mic, Square } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDictation } from '../hooks/useDictation';
import { colors } from '../theme';

const targets = [
  { id: 'voice', label: 'Voice wave', screen: 'Mirror / Waveform' },
  { id: 'mouth', label: 'Lipsync', screen: 'Mirror / Avatar mouth' },
  { id: 'bridge', label: 'Bridge CTA', screen: 'Bridge / Expert call' },
];

export function AuditScreen({ stopMeter }: { stopMeter: () => Promise<void> }) {
  const [selected, setSelected] = useState(targets[0].id);
  const [copied, setCopied] = useState(false);
  const dictation = useDictation();

  async function beginDictation() {
    await stopMeter();
    setCopied(false);
    await dictation.start();
  }

  async function copyNote() {
    if (!dictation.transcript) {
      return;
    }
    await Clipboard.setStringAsync(dictation.transcript);
    setCopied(true);
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.surface}>
        <Text style={styles.label}>RAPOR HEDEFI</Text>
        <View style={styles.targets}>
          {targets.map((target) => {
            const active = selected === target.id;
            return (
              <Pressable
                key={target.id}
                onPress={() => setSelected(target.id)}
                style={[styles.target, active && styles.targetActive]}
              >
                <Text style={[styles.targetLabel, active && styles.targetLabelActive]}>{target.label}</Text>
                <Text style={styles.targetScreen}>{target.screen}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.surface}>
        <View style={styles.row}>
          <Text style={styles.label}>VOICE -&gt; STT -&gt; MARKDOWN NOTE</Text>
          <View style={[styles.liveDot, dictation.recognizing && styles.liveDotActive]} />
        </View>
        <View style={styles.transcript}>
          <Text style={dictation.transcript ? styles.note : styles.placeholder}>
            {dictation.transcript || 'Mikrofona bas ve kullanici geri bildirimini Turkce dikte et.'}
          </Text>
          {dictation.recognizing ? (
            <View style={[styles.level, { width: `${Math.max(8, dictation.volume * 100)}%` }]} />
          ) : null}
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => void (dictation.recognizing ? dictation.stop() : beginDictation())}
            style={[styles.primary, dictation.recognizing && styles.recording]}
          >
            {dictation.recognizing ? <Square color="#fff" size={16} /> : <Mic color="#fff" size={18} />}
            <Text style={styles.primaryText}>{dictation.recognizing ? 'Durdur' : 'Dikte Et'}</Text>
          </Pressable>
          <Pressable onPress={() => void copyNote()} style={styles.secondary}>
            {copied ? <Check color={colors.voice} size={18} /> : <ClipboardCopy color={colors.ink} size={18} />}
            <Text style={styles.secondaryText}>{copied ? 'Kopyalandi' : 'Notu Kopyala'}</Text>
          </Pressable>
        </View>
        {dictation.error ? <Text style={styles.error}>{dictation.error}</Text> : null}
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Burn-in export akisi</Text>
        <Text style={styles.instructionsText}>1. Notu sesle dikte et ve kopyala.</Text>
        <Text style={styles.instructionsText}>2. Sag alttaki audit dugmesine dokun, sari kutu ciz.</Text>
        <Text style={styles.instructionsText}>3. Not alanina yapistirip Markdown raporu disari aktar.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingBottom: 92,
    paddingHorizontal: 18,
  },
  surface: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  targets: {
    gap: 8,
    marginTop: 12,
  },
  target: {
    borderColor: colors.border,
    borderRadius: 7,
    borderWidth: 1,
    padding: 11,
  },
  targetActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  targetLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  targetLabelActive: {
    color: colors.accent,
  },
  targetScreen: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 3,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  liveDot: {
    backgroundColor: '#c4ccd7',
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  liveDotActive: {
    backgroundColor: colors.danger,
  },
  transcript: {
    backgroundColor: colors.canvas,
    borderRadius: 7,
    marginTop: 12,
    minHeight: 110,
    overflow: 'hidden',
    padding: 13,
  },
  note: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 21,
  },
  placeholder: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  level: {
    backgroundColor: colors.voice,
    bottom: 0,
    height: 3,
    left: 0,
    position: 'absolute',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  primary: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 7,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 48,
  },
  recording: {
    backgroundColor: colors.danger,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  secondary: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 7,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 48,
  },
  secondaryText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 10,
  },
  instructions: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 15,
  },
  instructionsTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 9,
  },
  instructionsText: {
    color: '#cfd7e2',
    fontSize: 12,
    lineHeight: 21,
  },
});
