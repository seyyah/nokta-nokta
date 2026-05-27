import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ideaStorage } from '../utils/ideaStorage';
import type { Idea } from '../types';

const statusOptions: { value: Idea['status']; label: string; color: string }[] = [
  { value: 'seed', label: 'Tohum', color: '#FCD34D' },
  { value: 'growing', label: 'Büyüyor', color: '#34D399' },
  { value: 'mature', label: 'Olgun', color: '#60A5FA' },
];

export default function AddIdeaScreen() {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Idea['status']>('seed');
  const [tagsText, setTagsText] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Fikir başlığı gerekli');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Hata', 'Fikir açıklaması gerekli');
      return;
    }

    setSaving(true);
    try {
      const tags = tagsText
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      await ideaStorage.addIdea({
        title: title.trim(),
        description: description.trim(),
        status,
        tags,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Hata', 'Fikir kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        <Text style={styles.label}>Başlık</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Fikrinin kısa başlığı"
          placeholderTextColor="#64748B"
          maxLength={100}
        />

        <Text style={styles.label}>Açıklama</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Fikrini detaylı açıkla..."
          placeholderTextColor="#64748B"
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Durum</Text>
        <View style={styles.statusContainer}>
          {statusOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.statusButton,
                status === opt.value && { backgroundColor: opt.color },
              ]}
              onPress={() => setStatus(opt.value)}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  status === opt.value && styles.statusButtonTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Etiketler</Text>
        <TextInput
          style={styles.input}
          value={tagsText}
          onChangeText={setTagsText}
          placeholder="mobil, ai, startup (virgülle ayır)"
          placeholderTextColor="#64748B"
        />

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Kaydediliyor...' : 'Fikri Kaydet'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
  },
  textArea: {
    minHeight: 120,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  statusButtonTextActive: {
    color: '#0F172A',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
