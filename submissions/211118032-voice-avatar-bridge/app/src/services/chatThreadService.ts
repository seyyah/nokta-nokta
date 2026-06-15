import { Message } from '../types';
import { StorageHelper } from '../storage/storageHelper';

const THREADS_KEY = '@nokta:chat_threads';

export type ChatThreadId = 'general' | string;

type ThreadStore = Record<string, Message[]>;

function buildWelcomeMessage(threadId: ChatThreadId): Message {
  if (threadId === 'general') {
    return {
      id: 'welcome_general',
      text: 'Merhaba! Ben Nokta. Fikrini veya problemini benimle paylaşabilirsin. Uzman alanına göre ayrı sohbet kanallarına geçebilirsin. 😊',
      sender: 'mascot',
      timestamp: new Date().toISOString(),
    };
  }
  return {
    id: `welcome_${threadId}`,
    text: `Bu kanal "${threadId}" uzmanlık alanı için ayrılmış sohbet. Bu alandaki sorularını buradan yazabilirsin.`,
    sender: 'mascot',
    timestamp: new Date().toISOString(),
  };
}

async function loadAll(): Promise<ThreadStore> {
  return (await StorageHelper.getItem<ThreadStore>(THREADS_KEY)) ?? {};
}

async function saveAll(store: ThreadStore): Promise<void> {
  await StorageHelper.setItem(THREADS_KEY, store);
}

export async function loadThread(threadId: ChatThreadId): Promise<Message[]> {
  const store = await loadAll();
  const existing = store[threadId];
  if (existing && existing.length > 0) return existing;
  return [buildWelcomeMessage(threadId)];
}

export async function saveThread(threadId: ChatThreadId, messages: Message[]): Promise<void> {
  const store = await loadAll();
  store[threadId] = messages;
  await saveAll(store);
}

export async function clearThread(threadId: ChatThreadId): Promise<void> {
  await saveThread(threadId, [buildWelcomeMessage(threadId)]);
}
