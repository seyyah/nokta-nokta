import { AuditNote, AuditStorage } from './types';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export class NoteManager {
  constructor(private storage: AuditStorage) {}

  async getAll(): Promise<AuditNote[]> {
    return this.storage.loadNotes();
  }

  async add(note: Omit<AuditNote, 'id' | 'timestamp' | 'status'>): Promise<AuditNote> {
    const newNote: AuditNote = {
      ...note,
      id: generateId(),
      timestamp: new Date().toISOString(),
      status: 'open',
    };

    const notes = await this.getAll();
    notes.push(newNote);
    await this.storage.saveNotes(notes);
    return newNote;
  }

  async update(id: string, updates: Partial<Omit<AuditNote, 'id'>>): Promise<void> {
    const notes = await this.getAll();
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) throw new Error(`Note with id ${id} not found`);

    notes[index] = { ...notes[index], ...updates };
    await this.storage.saveNotes(notes);
  }

  async remove(id: string): Promise<void> {
    const notes = await this.getAll();
    const filtered = notes.filter(n => n.id !== id);
    await this.storage.saveNotes(filtered);
  }

  async clear(): Promise<void> {
    await this.storage.saveNotes([]);
  }
}
