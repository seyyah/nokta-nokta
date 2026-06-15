import React, { useState, useRef, useCallback } from 'react';
import {
  Modal,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  GestureResponderEvent,
  PanResponderGestureState,
  Alert,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AuditOverlay } from './AuditOverlay';
import { AuditNoteList } from './AuditNoteList';
import { AuditSelector } from './AuditSelector';
import type { AuditNoteBounds } from '../core/types';
import { NoteManager } from '../core/storage';
import { buildMarkdown } from '../export/markdown';
import { buildDocx } from '../export/docx';
import { parseMarkdown } from '../export/markdownImporter';
import type { AuditNote, AuditStorage } from '../core/types';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

export interface AuditWidgetDeps {
  captureScreen: () => Promise<string>;
  captureRef: (ref: React.RefObject<any>) => Promise<string>;
  writeFile: (filename: string, content: string) => Promise<string>;
  writeFileBinary: (filename: string, base64: string) => Promise<string>;
  readFile: () => Promise<string | null>;
  shareFile: (uri: string) => Promise<void>;
  storage: AuditStorage;
  currentScreen: string;
  reporterId?: string;
  BugIcon: React.ReactNode;
}

interface Props {
  deps: AuditWidgetDeps;
  appName?: string;
  initialPosition?: { bottom: number; right: number };
}

type WidgetMode = 'idle' | 'capturing' | 'selecting' | 'annotating' | 'list';

