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
  screenshot: string; // file URI or base64 data URI
  screenshotAspect?: number; // height/width ratio of the screenshot
  highlightBounds: AuditNoteBounds | null;
  note: string;
  status: AuditNoteStatus;
  timestamp: string; // ISO string
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
}
