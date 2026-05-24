import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import { analyzeNotes, IdeaCard } from '../services/claudeApi';
import { RootStackParamList } from '../App';
import { MascotEmotion } from '../components/NoktaMascot';
import AvatarMascot from '../components/AvatarMascot';
import VoiceBars from '../components/VoiceBars';
import { useMicAudio } from '../hooks/useMicAudio';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const PLACEHOLDER = `--- English ---
John: don't forget to bring chapter 3 notes tomorrow
Ali: exam hint: question 4 is definitely about osmosis
Someone: [forwarded] 10 last-minute study tips - re-read, make short notes

--- Malay ---
Kak Mia: jangan lupa bawak notes chapter 3 esok
John: ada resepi kek batik? letak 3 sudu gula perang
Ali: soalan 4 confirm keluar pasal osmosis

--- Türkçe ---
Ayşe: yarın 3. bölüm notlarını unutmayın
Mehmet: osmoz konusu sınava kesin çıkacak
Ali: [iletildi] son dakika çalışma ipuçları`;

export default function DumpScreen({ navigation }: Props) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [mascotEmotion, setMascotEmotion] = useState<MascotEmotion>('idle');
  const { isRecording, audioLevel, transcribedText, startRecording, stopRecording } = useMicAudio();

  useEffect(() => {
    if (transcribedText && !transcribedText.startsWith('🎙️')) {
      setText(prev => prev ? prev + '\n' + transcribedText : transcribedText);
    }
  }, [transcribedText]);

  async function handlePasteClipboard() {
    const content = await Clipboard.getStringAsync();
    if (!content.trim()) {
      Alert.alert('Clipboard empty', 'Nothing found on the clipboard.');
      return;
    }
    setText(prev => prev ? prev + '\n' + content : content);
  }

  async function handleAnalyze() {
    if (!text.trim()) {
      Alert.alert('Empty!', 'Paste some messages first.');
      return;
    }
    setLoading(true);
    setMascotEmotion('thinking');
    try {
      const cards: IdeaCard[] = await analyzeNotes(text);
      setMascotEmotion('done');
      setTimeout(() => navigation.navigate('Review', { cards }), 800);
    } catch (e: any) {
      setMascotEmotion('error');
      Alert.alert('Error', e.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.appName}>NoteMigrator</Text>
        <Text style={styles.appVersion}>AI</Text>
      </View>

      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>📋 Paste Your Chat Dump</Text>
        <Text style={styles.sub}>
          WhatsApp, Telegram, any group chat — paste the chaos below.{'\n'}
          Works in{' '}
          <Text style={styles.langTag}>English</Text>
          {', '}
          <Text style={styles.langTag}>Malay</Text>
          {' & '}
          <Text style={styles.langTag}>Türkçe</Text>
          {' (or mixed).'}
        </Text>

        <AvatarMascot
          audioLevel={audioLevel}
          isRecording={isRecording}
          emotion={mascotEmotion}
        />
        <VoiceBars audioLevel={audioLevel} isRecording={isRecording} />

        <View style={styles.inputControls}>
          <TouchableOpacity style={styles.clipboardBtn} onPress={handlePasteClipboard}>
            <Text style={styles.clipboardBtnText}>📋 Paste from Clipboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.micBtn, isRecording && styles.micBtnActive]}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={loading}
          >
            <Text style={styles.micBtnText}>
              {isRecording ? '⏹ Stop' : '🎙️ Speak'}
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          multiline
          placeholder={PLACEHOLDER}
          placeholderTextColor="#555"
          value={text}
          onChangeText={setText}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleAnalyze}
          disabled={loading}
        >
          <Text style={styles.btnText}>
            {loading ? 'Analyzing…' : '✨ Analyze & Extract Ideas'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f14' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 52 : 44,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
    backgroundColor: '#0f0f14',
  },
  appName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  appVersion: {
    color: '#6c47ff',
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: '#1e1530',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  inner: { padding: 20, paddingBottom: 40 },
  heading: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  sub: { color: '#888', fontSize: 13, marginBottom: 16, lineHeight: 20 },
  langTag: { color: '#6c47ff', fontWeight: '600' },

  inputControls: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  clipboardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2a2a38',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clipboardBtnText: {
    color: '#6c47ff',
    fontSize: 13,
    fontWeight: '600',
  },
  micBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  micBtnActive: {
    backgroundColor: '#0f1e3a',
    borderColor: '#ef4444',
  },
  micBtnText: {
    color: '#3B82F6',
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1a1a24',
    color: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    fontSize: 13,
    minHeight: 260,
    borderWidth: 1,
    borderColor: '#2a2a38',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  btn: {
    backgroundColor: '#6c47ff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
