declare module '@xtatistix/mobile-audit' {
  import type { ComponentType, ReactNode } from 'react';

  export type AuditNote = {
    id: string;
    createdAt: string;
    screenshotUri?: string;
    note?: string;
    [key: string]: unknown;
  };

  export type AuditStorage = {
    loadNotes(): Promise<AuditNote[]>;
    saveNotes(notes: AuditNote[]): Promise<void>;
  };

  export type AuditWidgetProps = {
    appName: string;
    deps: {
      captureScreen: () => Promise<string>;
      captureRef: (ref: any) => Promise<string>;
      writeFile: (filename: string, content: string) => Promise<string>;
      writeFileBinary: (filename: string, base64: string) => Promise<string>;
      shareFile: (uri: string) => Promise<unknown>;
      storage: AuditStorage;
      currentScreen: string;
      reporterId: string;
      BugIcon?: ReactNode;
    };
    initialPosition?: {
      bottom?: number;
      right?: number;
      left?: number;
      top?: number;
    };
  };

  export const AuditWidget: ComponentType<AuditWidgetProps>;
}