const BUTTON_SIZE = 52;
const DRAG_THRESHOLD = 6;
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export function AuditWidget({ deps, appName = 'App', initialPosition }: Props) {
  const [mode, setMode] = useState<WidgetMode>('idle');
  const [notes, setNotes] = useState<AuditNote[]>([]);
  const [capturedUri, setCapturedUri] = useState('');
  const [selectedBounds, setSelectedBounds] = useState<AuditNoteBounds | null>(null);
  const managerRef = useRef(new NoteManager(deps.storage));
  const manager = managerRef.current;

  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceNote, setVoiceNote] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for mic
  React.useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      console.log("MIC PERMISSION:", permission);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);

      setTimeout(async () => {
        try {
          const status = await recording.getStatusAsync();
          console.log("RECORD STATUS:", status);
        } catch(e){}
      }, 1000);

    } catch (err) {
      console.warn("Kayıt başlatma hatası:", err);
      Alert.alert('Hata', 'Mikrofon başlatılamadı');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    setIsTranscribing(true);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    const uri = recording.getURI();
    setRecording(null);

    if (uri) {
      try {
        console.log('STT için ses okunuyor...');
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
        console.log('STT Base64 hazır, sunucuya gönderiliyor...');
        const host = '192.168.1.101'; 
        const res = await fetch(`http://${host}:3000/transcribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             audioBase64: base64,
             mimeType: Platform.OS === 'ios' ? 'audio/m4a' : 'audio/mp4'
          })
        });
        
        console.log('Sunucu yanıt durumu:', res.status);
        if (res.ok) {
          const data = await res.json();
          const transcript = data.text;
          console.log('Çevrilen metin:', transcript);
          setVoiceNote(transcript);

          // 1. STT transcript gelince otomatik markdown raporunu oluştur
          const timestamp = Date.now();
          const filename = `audit-report-${timestamp}.md`;
          const dateStr = new Date(timestamp).toLocaleString('tr-TR');
          const markdown = `# Audit Raporu — ${dateStr}\n**Ekran:** ${deps.currentScreen}\n**Sorun:** ${transcript}\n**Severity:** Medium\n**Durum:** Açık`;

          await fetch(`http://${host}:3000/save-report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, content: markdown })
          });

          // 1.5 Vision Audit (SQLite) veritabanına ekle
          if (capturedUri) {
            await managerRef.current.add({
              screenName: deps.currentScreen,
              note: transcript,
              screenshot: capturedUri,
              highlightBounds: null,
              reporterId: deps.reporterId,
              timestamp: timestamp.toString()
            });
            const updatedNotes = await managerRef.current.getAll();
            setNotes(updatedNotes);
          }

          // 2. Aynı anda FORGE.md'ye yeni satır ekle
          const preview = transcript.length > 50 ? transcript.substring(0, 50) + '...' : transcript;
          const forgeLine = `| ${timestamp} | ${filename} | OPEN | ${preview.replace(/\n/g, ' ')} |`;
          await fetch(`http://${host}:3000/append-forge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: forgeLine })
          });

          // 4. UI'da mesajı göster
          Alert.alert('✅ Rapor oluştu', `${filename}\n🔄 FORGE cycle başlatıldı → agent düzeltiyor...`);

          // 3. Forge Local Server üzerinden [Otonom Düzelt] döngüsünü otomatik başlat
          fetch(`http://${host}:3000/repair`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ markdown })
          }).then(r => r.json()).then(repairRes => {
            if (repairRes.success) {
              Alert.alert('🎉 Onarım Tamamlandı', 'Agent kodu düzeltti!');
            }
          }).catch(e => console.warn('Agent onarım hatası', e));

        } else {
           const errText = await res.text();
           console.log('Sunucu hata detayı:', errText);
           Alert.alert('Hata', 'Çeviri başarısız oldu.');
        }
      } catch (e) {
        console.error('Fetch hatası:', e);
        Alert.alert('Hata', 'Sunucuya bağlanılamadı.');
      } finally {
        setIsTranscribing(false);
      }
    } else {
      setIsTranscribing(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleSaveVoiceReport = async () => {
    if (!voiceNote.trim()) {
      Alert.alert('Hata', 'Lütfen sesli veya yazılı bir rapor metni girin.');
      return;
    }
    
    const timestamp = new Date().getTime();
    const dateStr = new Date().toLocaleString('tr-TR');
    
    const mdContent = `# Audit Raporu — ${dateStr}
**Ekran:** AvatarVoiceScreen
**Sorun:** ${voiceNote.trim()}
**Severity:** Medium
**Durum:** Açık`;

    try {
      const filename = `audit-report-${timestamp}.md`;
      await deps.writeFile(filename, mdContent);
      
      // FORGE.md'ye yeni cycle satırı ekle
      const forgeLine = `| ${timestamp} | ${filename} | OPEN |`;
      const host = '192.168.1.101';
      await fetch(`http://${host}:3000/append-forge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: forgeLine })
      }).catch(e => console.warn('FORGE.md güncellenemedi', e));
      
      // Add as internal note as well
      await manager.add({
        screenName: deps.currentScreen,
        screenshot: '',
        screenshotAspect: 1,
        highlightBounds: null,
        note: `[Sesle Rapor]: ${voiceNote.trim()}`,
        reporterId: deps.reporterId,
      });
      await loadNotes();
      
      Alert.alert('✅ Rapor kaydedildi', `Dosya: ${filename}`);
      setVoiceNote('');
      setIsRecording(false);
      setShowVoiceModal(false);
    } catch (err: any) {
      Alert.alert('Hata', `Rapor kaydedilemedi: ${err.message}`);
    }
  };

  const initX = SCREEN_W - (initialPosition?.right ?? 16) - BUTTON_SIZE;
  const initY = SCREEN_H - (initialPosition?.bottom ?? 110) - BUTTON_SIZE;

  const pan = useRef(new Animated.ValueXY({ x: initX, y: initY })).current;
  const lastPos = useRef({ x: initX, y: initY });
  const isDragging = useRef(false);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingTaps = useRef(0);

  // Capture these so panResponder callbacks (created once) can call latest handlers
  const handleCaptureRef = useRef<() => void>(() => {});
  const handleOpenListRef = useRef<() => void>(() => {});

  const loadNotes = useCallback(async () => {
    setNotes(await manager.getAll());
  }, [manager]);

  const handleCapture = useCallback(async () => {
    setMode('capturing');
    try {
      const uri = await deps.captureScreen();
      setCapturedUri(uri);
      setSelectedBounds(null);
      setMode('selecting');
    } catch (e) {
      console.warn('[AuditWidget] captureScreen failed:', e);
      setMode('idle');
    }
  }, [deps]);

  const handleOpenList = useCallback(async () => {
    await loadNotes();
    setMode('list');
  }, [loadNotes]);

  // Keep refs up to date so panResponder can call them
  handleCaptureRef.current = handleCapture;
  handleOpenListRef.current = handleOpenList;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_: GestureResponderEvent, gs: PanResponderGestureState) =>
        Math.abs(gs.dx) > DRAG_THRESHOLD || Math.abs(gs.dy) > DRAG_THRESHOLD,

      onPanResponderGrant: (_: GestureResponderEvent, __: PanResponderGestureState) => {
        isDragging.current = false;
        pan.setOffset({ x: lastPos.current.x, y: lastPos.current.y });
        pan.setValue({ x: 0, y: 0 });
      },

      onPanResponderMove: (_: GestureResponderEvent, gs: PanResponderGestureState) => {
        if (Math.abs(gs.dx) > DRAG_THRESHOLD || Math.abs(gs.dy) > DRAG_THRESHOLD) {
          isDragging.current = true;
        }
        Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false })(_, gs);
      },

      onPanResponderRelease: (_: GestureResponderEvent, gs: PanResponderGestureState) => {
        pan.flattenOffset();
        const rawX = lastPos.current.x + gs.dx;
        const rawY = lastPos.current.y + gs.dy;
        const clampedX = Math.max(0, Math.min(SCREEN_W - BUTTON_SIZE, rawX));
        const clampedY = Math.max(0, Math.min(SCREEN_H - BUTTON_SIZE, rawY));
        pan.setValue({ x: clampedX, y: clampedY });
        lastPos.current = { x: clampedX, y: clampedY };

        if (!isDragging.current) {
          pendingTaps.current += 1;
          if (tapTimer.current) clearTimeout(tapTimer.current);
          tapTimer.current = setTimeout(() => {
            const taps = pendingTaps.current;
            pendingTaps.current = 0;
            if (taps >= 2) {
              handleOpenListRef.current();
            } else {
              handleCaptureRef.current();
            }
          }, 280);
        }
      },
    })
  ).current;

  const handleSelectionConfirm = (bounds: AuditNoteBounds, annotatedUri: string) => {
    setSelectedBounds(bounds);
    setCapturedUri(annotatedUri); // replace plain screenshot with annotated version
    setMode('annotating');
  };

  const handleSaveNote = async (noteText: string) => {
    const { height: SH, width: SW } = Dimensions.get('screen');
    await manager.add({
      screenName: deps.currentScreen,
      screenshot: capturedUri,
      screenshotAspect: SH / SW,
      highlightBounds: selectedBounds,
      note: noteText,
      reporterId: deps.reporterId,
    });
    await loadNotes();
    setMode('idle');
    setCapturedUri('');
  };

  const handleEditNote = async (id: string, newNote: string) => {
    await manager.update(id, { note: newNote });
    await loadNotes();
  };

  const handleDelete = async (id: string) => {
    await manager.remove(id);
    await loadNotes();
  };

  const stamp = () => new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');

  const handleExportMd = async () => {
    const all = deps.storage.getAllWithBase64 
      ? await deps.storage.getAllWithBase64() 
      : await manager.getAll();
    const md = buildMarkdown(all, { appName, exportedAt: new Date().toISOString(), totalNotes: all.length });
    const fileUri = await deps.writeFile(`bug-report-${stamp()}.md`, md);
    await deps.shareFile(fileUri);
  };

  const handleExportDocx = async () => {
    const all = deps.storage.getAllWithBase64 
      ? await deps.storage.getAllWithBase64() 
      : await manager.getAll();
    const base64 = await buildDocx(all, { appName, exportedAt: new Date().toISOString(), totalNotes: all.length });
    const fileUri = await deps.writeFileBinary(`bug-report-${stamp()}.docx`, base64);
    await deps.shareFile(fileUri);
  };

  const handleImportMd = async () => {
    try {
      const md = await deps.readFile();
      if (!md) return;

      const importedNotes = parseMarkdown(md);
      if (importedNotes.length === 0) {
        Alert.alert('Hata', 'Markdown dosyasında geçerli bir bug raporu bulunamadı.');
        return;
      }

      for (const note of importedNotes) {
        await manager.add(note);
      }
      
      await loadNotes();
      Alert.alert('Başarılı', `${importedNotes.length} adet bug notu başarıyla içe aktarıldı.`);
    } catch (e) {
      console.error('[AuditWidget] Import failed:', e);
      Alert.alert('Hata', 'Dosya okuma veya ayrıştırma sırasında bir hata oluştu.');
    }
  };

  const handleAutoFix = async () => {
    // We intentionally don't use base64 here so we don't blow up the LLM context window!
    const all = await manager.getAll();
    const md = buildMarkdown(all, { appName, exportedAt: new Date().toISOString(), totalNotes: all.length });
    
    try {
      Alert.alert("Otonom Onarım Başladı", "Lokal sunucuya istek gönderildi. Lütfen bekleyin...");
      // Fiziksel telefonun bilgisayara bağlanabilmesi için lokal IP adresinizi kullanıyoruz:
      const host = '192.168.1.101'; 
      const res = await fetch(`http://${host}:3000/repair`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: md })
      });
      if (res.ok) {
        Alert.alert("Başarılı", "Onarım uygulandı! Fast Refresh ekranı yenileyecek.");
        setMode('idle');
      } else {
        Alert.alert("Hata", "Sunucu hata döndürdü.");
      }
    } catch (e) {
      Alert.alert("Bağlantı Hatası", "Lokal sunucu (localhost:3000) çalışmıyor olabilir.");
    }
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {mode === 'idle' && (
        <>
          <Animated.View
            style={[{ position: 'absolute', zIndex: 9999, left: pan.x, top: pan.y }]}
            {...panResponder.panHandlers}
          >
            {deps.BugIcon}
          </Animated.View>
          <TouchableOpacity
            style={styles.voiceFAB}
            onPress={async () => {
              try {
                // Ekran görüntüsünü al ki Vision Audit (Before/After) bölümünde kullanılabilsin
                const uri = await deps.captureScreen();
                setCapturedUri(uri);
              } catch (e) {
                console.warn('Vision capture failed:', e);
              }
              setShowVoiceModal(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 16 }}>🎤</Text>
            <Text style={styles.voiceFABText}>Sesle Rapor</Text>
          </TouchableOpacity>
        </>
      )}

      {mode === 'selecting' && (
        <AuditSelector
          screenshotUri={capturedUri}
          captureRef={deps.captureRef}
          onConfirm={handleSelectionConfirm}
          onCancel={() => { setMode('idle'); setCapturedUri(''); }}
        />
      )}

      <AuditOverlay
        visible={mode === 'annotating'}
        screenshotUri={capturedUri}
        selectedBounds={selectedBounds}
        screenName={deps.currentScreen}
        reporterId={deps.reporterId}
        onSave={handleSaveNote}
        onCancel={() => { setMode('idle'); setCapturedUri(''); }}
      />

      <Modal visible={mode === 'list'} animationType="slide" presentationStyle="pageSheet">
        <AuditNoteList
          notes={notes}
          onEdit={handleEditNote}
          onDelete={handleDelete}
          onExportMd={handleExportMd}
          onImportMd={handleImportMd}
          onExportDocx={handleExportDocx}
          onAutoFix={handleAutoFix}
          onClose={() => setMode('idle')}
        />
      </Modal>

      {/* Voice dictation modal (Phase B/C) */}
      <Modal visible={showVoiceModal} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.voiceBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.voiceSheet}>
            <View style={styles.handle} />
            <Text style={styles.voiceTitle}>🎤 Sesli Rapor Dikte Et</Text>
            <Text style={styles.voiceMeta}>
              Ekran: <Text style={styles.voiceMetaValue}>{deps.currentScreen}</Text>
            </Text>

            <TextInput
              style={styles.voiceInput}
              multiline
              placeholder="Sesiniz buraya metin olarak dökülecektir..."
              placeholderTextColor="#999"
              value={voiceNote}
              onChangeText={setVoiceNote}
              keyboardType="default"
            />
            
            <View style={{ alignItems: 'center', marginTop: 16 }}>
              <TouchableOpacity onPress={toggleRecording} disabled={isTranscribing} activeOpacity={0.7}>
                <Animated.View style={[
                  styles.bigMicBtn, 
                  isRecording && styles.bigMicActive,
                  isTranscribing && { backgroundColor: '#f0ad4e' },
                  { transform: [{ scale: pulseAnim }] }
                ]}>
                  <Text style={styles.bigMicIcon}>{isTranscribing ? '⏳' : '🎤'}</Text>
                </Animated.View>
              </TouchableOpacity>
              <Text style={{ marginTop: 8, color: '#666', fontSize: 13 }}>
                {isTranscribing ? 'Çeviriliyor...' : isRecording ? 'Dinleniyor... (Durdurmak için tıkla)' : 'Başlamak için dokun'}
              </Text>
            </View>

            <View style={styles.voiceActions}>
              <TouchableOpacity
                style={styles.voiceCancelBtn}
                onPress={() => { setVoiceNote(''); setIsRecording(false); setShowVoiceModal(false); }}
              >
                <Text style={styles.voiceCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.voiceSaveBtn}
                onPress={handleSaveVoiceReport}
              >
                <Text style={styles.voiceSaveText}>✅ Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  voiceFAB: {
    position: 'absolute',
    bottom: 170,
    right: 20,
    backgroundColor: '#3b5bfc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 9999,
  },
  voiceFABText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 13,
  },
  voiceBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  voiceSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  voiceTitle: {
    color: '#111',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  voiceMeta: {
    color: '#666',
    fontSize: 13,
    marginBottom: 14,
  },
  voiceMetaValue: {
    color: '#3b5bfc',
    fontWeight: '600',
  },
  voiceInput: {
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 12,
    color: '#111',
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  dictationHint: {
    color: '#e53e3e',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  bigMicBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  bigMicActive: {
    backgroundColor: '#e53e3e',
  },
  bigMicIcon: {
    fontSize: 40,
  },
  voiceActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  voiceCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  voiceCancelText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  voiceSaveBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#3b5bfc',
    alignItems: 'center',
  },
  voiceSaveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
