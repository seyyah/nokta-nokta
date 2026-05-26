import { useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Check, ClipboardCopy, PencilLine } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme';

const targets = [
  { id: 'voice', label: 'Voice wave', screen: 'Mirror / Waveform' },
  { id: 'mouth', label: 'Lipsync', screen: 'Mirror / Avatar mouth' },
  { id: 'bridge', label: 'Bridge CTA', screen: 'Bridge / Expert call' },
];

export function AuditScreen() {
  const [selected, setSelected] = useState(targets[0].id);
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);

  async function copyNote() {
    if (!note.trim()) {
      return;
    }
    await Clipboard.setStringAsync(note.trim());
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
          <Text style={styles.label}>AUDIT MARKDOWN NOTU</Text>
          <PencilLine color={colors.accent} size={16} />
        </View>
        <TextInput
          multiline
          onChangeText={(value) => {
            setNote(value);
            setCopied(false);
          }}
          placeholder="Gordugun sorunu veya istegi yaz. Ornek: Ses varken avatar agzi gec tepki veriyor."
          placeholderTextColor={colors.muted}
          style={styles.transcript}
          textAlignVertical="top"
          value={note}
        />

        <View style={styles.actions}>
          <Pressable onPress={() => void copyNote()} style={styles.secondary}>
            {copied ? <Check color={colors.voice} size={18} /> : <ClipboardCopy color={colors.ink} size={18} />}
            <Text style={styles.secondaryText}>{copied ? 'Kopyalandi' : 'Notu Kopyala'}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Burn-in export akisi</Text>
        <Text style={styles.instructionsText}>1. Test notunu yaz ve kopyala.</Text>
        <Text style={styles.instructionsText}>2. Sag alttaki audit dugmesine dokun, sari kutu ciz.</Text>
        <Text style={styles.instructionsText}>3. Not alanina yapistirip Markdown raporu disari aktar.</Text>
        <Text style={styles.compatibility}>Expo Go uyumlulugu icin audit notu manuel girilir.</Text>
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
  transcript: {
    backgroundColor: colors.canvas,
    borderColor: colors.border,
    borderRadius: 7,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
    minHeight: 110,
    padding: 13,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
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
  compatibility: {
    color: colors.voice,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 9,
  },
});
