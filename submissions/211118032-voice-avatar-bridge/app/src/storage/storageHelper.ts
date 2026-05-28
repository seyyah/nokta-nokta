import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ESCALATIONS: '@nokta:escalations',
  SUMMARIES: '@nokta:summaries',
} as const;

async function getItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // silently fail on storage errors
  }
}

async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // silently fail
  }
}

async function clearAll(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([KEYS.ESCALATIONS, KEYS.SUMMARIES]);
  } catch {
    // silently fail
  }
}

export const StorageHelper = {
  KEYS,
  getItem,
  setItem,
  removeItem,
  clearAll,
};
