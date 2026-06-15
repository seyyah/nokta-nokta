export type AuditNoteStatus = 'open' | 'fixed';

export interface AuditNoteBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AuditNote {
  id: string;
  screenName: string;
  screenshot: string; // file URI or base64 data URI (Baseline)
  screenshotFixed?: string; // file URI of the fixed version (Current)
  screenshotAspect?: number; // height/width ratio of the screenshot
  highlightBounds: AuditNoteBounds | null;
  note: string;
  status: AuditNoteStatus;
  createdAt: string; // ISO string
  timestamp?: string; // Deprecated
  reporterRole?: string;
  reporterId?: string;
}

export interface AuditReportMeta {
  appName: string;
  exportedAt: string;
  totalNotes: number;
}

// Implement this with AsyncStorage in the host app
export interface AuditStorage {
  loadNotes(): Promise<AuditNote[]>;
  saveNotes(notes: AuditNote[]): Promise<void>;
  getAll(): Promise<AuditNote[]>;
  add(note: Omit<AuditNote, 'id' | 'createdAt'>): Promise<AuditNote>;
  remove(id: string): Promise<void>;
  update(id: string, updates: Partial<AuditNote>): Promise<void>;
  getAllWithBase64?(): Promise<AuditNote[]>;
}
