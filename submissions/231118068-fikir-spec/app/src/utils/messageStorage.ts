import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ExpertMessage } from '../types/messages';

const MESSAGES_KEY = 'expert_messages';

export async function loadMessages(): Promise<ExpertMessage[]> {
  try {
    const raw = await AsyncStorage.getItem(MESSAGES_KEY);
    return raw ? (JSON.parse(raw) as ExpertMessage[]) : [];
  } catch {
    return [];
  }
}

export async function saveMessages(messages: ExpertMessage[]): Promise<void> {
  try {
    await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  } catch {}
}
