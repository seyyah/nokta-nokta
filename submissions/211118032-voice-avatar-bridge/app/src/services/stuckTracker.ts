/**
 * stuckTracker — son N forge cycle sonucunu takip eder. Ardışık 2 FAIL/ROLLBACK
 * STUCK sayılır → "Uzmana Bağlan" butonu görünür.
 *
 * AsyncStorage'da persist olur; agent yeniden başlatıldığında STUCK durumu
 * kaybolmaz. Track A için manuel kayıt; Track C için agent otomatik çağırır.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export type CycleStatus = 'COMMIT' | 'ROLLBACK' | 'STUCK' | 'FAIL';

export type CycleRecord = {
  id: string;
  status: CycleStatus;
  inputReport: string;
  hypothesis: string;
  durationMin: number;
  notes: string;
  timestamp: string;
};

const STORAGE_KEY = 'nokta_forge_cycles_v1';
const STUCK_THRESHOLD = 2;

type Listener = (state: { stuck: boolean; recent: CycleRecord[] }) => void;

class StuckTracker {
  private cache: CycleRecord[] | null = null;
  private listeners = new Set<Listener>();

  async load(): Promise<CycleRecord[]> {
    if (this.cache) return this.cache;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      this.cache = raw ? (JSON.parse(raw) as CycleRecord[]) : [];
    } catch {
      this.cache = [];
    }
    return this.cache;
  }

  async append(record: Omit<CycleRecord, 'id' | 'timestamp'>): Promise<CycleRecord> {
    const list = await this.load();
    const full: CycleRecord = {
      ...record,
      id: `cycle-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    list.push(full);
    this.cache = list;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    this.notify();
    return full;
  }

  async clear(): Promise<void> {
    this.cache = [];
    await AsyncStorage.removeItem(STORAGE_KEY);
    this.notify();
  }

  isStuck(records: CycleRecord[] = this.cache ?? []): boolean {
    if (records.length < STUCK_THRESHOLD) return false;
    const tail = records.slice(-STUCK_THRESHOLD);
    return tail.every((r) => r.status === 'ROLLBACK' || r.status === 'FAIL' || r.status === 'STUCK');
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    (async () => {
      const recent = await this.load();
      listener({ stuck: this.isStuck(recent), recent: recent.slice(-5) });
    })();
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const recent = (this.cache ?? []).slice(-5);
    const stuck = this.isStuck();
    this.listeners.forEach((l) => l({ stuck, recent }));
  }
}

export const stuckTracker = new StuckTracker();
