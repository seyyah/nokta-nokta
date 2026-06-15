import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AuditNoteBounds } from './types';

interface Props {
  visible: boolean;
  screenshot: string;
  bounds: AuditNoteBounds | null;
  screenName: string;
  reporterId?: string;
  onCancel: () => void;
  onSave: (note: string) => Promise<void>;
}

export function AuditOverlay({
  visible,
  screenshot,
  bounds,
  screenName,
  reporterId,
  onCancel,
  onSave,
}: Props) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!note.trim() || saving) return;
    setSaving(true);
    try {
      await onSave(note.trim());
      setNote('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View style={styles.sheet}>
          <View style={styles.previewWrap}>
            <Image source={{ uri: screenshot }} style={styles.preview} resizeMode="cover" />
            {bounds ? <View style={styles.previewBadge} /> : null}
          </View>
          <Text style={styles.meta}>Ekran: {screenName}</Text>
          <Text style={styles.meta}>Raporlayan: {reporterId ?? 'qa-team'}</Text>
          <TextInput
            style={styles.input}
            value={note}
            onChangeText={setNote}
            placeholder="Bu bolge icin not yaz..."
            placeholderTextColor="#6b7280"
            multiline
            textAlignVertical="top"
          />
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel} disabled={saving}>
              <Text style={styles.cancelText}>Iptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, (!note.trim() || saving) && styles.disabled]}
              onPress={save}
              disabled={!note.trim() || saving}
            >
              <Text style={styles.saveText}>{saving ? 'Kaydediliyor' : 'Kaydet'}</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  sheet: {
    padding: 18,
    paddingBottom: 28,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: '#ffffff',
  },
  previewWrap: {
    height: 150,
    marginBottom: 14,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  previewBadge: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#facc15',
  },
  meta: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    minHeight: 118,
    marginTop: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    color: '#111827',
    fontSize: 15,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  cancelButton: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  cancelText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  disabled: {
    opacity: 0.45,
  },
  saveText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
