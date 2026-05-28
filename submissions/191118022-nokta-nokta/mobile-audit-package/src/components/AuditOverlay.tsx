import React, { useEffect, useState } from 'react';
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
  ScrollView,
  Keyboard,
} from 'react-native';
import type { AuditNoteBounds } from '../core/types';

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
  const [keyboardInset, setKeyboardInset] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const showSub = Keyboard.addListener('keyboardDidShow', (event) => {
      setKeyboardInset(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardInset(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSave = async () => {
    if (!note.trim()) {
      Alert.alert('Not boş', 'Lütfen bir açıklama girin.');
      return;
    }
    setSaving(true);
    try {
      await onSave(note.trim());
      setNote('');
    } catch (error) {
      console.warn('[AuditOverlay] save failed:', error);
      Alert.alert('Kaydedilemedi', 'Rapor kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
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

  const sheet = (
    <View style={styles.sheet}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'none'}
        showsVerticalScrollIndicator={false}
      >
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
          <TextInput
            style={styles.input}
            multiline
            placeholder="Ne yanlış gözüküyor? Ne bekliyordunuz?"
            placeholderTextColor="#999"
            value={note}
            onChangeText={setNote}
          />

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
      </ScrollView>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
      statusBarTranslucent={Platform.OS === 'android'}
      navigationBarTranslucent={Platform.OS === 'android'}
    >
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView style={styles.backdrop} behavior="padding">
          {sheet}
        </KeyboardAvoidingView>
      ) : (
        <View style={[styles.backdrop, keyboardInset ? { paddingBottom: keyboardInset } : null]}>
          {sheet}
        </View>
      )}
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
    maxHeight: '92%',
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
  input: {
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
