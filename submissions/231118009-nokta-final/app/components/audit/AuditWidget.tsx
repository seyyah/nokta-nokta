import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Image as RNImage,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { buildDocx } from './docx';
import { buildMarkdown } from './markdown';
import { NoteManager } from './storage';
import { AuditNote, AuditNoteBounds, AuditWidgetProps, AuditWidgetState } from './types';
import { AuditNoteList } from './AuditNoteList';
import { AuditOverlay } from './AuditOverlay';
import { AuditSelector } from './AuditSelector';

function waitForUiSettle() {
  return new Promise(resolve => setTimeout(resolve, 140));
}

async function getImageAspect(uri: string): Promise<number | undefined> {
  return new Promise(resolve => {
    RNImage.getSize(
      uri,
      (width, height) => resolve(width > 0 ? height / width : undefined),
      () => resolve(undefined),
    );
  });
}

export function AuditWidget({ deps, appName = 'Nokta', initialPosition }: AuditWidgetProps) {
  const manager = useMemo(() => new NoteManager(deps.storage), [deps.storage]);
  const [state, setState] = useState<AuditWidgetState>('idle');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [bounds, setBounds] = useState<AuditNoteBounds | null>(null);
  const [notes, setNotes] = useState<AuditNote[]>([]);
  const [busy, setBusy] = useState(false);

  const loadNotes = useCallback(async () => {
    const allNotes = await manager.getAll();
    setNotes([...allNotes].sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
  }, [manager]);

  const fail = (message: string) => {
    Alert.alert('Audit hata', message);
    setState('idle');
    setBusy(false);
  };

  const startCapture = async () => {
    if (busy || state !== 'idle') return;
    setBusy(true);
    setState('capturing');
    try {
      await waitForUiSettle();
      const captured = await deps.captureScreen();
      setScreenshot(captured);
      setState('selecting');
    } catch (error) {
      fail(error instanceof Error ? error.message : 'Ekran yakalanamadi.');
    } finally {
      setBusy(false);
    }
  };

  const openList = async () => {
    if (busy || state !== 'idle') return;
    await loadNotes();
    setState('list');
  };

  const saveNote = async (noteText: string) => {
    if (!screenshot) return;
    const aspect = await getImageAspect(screenshot);
    await manager.add({
      screenName: deps.currentScreen,
      screenshot,
      screenshotAspect: aspect,
      highlightBounds: bounds,
      note: noteText,
      reporterId: deps.reporterId,
    });
    const allNotes = await manager.getAll();
    const markdown = buildMarkdown(allNotes, {
      appName,
      exportedAt: new Date().toISOString(),
      totalNotes: allNotes.length,
    });
    const base64 = await buildDocx(allNotes, {
      appName,
      exportedAt: new Date().toISOString(),
      totalNotes: allNotes.length,
    });
    await deps.writeFile(`nokta-audit-${Date.now()}.md`, markdown);
    const uri = await deps.writeFileBinary(`nokta-audit-${Date.now()}.docx`, base64);
    setScreenshot(null);
    setBounds(null);
    setState('idle');
    await deps.shareFile(uri);
  };

  const removeNote = async (id: string) => {
    await manager.remove(id);
    await loadNotes();
  };

  const updateNote = async (id: string, noteText: string) => {
    await manager.update(id, { note: noteText });
    await loadNotes();
  };

  const toggleStatus = async (note: AuditNote) => {
    await manager.update(note.id, { status: note.status === 'open' ? 'fixed' : 'open' });
    await loadNotes();
  };

  const exportMarkdown = async () => {
    const allNotes = await manager.getAll();
    const md = buildMarkdown(allNotes, {
      appName,
      exportedAt: new Date().toISOString(),
      totalNotes: allNotes.length,
    });
    const uri = await deps.writeFile(`nokta-audit-${Date.now()}.md`, md);
    await deps.shareFile(uri);
  };

  const exportDocx = async () => {
    const allNotes = await manager.getAll();
    const base64 = await buildDocx(allNotes, {
      appName,
      exportedAt: new Date().toISOString(),
      totalNotes: allNotes.length,
    });
    const uri = await deps.writeFileBinary(`nokta-audit-${Date.now()}.docx`, base64);
    await deps.shareFile(uri);
  };

  const bottom = initialPosition?.bottom ?? 120;

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {state === 'idle' ? (
        <View style={[styles.leftRail, { bottom }]}>
          <TouchableOpacity
            accessibilityLabel="Audit secim modu"
            style={styles.auditButton}
            onPress={startCapture}
            onLongPress={openList}
            disabled={busy}
          >
            {deps.BugIcon ?? <Text style={styles.auditIcon}>!</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.listButton} onPress={openList} disabled={busy}>
            <Text style={styles.listIcon}>≡</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {state === 'capturing' ? (
        <View style={styles.capturing}>
          <Text style={styles.capturingText}>Yakalaniyor...</Text>
        </View>
      ) : null}

      {state === 'selecting' && screenshot ? (
        <AuditSelector
          screenshot={screenshot}
          captureRef={deps.captureRef}
          onCancel={() => {
            setScreenshot(null);
            setState('idle');
          }}
          onConfirm={({ screenshot: burnedScreenshot, bounds: nextBounds }) => {
            setScreenshot(burnedScreenshot);
            setBounds(nextBounds);
            setState('annotating');
          }}
        />
      ) : null}

      {state === 'annotating' && screenshot ? (
        <AuditOverlay
          visible
          screenshot={screenshot}
          bounds={bounds}
          screenName={deps.currentScreen}
          reporterId={deps.reporterId}
          onCancel={() => {
            setScreenshot(null);
            setBounds(null);
            setState('idle');
          }}
          onSave={saveNote}
        />
      ) : null}

      <AuditNoteList
        visible={state === 'list'}
        notes={notes}
        onClose={() => setState('idle')}
        onRefresh={loadNotes}
        onRemove={removeNote}
        onUpdateNote={updateNote}
        onToggleStatus={toggleStatus}
        onExportMarkdown={exportMarkdown}
        onExportDocx={exportDocx}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  leftRail: {
    position: 'absolute',
    left: 10,
    gap: 8,
    zIndex: 900,
  },
  auditButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 8,
  },
  auditIcon: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },
  listButton: {
    width: 42,
    height: 42,
    marginLeft: 6,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
  },
  listIcon: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 25,
  },
  capturing: {
    position: 'absolute',
    left: 16,
    bottom: 132,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#111827',
    zIndex: 950,
  },
  capturingText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
