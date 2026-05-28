import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Image,
  Dimensions,
} from 'react-native';
import type { AuditNoteBounds } from '../core/types';

let ExpoSpeechRecognitionModule: any = null;
try {
  ExpoSpeechRecognitionModule = require('expo-speech-recognition').ExpoSpeechRecognitionModule;
} catch (e) {
  console.warn('expo-speech-recognition is not natively available in this environment:', e);
}

interface Props {
  visible: boolean;
  screenshotUri: string;
  selectedBounds: AuditNoteBounds | null;
  screenName: string;
  reporterId?: string;
  onSave: (note: string) => Promise<void>;
  onCancel: () => void;
}

const SHEET_PADDING = 24;
const PREVIEW_W = Dimensions.get('window').width - SHEET_PADDING * 2;
const PREVIEW_H = 140; // sabit küçük yükseklik, contain ile oran korunur

export function AuditOverlay({
  visible,
  screenshotUri,
  selectedBounds,
  screenName,
  reporterId,
  onSave,
  onCancel,
}: Props) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const isAvailable = typeof ExpoSpeechRecognitionModule !== 'undefined' &&
                        ExpoSpeechRecognitionModule !== null &&
                        typeof ExpoSpeechRecognitionModule.addListener === 'function';

    if (!isAvailable) return;

    const startSub = ExpoSpeechRecognitionModule.addListener('start', () => setIsListening(true));
    const endSub = ExpoSpeechRecognitionModule.addListener('end', () => setIsListening(false));
    const resultSub = ExpoSpeechRecognitionModule.addListener('result', (event: any) => {
      const text = event.results[0]?.transcript || '';
      setNote(text);
    });
    const errorSub = ExpoSpeechRecognitionModule.addListener('error', (event: any) => {
      console.warn('STT Error in Audit:', event.message);
      setIsListening(false);
    });

    return () => {
      startSub.remove();
      endSub.remove();
      resultSub.remove();
      errorSub.remove();
    };
  }, []);

  const toggleVoiceInput = async () => {
    const isAvailable = typeof ExpoSpeechRecognitionModule !== 'undefined' &&
                        ExpoSpeechRecognitionModule !== null &&
                        typeof ExpoSpeechRecognitionModule.start === 'function';

    if (isListening) {
      try {
        if (isAvailable) {
          ExpoSpeechRecognitionModule.stop();
        }
        setIsListening(false);
      } catch (e) {
        console.warn(e);
      }
    } else {
      if (isAvailable) {
        const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (result.granted) {
          ExpoSpeechRecognitionModule.start({ lang: 'tr-TR' });
        } else {
          Alert.alert('İzin reddedildi', 'Sesinizi yazıya çevirmek için mikrofon izni vermelisiniz.');
        }
      } else {
        // Fallback simulation for Expo Go
        setIsListening(true);
        setTimeout(() => {
          const mockNotes = [
            "Yeni hikaye ekleme butonunu mor gradyan yaparak ortalayın.",
            "Silme butonuna basıldığında onay isteyen bir Alert pop-up ekleyin.",
            "Kaydet butonuna tıklandığında başarıyla kaydedildi uyarısı gösterin."
          ];
          const mockNote = mockNotes[Math.floor(Math.random() * mockNotes.length)];
          setNote(mockNote);
          setIsListening(false);
        }, 2500);
      }
    }
  };

  const handleSave = async () => {
    if (isListening) {
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch (e) {}
    }
    if (!note.trim()) {
      Alert.alert('Not boş', 'Lütfen bir açıklama girin.');
      return;
    }
    setSaving(true);
    try {
      await onSave(note.trim());
      setNote('');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isListening) {
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch (e) {}
    }
    setNote('');
    onCancel();
  };

  const screenW = Dimensions.get('screen').width;
  const screenH = Dimensions.get('screen').height;
  // Aspect ratio'yu koruyarak PREVIEW_W'ye sığdır, max 160px
  const naturalH = PREVIEW_W * (screenH / screenW);
  const renderedW = naturalH > 160 ? Math.round(160 * (screenW / screenH)) : PREVIEW_W;
  const renderedH = Math.min(naturalH, 160);
  const scaleX = renderedW / screenW;
  const scaleY = renderedH / screenH;

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.title}>Bug Raporu</Text>
          <Text style={styles.meta}>
            Ekran: <Text style={styles.metaValue}>{screenName}</Text>
          </Text>
          {reporterId && (
            <Text style={styles.meta}>
              Raporlayan: <Text style={styles.metaValue}>{reporterId}</Text>
            </Text>
          )}

          {screenshotUri ? (
            <View style={[styles.previewContainer, { width: renderedW, height: renderedH }]}>
              <Image
                source={{ uri: screenshotUri }}
                style={{ width: renderedW, height: renderedH }}
                resizeMode="stretch"
              />
              {selectedBounds && (
                <View
                  pointerEvents="none"
                  style={[
                    styles.highlightBox,
                    {
                      left: selectedBounds.x * scaleX,
                      top: selectedBounds.y * scaleY,
                      width: selectedBounds.width * scaleX,
                      height: selectedBounds.height * scaleY,
                    },
                  ]}
                />
              )}
            </View>
          ) : null}

          <Text style={styles.label}>Sorunu açıklayın</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              multiline
              placeholder={isListening ? "Dinleniyor, konuşun..." : "Ne yanlış gözüküyor? Ne bekliyordunuz?"}
              placeholderTextColor="#999"
              value={note}
              onChangeText={setNote}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.micBtn, isListening && styles.micBtnActive]}
              onPress={toggleVoiceInput}
            >
              <Text style={styles.micBtnText}>{isListening ? '🛑' : '🎙️'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} disabled={saving}>
              <Text style={styles.cancelText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveText}>Kaydet</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SHEET_PADDING,
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
  title: {
    color: '#111',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  meta: {
    color: '#999',
    fontSize: 12,
    marginBottom: 2,
  },
  metaValue: {
    color: '#555',
    fontWeight: '500',
  },
  previewContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  highlightBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#e53e3e',
    backgroundColor: 'rgba(229,62,62,0.1)',
  },
  label: {
    color: '#444',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 12,
    color: '#111',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  micBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  micBtnActive: {
    backgroundColor: '#e53e3e',
    borderColor: '#e53e3e',
  },
  micBtnText: {
    fontSize: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#e53e3e',
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
