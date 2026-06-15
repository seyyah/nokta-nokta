import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import type { AuditNote, AuditStorage } from './core/types';

const DB_NAME = 'audit.db';

let _db: SQLite.SQLiteDatabase | null = null;

// Helper to save base64 / data URL string to a file on disk
async function saveImageToFile(id: string, base64OrUri: string, prefix: 'baseline' | 'fixed'): Promise<string> {
  if (!base64OrUri) return '';
  if (base64OrUri.startsWith('file://')) {
    return base64OrUri;
  }
  
  let base64Data = base64OrUri;
  if (base64OrUri.startsWith('data:')) {
    const parts = base64OrUri.split(',');
    base64Data = parts.length > 1 ? parts[1] : parts[0];
  }
  
  const filename = `audit_${id}_${prefix}.png`;
  const fileUri = (FileSystem.documentDirectory || '') + filename;
  
  await FileSystem.writeAsStringAsync(fileUri, base64Data, {
    encoding: FileSystem.EncodingType.Base64,
  });
  
  console.log(`[auditStorage] Saved ${prefix} image to file: ${fileUri}`);
  return fileUri;
}

const getDb = async () => {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync(DB_NAME);
    
    // Schema migration: Check if schema has old BLOB types. If so, drop table to migrate to file paths.
    try {
      const result = await _db.getAllAsync<any>("PRAGMA table_info(audit_notes)");
      const screenshotCol = result.find(c => c.name === 'screenshot');
      if (screenshotCol && screenshotCol.type === 'BLOB') {
        console.log('[auditStorage] Old BLOB schema detected. Drop table to recreate for high-performance file paths...');
        await _db.execAsync('DROP TABLE IF EXISTS audit_notes;');
      }
    } catch (e) {
      console.log('[auditStorage] Pragma check failed, continuing...', e);
    }

    await _db.execAsync(`
      CREATE TABLE IF NOT EXISTS audit_notes (
        id TEXT PRIMARY KEY,
        screenName TEXT,
        screenshot TEXT,
        screenshotFixed TEXT,
        screenshotAspect REAL,
        highlightBounds TEXT,
        note TEXT,
        status TEXT,
        createdAt TEXT,
        reporterId TEXT
      );
    `);

    // Automatic seeding of initial notes parsed from bug2.md and bug3.md
    try {
      const countResult = await _db.getAllAsync<any>('SELECT COUNT(*) as count FROM audit_notes');
      const count = countResult[0]?.count || 0;
      if (count === 0) {
        console.log('[auditStorage] Database is empty. Seeding initial notes from bug2.md and bug3.md...');
        const initialNotes = require('./initialNotes.json');
        
        for (const note of initialNotes) {
          const id = Math.random().toString(36).substring(7);
          const createdAt = new Date().toISOString();
          const status = 'open';
          
          let fileUri = '';
          if (note.screenshot && note.screenshot.startsWith('data:image')) {
            // Save base64 image to local file path
            fileUri = await saveImageToFile(id, note.screenshot, 'baseline');
          } else {
            // Keep simulator or original screenshot string
            fileUri = note.screenshot;
          }
          
          await _db.runAsync(
            `INSERT INTO audit_notes (id, screenName, screenshot, screenshotAspect, highlightBounds, note, status, createdAt, reporterId) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id, 
              note.screenName, 
              fileUri, 
              note.screenshotAspect || 1.77, 
              JSON.stringify(note.highlightBounds || null), 
              note.note, 
              status, 
              createdAt, 
              note.reporterId || ''
            ]
          );
        }
        console.log(`[auditStorage] Successfully seeded ${initialNotes.length} notes!`);
      }
    } catch (err) {
      console.log('[auditStorage] Error or skipped seeding initial notes:', err);
    }
  }
  return _db;
};

export const auditStorage: AuditStorage = {
  async loadNotes(): Promise<AuditNote[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<any>('SELECT * FROM audit_notes ORDER BY createdAt DESC');
    return rows.map(row => ({
      ...row,
      highlightBounds: row.highlightBounds ? JSON.parse(row.highlightBounds) : null,
    }));
  },
  async saveNotes(notes: AuditNote[]): Promise<void> {
    // Satisfy interface if needed, handled row-by-row
  },
  async getAll(): Promise<AuditNote[]> {
    return this.loadNotes();
  },
  async add(note: Omit<AuditNote, 'id' | 'createdAt'>): Promise<AuditNote> {
    const db = await getDb();
    const id = Math.random().toString(36).substring(7);
    const createdAt = new Date().toISOString();
    const status = 'open';
    
    // Save image to FileSystem
    const fileUri = await saveImageToFile(id, note.screenshot, 'baseline');
    
    await db.runAsync(
      `INSERT INTO audit_notes (id, screenName, screenshot, screenshotAspect, highlightBounds, note, status, createdAt, reporterId) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, 
        note.screenName, 
        fileUri, 
        note.screenshotAspect || 1, 
        JSON.stringify(note.highlightBounds), 
        note.note, 
        status, 
        createdAt, 
        note.reporterId || ''
      ]
    );
    
    return { ...note, id, createdAt, status, screenshot: fileUri };
  },
  async update(id: string, updates: Partial<AuditNote>): Promise<void> {
    const db = await getDb();
    
    if (updates.screenshotFixed) {
      const fileUri = await saveImageToFile(id, updates.screenshotFixed, 'fixed');
      await db.runAsync('UPDATE audit_notes SET screenshotFixed = ? WHERE id = ?', [fileUri, id]);
    }
    
    if (updates.note !== undefined) {
      await db.runAsync('UPDATE audit_notes SET note = ? WHERE id = ?', [updates.note, id]);
    }
    
    if (updates.status !== undefined) {
      await db.runAsync('UPDATE audit_notes SET status = ? WHERE id = ?', [updates.status, id]);
    }
  },
  async remove(id: string): Promise<void> {
    const db = await getDb();
    
    // Delete files from file system to avoid leaking storage
    try {
      const rows = await db.getAllAsync<any>('SELECT screenshot, screenshotFixed FROM audit_notes WHERE id = ?', [id]);
      if (rows && rows[0]) {
        const { screenshot, screenshotFixed } = rows[0];
        if (screenshot && screenshot.startsWith('file://')) {
          await FileSystem.deleteAsync(screenshot, { idempotent: true });
        }
        if (screenshotFixed && screenshotFixed.startsWith('file://')) {
          await FileSystem.deleteAsync(screenshotFixed, { idempotent: true });
        }
      }
    } catch (err) {
      console.log('[auditStorage] Error deleting files on remove:', err);
    }

    await db.runAsync('DELETE FROM audit_notes WHERE id = ?', [id]);
  },
  async getAllWithBase64(): Promise<AuditNote[]> {
    const notes = await this.loadNotes();
    return Promise.all(notes.map(async (note) => {
      let screenshot = note.screenshot;
      let screenshotFixed = note.screenshotFixed;
      
      try {
        if (screenshot && screenshot.startsWith('file://')) {
          const base64 = await FileSystem.readAsStringAsync(screenshot, {
            encoding: FileSystem.EncodingType.Base64,
          });
          screenshot = `data:image/png;base64,${base64}`;
        }
        if (screenshotFixed && screenshotFixed.startsWith('file://')) {
          const base64 = await FileSystem.readAsStringAsync(screenshotFixed, {
            encoding: FileSystem.EncodingType.Base64,
          });
          screenshotFixed = `data:image/png;base64,${base64}`;
        }
      } catch (err) {
        console.log('[auditStorage] Error converting to base64 during export:', err);
      }
      
      return {
        ...note,
        screenshot,
        screenshotFixed,
      };
    }));
  }
};
