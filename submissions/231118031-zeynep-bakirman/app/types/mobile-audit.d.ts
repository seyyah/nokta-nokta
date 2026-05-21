declare module '@xtatistix/mobile-audit' {
  import type { ComponentType, ReactNode } from 'react';

  export type AuditWidgetDeps = {
    BugIcon?: ReactNode;
    captureRef: (...args: any[]) => any;
    captureScreen: (...args: any[]) => any;
    currentScreen?: string;
    shareFile: (fileUri: string) => Promise<void>;
    storage?: {
      loadNotes: () => Promise<any[]>;
      saveNotes: (notes: any[]) => Promise<void>;
    };
    writeFile: (fileName: string, content: string) => Promise<string>;
    writeFileBinary: (fileName: string, content: string) => Promise<string>;
  };

  export const AuditWidget: ComponentType<{ deps: AuditWidgetDeps }>;
}
