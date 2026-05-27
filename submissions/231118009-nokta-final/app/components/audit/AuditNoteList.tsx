import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AuditNote } from './types';

interface Props {
  visible: boolean;
  notes: AuditNote[];
  onClose: () => void;
  onRefresh: () => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onUpdateNote: (id: string, note: string) => Promise<void>;
  onToggleStatus: (note: AuditNote) => Promise<void>;
  onExportMarkdown: () => Promise<void>;
  onExportDocx: () => Promise<void>;
}

export function AuditNoteList({
  visible,
  notes,
  onClose,
  onRefresh,
  onRemove,
  onUpdateNote,
  onToggleStatus,
  onExportMarkdown,
  onExportDocx,
}: Props) {
  const [editing, setEditing] = useState<AuditNote | null>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (visible) {
      void onRefresh();
    }
  }, [visible, onRefresh]);

  const confirmRemove = (id: string) => {
    Alert.alert('Not silinsin mi?', 'Bu rapor notu kalici olarak silinir.', [
      { text: 'Vazgec', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => void onRemove(id) },
    ]);
  };

  const saveEdit = async () => {
    if (!editing || !draft.trim()) return;
    await onUpdateNote(editing.id, draft.trim());
    setEditing(null);
    setDraft('');
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.title}>Audit Notlari</Text>
          <TouchableOpacity style={styles.iconButton} onPress={onClose}>
            <Text style={styles.iconText}>X</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.exportRow}>
          <TouchableOpacity style={styles.exportMd} onPress={onExportMarkdown} disabled={notes.length === 0}>
            <Text style={styles.exportText}>MD</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportDocx} onPress={onExportDocx} disabled={notes.length === 0}>
            <Text style={styles.exportText}>DOCX</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          {notes.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Henuz not yok</Text>
              <Text style={styles.emptyText}>Sol audit dugmesiyle bir alan secip not ekleyebilirsin.</Text>
            </View>
          ) : (
            notes.map(note => (
              <View key={note.id} style={styles.card}>
                <Image source={{ uri: note.screenshot }} style={styles.thumb} resizeMode="cover" />
                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <Text style={styles.screen}>{note.screenName}</Text>
                    <Text style={[styles.status, note.status === 'fixed' && styles.fixed]}>
                      {note.status === 'open' ? 'Acik' : 'Duzeltildi'}
                    </Text>
                  </View>
                  <Text style={styles.noteText}>{note.note}</Text>
                  <Text style={styles.time}>{new Date(note.timestamp).toLocaleString('tr-TR')}</Text>
                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => onToggleStatus(note)}>
                      <Text style={styles.actionText}>Durum</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setEditing(note);
                        setDraft(note.note);
                      }}
                    >
                      <Text style={styles.actionText}>Duzenle</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => confirmRemove(note.id)}>
                      <Text style={styles.deleteText}>Sil</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <Modal visible={editing !== null} transparent animationType="fade">
          <View style={styles.editBackdrop}>
            <View style={styles.editBox}>
              <Text style={styles.editTitle}>Notu duzenle</Text>
              <TextInput
                style={styles.editInput}
                value={draft}
                onChangeText={setDraft}
                multiline
                textAlignVertical="top"
              />
              <View style={styles.editActions}>
                <TouchableOpacity style={styles.cancelEdit} onPress={() => setEditing(null)}>
                  <Text style={styles.cancelEditText}>Vazgec</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveEdit} onPress={saveEdit}>
                  <Text style={styles.saveEditText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 52,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '800',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2e8f0',
  },
  iconText: {
    color: '#0f172a',
    fontWeight: '800',
  },
  exportRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  exportMd: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
  },
  exportDocx: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
  },
  exportText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  list: {
    padding: 18,
    paddingTop: 0,
  },
  empty: {
    alignItems: 'center',
    padding: 28,
  },
  emptyTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 8,
    color: '#64748b',
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  thumb: {
    width: 92,
    height: 128,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
  },
  cardBody: {
    flex: 1,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  screen: {
    flex: 1,
    color: '#0f172a',
    fontWeight: '800',
  },
  status: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '800',
  },
  fixed: {
    color: '#047857',
  },
  noteText: {
    marginTop: 8,
    color: '#1f2937',
    lineHeight: 20,
  },
  time: {
    marginTop: 8,
    color: '#64748b',
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  actionText: {
    color: '#2563eb',
    fontWeight: '800',
  },
  deleteText: {
    color: '#dc2626',
    fontWeight: '800',
  },
  editBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
  },
  editBox: {
    padding: 18,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  editTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  editInput: {
    minHeight: 120,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    color: '#111827',
  },
  editActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  cancelEdit: {
    flex: 1,
    minHeight: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5e7eb',
  },
  saveEdit: {
    flex: 1,
    minHeight: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
  },
  cancelEditText: {
    color: '#111827',
    fontWeight: '800',
  },
  saveEditText: {
    color: '#ffffff',
    fontWeight: '800',
  },
});
