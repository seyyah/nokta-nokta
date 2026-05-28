import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuditNote, AuditStorage } from '@xtatistix/mobile-audit';

const STORAGE_KEY = 'nokta_audit_notes';

export const auditStorage: AuditStorage = {
  async loadNotes(): Promise<AuditNote[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuditNote[]) : [];
  },
  async saveNotes(notes: AuditNote[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  },
};
