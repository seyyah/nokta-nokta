import { ReactNode } from 'react';

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
  screenshot: string; // URI or base64 data URI
  screenshotAspect?: number; // height/width ratio for DOCX rendering
  highlightBounds: AuditNoteBounds | null;
  note: string;
  status: AuditNoteStatus;
  timestamp: string; // ISO 8601
  reporterRole?: string;
  reporterId?: string;
}

export interface AuditReportMeta {
  appName: string;
  exportedAt: string; // ISO 8601
  totalNotes: number;
}

export interface AuditStorage {
  loadNotes(): Promise<AuditNote[]>;
  saveNotes(notes: AuditNote[]): Promise<void>;
}

export interface AuditWidgetDeps {
  captureScreen: () => Promise<string>;
  captureRef: (ref: any) => Promise<string>;
  writeFile: (filename: string, content: string) => Promise<string>;
  writeFileBinary: (filename: string, base64: string) => Promise<string>;
  shareFile: (uri: string) => Promise<void>;
  storage: AuditStorage;
  currentScreen: string;
  reporterId?: string;
  BugIcon?: ReactNode;
}

export interface AuditWidgetProps {
  deps: AuditWidgetDeps;
  appName?: string;
  initialPosition?: { bottom: number; right: number };
}

export type AuditWidgetState = 'idle' | 'capturing' | 'selecting' | 'annotating' | 'list';
