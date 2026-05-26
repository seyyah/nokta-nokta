import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuditStorage, AuditNote } from './nokta-audit';

const STORAGE_KEY = 'audit_notes';

export const auditStorage: AuditStorage = {
  async loadNotes(): Promise<AuditNote[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to load audit notes', e);
      return [];
    }
  },
  async saveNotes(notes: AuditNote[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to save audit notes', e);
    }
  },
};
