import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image, ScrollView } from 'react-native';
import { exportProposalAsMarkdown, exportProposalAsDocx } from '../../utils/fileManager';

interface ProposalModalProps {
  visible: boolean;
  onClose: () => void;
  area: {x: number, y: number, w: number, h: number} | null;
  screenshotBase64: string | null;
}

export const ProposalModal: React.FC<ProposalModalProps> = ({ visible, onClose, area, screenshotBase64 }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const resetAndClose = () => {
    setTitle('');
    setDescription('');
    onClose();
  };

  const handleSaveMD = async () => {
    if (!title.trim() || !description.trim()) {
      alert('Lütfen başlık ve açıklama alanlarını doldurun.');
      return;
    }
    await exportProposalAsMarkdown(title, description, area, screenshotBase64);
    resetAndClose();
  };

  const handleSaveDocx = async () => {
    if (!title.trim() || !description.trim()) {
      alert('Lütfen başlık ve açıklama alanlarını doldurun.');
      return;
    }
    await exportProposalAsDocx(title, description, area, screenshotBase64);
    resetAndClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={resetAndClose}>
      <KeyboardAvoidingView 
        style={styles.overlay} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>Yeni Öneri</Text>
              <TouchableOpacity onPress={resetAndClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {area && (
              <View style={styles.coordinatesContainer}>
                <Text style={styles.coordinatesText}>🎯 Seçilen Alan: X:{area.x}, Y:{area.y} (G:{area.w} Y:{area.h})</Text>
              </View>
            )}

            {screenshotBase64 && (
              <View style={styles.imagePreviewContainer}>
                <Image 
                  source={{ uri: `data:image/jpeg;base64,${screenshotBase64}` }} 
                  style={styles.imagePreview} 
                  resizeMode="cover"
                />
              </View>
            )}

            <Text style={styles.label}>Öneri Başlığı</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Buton Rengi Değişikliği"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Açıklama</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ne geliştirilmeli? Nasıl bir fayda sağlar?"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#9ca3af"
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.saveButton, styles.mdButton]} onPress={handleSaveMD}>
                <Text style={styles.saveButtonText}>Markdown İndir</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveButton, styles.docxButton]} onPress={handleSaveDocx}>
                <Text style={styles.saveButtonText}>Word İndir</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  coordinatesContainer: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  coordinatesText: {
    color: '#92400e',
    fontWeight: 'bold',
    fontSize: 14,
  },
  imagePreviewContainer: {
    height: 160,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    marginBottom: 20,
  },
  textArea: {
    minHeight: 100,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 12,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  mdButton: {
    backgroundColor: '#374151',
  },
  docxButton: {
    backgroundColor: '#2563eb',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
