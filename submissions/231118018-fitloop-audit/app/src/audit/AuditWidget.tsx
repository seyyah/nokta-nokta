import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';

import { colors } from '../theme/colors';
import AvatarScene from '../avatar/AvatarScene';
import VoiceVisualizer from '../audio/VoiceVisualizer';
import ExpertCallModal from '../webrtc/ExpertCallModal';

type AuditWidgetProps = {
  children: React.ReactNode;
  deps: AuditWidgetDeps;
  screenName: string;
};

export type AuditWidgetDeps = {
  copyFile: (from: string, to: string) => Promise<void>;
  ensureDirectory: (path: string) => Promise<void>;
  getReportsDirectory: () => string;
  captureView: (target: React.RefObject<View | null>) => Promise<string>;
  writeText: (path: string, content: string) => Promise<void>;
};

function formatStamp(date: Date) {
  return date.toISOString().replace(/[:.]/g, '-');
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, '\\|').trim();
}

function AuditIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 5h6l1.4 2H20a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h3.6L9 5Z"
        stroke="#07130f"
        strokeLinejoin="round"
        strokeWidth={2}
      />
      <Path d="M12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="#07130f" strokeWidth={2} />
    </Svg>
  );
}

function MicIcon({ isRecording }: { isRecording: boolean }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" fill={isRecording ? "#EF4444" : "transparent"} stroke={isRecording ? "#EF4444" : "#94A3B8"} strokeWidth={2} />
      <Path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke={isRecording ? "#EF4444" : "#94A3B8"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 19v4M8 23h8" stroke={isRecording ? "#EF4444" : "#94A3B8"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function AuditWidget({ children, deps, screenName }: AuditWidgetProps) {
  const captureTargetRef = useRef<View>(null);
  const burnInTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [isPromptOpen, setPromptOpen] = useState(false);
  const [isBurnInVisible, setBurnInVisible] = useState(false);
  const [note, setNote] = useState('');
  const [isSaving, setSaving] = useState(false);
  
  // Phase 3 States
  const [isDictating, setIsDictating] = useState(false);
  const [isExpertCallVisible, setExpertCallVisible] = useState(false);

  useEffect(() => {
    // Voice STT Setup (Sadece Mobil)
    if (Platform.OS !== 'web') {
      Voice.onSpeechResults = (e: SpeechResultsEvent) => {
        if (e.value && e.value.length > 0) {
          setNote((prev) => (prev ? prev + ' ' + e.value![0] : e.value![0]));
        }
      };
      Voice.onSpeechError = (e: SpeechErrorEvent) => {
        console.warn('Voice recognition error:', e.error);
        setIsDictating(false);
      };
      Voice.onSpeechEnd = () => {
        setIsDictating(false);
      };
    }

    return () => {
      if (burnInTimerRef.current) clearTimeout(burnInTimerRef.current);
      if (Platform.OS !== 'web') {
        Voice.destroy().then(Voice.removeAllListeners);
      }
    };
  }, []);

  // Heuristic STUCK Detection Logic
  useEffect(() => {
    if (!isPromptOpen) return;

    // 1. Keyword-based heuristic
    const stuckKeywords = ['hata', 'çalışmıyor', 'bulamadım', 'yapamadım', 'bozuk', 'stuck', 'error', 'yardım', 'olmuyor', 'açılmıyor'];
    const lowerNote = note.toLowerCase();
    const hasStuckKeyword = stuckKeywords.some(kw => lowerNote.includes(kw));

    if (hasStuckKeyword && !isExpertCallVisible) {
      Alert.alert(
        'Sorun Tespit Edildi',
        'Yazdığınız nota göre bir problem yaşadığınızı tespit ettim. Otomatik olarak Uzmana bağlanıyorsunuz.',
        [
          { text: 'Bağlan', onPress: () => setExpertCallVisible(true) },
          { text: 'İptal', style: 'cancel' }
        ]
      );
    }

    // 2. Time-based heuristic (60 seconds idle)
    const stuckTimer = setTimeout(() => {
      if (!isExpertCallVisible) {
        Alert.alert(
          'Yardıma İhtiyacınız Var Mı?',
          'Uzun süredir işlem yapmadığınızı fark ettim. Uzman desteği almak ister misiniz?',
          [
            { text: 'Evet, Bağlan', onPress: () => setExpertCallVisible(true) },
            { text: 'Hayır', style: 'cancel' }
          ]
        );
      }
    }, 60000);

    return () => clearTimeout(stuckTimer);
  }, [note, isPromptOpen, isExpertCallVisible]);

  const toggleDictation = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Hata', 'Sesli dikte özelliği sadece mobil cihazlarda çalışır. Web üzerinde klavye ile yazabilirsiniz.');
      return;
    }
    
    try {
      if (isDictating) {
        await Voice.stop();
        setIsDictating(false);
      } else {
        await Voice.start('tr-TR');
        setIsDictating(true);
      }
    } catch (e) {
      console.error(e);
      setIsDictating(false);
    }
  };

  const openPrompt = useCallback(() => {
    setNote('');
    setIsDictating(false);
    setPromptOpen(true);
  }, []);

  const saveAuditReport = useCallback(async () => {
    if (!captureTargetRef.current || isSaving) return;

    setSaving(true);
    if (isDictating) {
      await Voice.stop();
      setIsDictating(false);
    }
    
    try {
      const reportsDirectory = deps.getReportsDirectory();
      await deps.ensureDirectory(reportsDirectory);
      const now = new Date();
      const stamp = formatStamp(now);
      setBurnInVisible(true);
      await new Promise((resolve) => setTimeout(resolve, 120));
      const screenshotUri = await deps.captureView(captureTargetRef);
      if (burnInTimerRef.current) {
        clearTimeout(burnInTimerRef.current);
      }
      burnInTimerRef.current = setTimeout(() => setBurnInVisible(false), 500);
      const screenshotName = `audit-${stamp}.png`;
      const screenshotPath = `${reportsDirectory}${screenshotName}`;
      await deps.copyFile(screenshotUri, screenshotPath);

      const reportName = `audit-${stamp}.md`;
      const reportPath = `${reportsDirectory}${reportName}`;
      const reportBody = [
        `# Audit ${stamp}`,
        '',
        `- Screen: ${escapeMarkdown(screenName) || 'Unknown'}`,
        `- Created: ${now.toISOString()}`,
        `- Screenshot: ./${screenshotName}`,
        '',
        '## Note',
        '',
        note.trim() || '_No note provided._',
        '',
      ].join('\n');

      await deps.writeText(reportPath, reportBody);
      setPromptOpen(false);
      Alert.alert('Audit saved', `Report written to audit-reports/${reportName}`);
    } catch (error) {
      setBurnInVisible(false);
      const message = error instanceof Error ? error.message : 'Unknown save error';
      Alert.alert('Audit failed', message);
    } finally {
      setSaving(false);
    }
  }, [deps, isSaving, note, screenName, isDictating]);

  return (
    <View style={styles.root}>
      <View ref={captureTargetRef} collapsable={false} style={styles.captureRoot}>
        {children}
        {isBurnInVisible ? <View pointerEvents="none" style={styles.yellowBox} /> : null}
      </View>

      <Pressable
        accessibilityLabel="Create audit report"
        accessibilityRole="button"
        onPress={openPrompt}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <AuditIcon />
      </Pressable>

      <Modal transparent animationType="slide" onRequestClose={() => setPromptOpen(false)} visible={isPromptOpen}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.prompt}>
              
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.promptTitle}>Audit & Forge (Phase 3)</Text>
                  <Text style={styles.promptScreen}>{screenName}</Text>
                </View>
                <Pressable onPress={() => setExpertCallVisible(true)} style={styles.expertBtn}>
                  <Text style={styles.expertText}>Uzmana Bağlan</Text>
                </Pressable>
              </View>

              {/* Avatar ve Ses Görselleştirici Bölümü */}
              <View style={styles.avatarContainer}>
                <AvatarScene isSpeaking={isDictating} />
              </View>
              <View style={styles.visualizerContainer}>
                <VoiceVisualizer isActive={isDictating} color={colors.primary} />
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  multiline
                  onChangeText={setNote}
                  placeholder="Raporu dikte edebilir veya yazabilirsiniz..."
                  placeholderTextColor="#64748B"
                  style={styles.input}
                  value={note}
                />
                <Pressable onPress={toggleDictation} style={[styles.micButton, isDictating && styles.micButtonActive]}>
                  <MicIcon isRecording={isDictating} />
                </Pressable>
              </View>

              <View style={styles.actions}>
                <Pressable disabled={isSaving} onPress={() => { setPromptOpen(false); if (isDictating && Platform.OS !== 'web') { Voice.stop(); setIsDictating(false); } }} style={styles.secondaryButton}>
                  <Text style={styles.secondaryText}>İptal</Text>
                </Pressable>
                <Pressable disabled={isSaving} onPress={saveAuditReport} style={styles.primaryButton}>
                  {isSaving ? <ActivityIndicator color="#07130f" /> : <Text style={styles.primaryText}>Kaydet</Text>}
                </Pressable>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <ExpertCallModal 
        visible={isExpertCallVisible} 
        onClose={() => setExpertCallVisible(false)} 
        onCallEnded={async (summary) => {
          // Uzman çağrısı bitince özeti BRIDGE.md'ye kaydet
          try {
            const bridgePath = `${deps.getReportsDirectory()}BRIDGE.md`;
            const content = `\n## Uzman Görüşmesi - ${new Date().toISOString()}\n\n${summary}\n`;
            
            const fs = require('expo-file-system/legacy');
            const info = await fs.getInfoAsync(bridgePath);
            if (info.exists) {
              const existing = await fs.readAsStringAsync(bridgePath);
              await deps.writeText(bridgePath, existing + content);
            } else {
              await deps.writeText(bridgePath, `# Expert Bridge (Track 1)\n\n${content}`);
            }
            Alert.alert('Bilgi', 'Uzman görüşmesi BRIDGE.md dosyasına kaydedildi.');
          } catch(e) {
            console.error(e);
          }
        }} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  captureRoot: { flex: 1 },
  yellowBox: {
    position: 'absolute', top: 72, right: 18, bottom: 88, left: 18,
    borderWidth: 5, borderColor: '#FFD60A', borderRadius: 8,
    backgroundColor: 'rgba(255, 214, 10, 0.08)', zIndex: 15,
  },
  fab: {
    position: 'absolute', right: 18, bottom: 94, width: 56, height: 56,
    alignItems: 'center', justifyContent: 'center', borderRadius: 28,
    backgroundColor: colors.primary, elevation: 8,
    shadowColor: '#000000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28, shadowRadius: 12, zIndex: 20,
  },
  fabPressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  modalOverlay: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 16, backgroundColor: 'rgba(3, 8, 7, 0.85)',
  },
  prompt: {
    width: '100%', maxWidth: 420, padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: '#334155', backgroundColor: '#0F172A',
  },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 12,
  },
  promptTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  promptScreen: { marginTop: 4, color: '#94A3B8', fontSize: 13 },
  expertBtn: {
    backgroundColor: '#EF4444', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6,
  },
  expertText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  avatarContainer: {
    height: 180, width: '100%', borderRadius: 12, overflow: 'hidden', marginBottom: 8,
    backgroundColor: '#1E293B'
  },
  visualizerContainer: {
    height: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  inputWrapper: { position: 'relative' },
  input: {
    minHeight: 100, padding: 12, paddingRight: 48, borderRadius: 12,
    borderWidth: 1, borderColor: '#334155', color: '#F8FAFC',
    backgroundColor: '#1E293B', textAlignVertical: 'top',
  },
  micButton: {
    position: 'absolute', right: 8, bottom: 8, padding: 10,
    backgroundColor: '#334155', borderRadius: 24, zIndex: 10, elevation: 5,
  },
  micButtonActive: {
    backgroundColor: '#451A1A',
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 14 },
  secondaryButton: {
    minWidth: 88, height: 44, alignItems: 'center', justifyContent: 'center',
    borderRadius: 8, borderWidth: 1, borderColor: '#475569',
  },
  secondaryText: { color: '#F8FAFC', fontWeight: '700' },
  primaryButton: {
    minWidth: 88, height: 44, alignItems: 'center', justifyContent: 'center',
    borderRadius: 8, backgroundColor: colors.primary,
  },
  primaryText: { color: '#07130f', fontWeight: '800' },
});
