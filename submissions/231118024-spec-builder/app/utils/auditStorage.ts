import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'nokta_audit_notes';

export const auditStorage = {
  loadNotes: async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Error loading audit notes:', e);
      return [];
    }
  },
  saveNotes: async (notes: any) => {
    try {
      const jsonValue = JSON.stringify(notes);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('Error saving audit notes:', e);
    }
  },
};
