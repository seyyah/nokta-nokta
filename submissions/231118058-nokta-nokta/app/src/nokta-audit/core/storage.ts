import type { AuditNote } from './types';

export interface AuditStorage {
  loadNotes(): Promise<AuditNote[]>;
  saveNotes(notes: AuditNote[]): Promise<void>;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export class NoteManager {
  constructor(private storage: AuditStorage) {}

  async getAll(): Promise<AuditNote[]> {
    return this.storage.loadNotes();
  }

  async add(note: Omit<AuditNote, 'id' | 'timestamp' | 'status'>): Promise<AuditNote> {
    const notes = await this.storage.loadNotes();
    const newNote: AuditNote = {
      ...note,
      id: generateId(),
      timestamp: new Date().toISOString(),
      status: 'open',
    };
    await this.storage.saveNotes([...notes, newNote]);
    return newNote;
  }

  async update(id: string, patch: Partial<AuditNote>): Promise<void> {
    const notes = await this.storage.loadNotes();
    const idx = notes.findIndex((n) => n.id === id);
    if (idx === -1) return;
    notes[idx] = { ...notes[idx], ...patch };
    await this.storage.saveNotes(notes);
  }

  async remove(id: string): Promise<void> {
    const notes = await this.storage.loadNotes();
    await this.storage.saveNotes(notes.filter((n) => n.id !== id));
  }

  async clear(): Promise<void> {
    await this.storage.saveNotes([]);
  }
}
