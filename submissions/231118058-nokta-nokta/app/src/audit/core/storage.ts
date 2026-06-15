import type { AuditNote, AuditStorage } from './types';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export class NoteManager {
  constructor(private storage: AuditStorage) {}

  async getAll(): Promise<AuditNote[]> {
    return this.storage.getAll();
  }

  async add(note: Omit<AuditNote, 'id' | 'createdAt' | 'status'>): Promise<AuditNote> {
    return this.storage.add({ ...note, status: 'open' });
  }

  async update(id: string, patch: Partial<AuditNote>): Promise<void> {
    return this.storage.update(id, patch);
  }

  async remove(id: string): Promise<void> {
    return this.storage.remove(id);
  }

  async clear(): Promise<void> {
    const all = await this.storage.getAll();
    for (const n of all) {
      await this.storage.remove(n.id);
    }
  }
}
