import React, { useState, useRef, useCallback } from 'react';
import {
  Modal,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { AuditOverlay } from './AuditOverlay';
import { AuditNoteList } from './AuditNoteList';
import { AuditSelector } from './AuditSelector';
import type { AuditNoteBounds } from '../core/types';
import { NoteManager } from '../core/storage';
import { buildMarkdown } from '../export/markdown';
import { buildDocx } from '../export/docx';
import type { AuditNote, AuditStorage } from '../core/types';

export interface AuditWidgetDeps {
  captureScreen: () => Promise<string>;
  captureRef: (ref: React.RefObject<any>) => Promise<string>;
  writeFile: (filename: string, content: string) => Promise<string>;
  writeFileBinary: (filename: string, base64: string) => Promise<string>;
  shareFile: (uri: string) => Promise<void>;
  storage: AuditStorage;
  currentScreen: string;
  reporterId?: string;
  BugIcon: React.ReactNode;
}

interface Props {
  deps: AuditWidgetDeps;
  appName?: string;
  initialPosition?: { bottom: number; right: number };
}

type WidgetMode = 'idle' | 'capturing' | 'selecting' | 'annotating' | 'list';

const BUTTON_SIZE = 52;
const DRAG_THRESHOLD = 6;
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export function AuditWidget({ deps, appName = 'App', initialPosition }: Props) {
  const [mode, setMode] = useState<WidgetMode>('idle');
  const [notes, setNotes] = useState<AuditNote[]>([]);
  const [capturedUri, setCapturedUri] = useState('');
  const [selectedBounds, setSelectedBounds] = useState<AuditNoteBounds | null>(null);
  const managerRef = useRef(new NoteManager(deps.storage));
  const manager = managerRef.current;

  const initX = SCREEN_W - (initialPosition?.right ?? 16) - BUTTON_SIZE;
  const initY = SCREEN_H - (initialPosition?.bottom ?? 110) - BUTTON_SIZE;

  const pan = useRef(new Animated.ValueXY({ x: initX, y: initY })).current;
  const lastPos = useRef({ x: initX, y: initY });
  const isDragging = useRef(false);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingTaps = useRef(0);

  // Capture these so panResponder callbacks (created once) can call latest handlers
  const handleCaptureRef = useRef<() => void>(() => {});
  const handleOpenListRef = useRef<() => void>(() => {});

  const loadNotes = useCallback(async () => {
    setNotes(await manager.getAll());
  }, [manager]);

  const handleCapture = useCallback(async () => {
    setMode('capturing');
    try {
      const uri = await deps.captureScreen();
      setCapturedUri(uri);
      setSelectedBounds(null);
      setMode('selecting');
    } catch (e) {
      console.warn('[AuditWidget] captureScreen failed:', e);
      setMode('idle');
    }
  }, [deps]);

  const handleOpenList = useCallback(async () => {
    await loadNotes();
    setMode('list');
  }, [loadNotes]);

  // Keep refs up to date so panResponder can call them
  handleCaptureRef.current = handleCapture;
  handleOpenListRef.current = handleOpenList;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_: GestureResponderEvent, gs: PanResponderGestureState) =>
        Math.abs(gs.dx) > DRAG_THRESHOLD || Math.abs(gs.dy) > DRAG_THRESHOLD,

      onPanResponderGrant: (_: GestureResponderEvent, __: PanResponderGestureState) => {
        isDragging.current = false;
        pan.setOffset({ x: lastPos.current.x, y: lastPos.current.y });
        pan.setValue({ x: 0, y: 0 });
      },

      onPanResponderMove: (_: GestureResponderEvent, gs: PanResponderGestureState) => {
        if (Math.abs(gs.dx) > DRAG_THRESHOLD || Math.abs(gs.dy) > DRAG_THRESHOLD) {
          isDragging.current = true;
        }
        Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false })(_, gs);
      },

      onPanResponderRelease: (_: GestureResponderEvent, gs: PanResponderGestureState) => {
        pan.flattenOffset();
        const rawX = lastPos.current.x + gs.dx;
        const rawY = lastPos.current.y + gs.dy;
        const clampedX = Math.max(0, Math.min(SCREEN_W - BUTTON_SIZE, rawX));
        const clampedY = Math.max(0, Math.min(SCREEN_H - BUTTON_SIZE, rawY));
        pan.setValue({ x: clampedX, y: clampedY });
        lastPos.current = { x: clampedX, y: clampedY };

        if (!isDragging.current) {
          pendingTaps.current += 1;
          if (tapTimer.current) clearTimeout(tapTimer.current);
          tapTimer.current = setTimeout(() => {
            const taps = pendingTaps.current;
            pendingTaps.current = 0;
            if (taps >= 2) {
              handleOpenListRef.current();
            } else {
              handleCaptureRef.current();
            }
          }, 280);
        }
      },
    })
  ).current;

  const handleSelectionConfirm = (bounds: AuditNoteBounds, annotatedUri: string) => {
    setSelectedBounds(bounds);
    setCapturedUri(annotatedUri); // replace plain screenshot with annotated version
    setMode('annotating');
  };

  const handleSaveNote = async (noteText: string) => {
    const { height: SH, width: SW } = Dimensions.get('screen');
    await manager.add({
      screenName: deps.currentScreen,
      screenshot: capturedUri,
      screenshotAspect: SH / SW,
      highlightBounds: selectedBounds,
      note: noteText,
      reporterId: deps.reporterId,
    });
    await loadNotes();
    setMode('idle');
    setCapturedUri('');
  };

  const handleEditNote = async (id: string, newNote: string) => {
    await manager.update(id, { note: newNote });
    await loadNotes();
  };

  const handleDelete = async (id: string) => {
    await manager.remove(id);
    await loadNotes();
  };

  const stamp = () => new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');

  const handleExportMd = async () => {
    const all = await manager.getAll();
    const md = buildMarkdown(all, { appName, exportedAt: new Date().toISOString(), totalNotes: all.length });
    const fileUri = await deps.writeFile(`bug-report-${stamp()}.md`, md);
    await deps.shareFile(fileUri);
  };

  const handleExportDocx = async () => {
    const all = await manager.getAll();
    const base64 = await buildDocx(all, { appName, exportedAt: new Date().toISOString(), totalNotes: all.length });
    const fileUri = await deps.writeFileBinary(`bug-report-${stamp()}.docx`, base64);
    await deps.shareFile(fileUri);
  };

  return (
    <>
      {mode === 'idle' && (
        <Animated.View
          style={[styles.fab, { left: pan.x, top: pan.y }]}
          {...panResponder.panHandlers}
        >
          {deps.BugIcon}
        </Animated.View>
      )}

      {mode === 'selecting' && (
        <AuditSelector
          screenshotUri={capturedUri}
          captureRef={deps.captureRef}
          onConfirm={handleSelectionConfirm}
          onCancel={() => { setMode('idle'); setCapturedUri(''); }}
        />
      )}

      <AuditOverlay
        visible={mode === 'annotating'}
        screenshotUri={capturedUri}
        selectedBounds={selectedBounds}
        screenName={deps.currentScreen}
        reporterId={deps.reporterId}
        onSave={handleSaveNote}
        onCancel={() => { setMode('idle'); setCapturedUri(''); }}
      />

      <Modal visible={mode === 'list'} animationType="slide" presentationStyle="pageSheet">
        <AuditNoteList
          notes={notes}
          onEdit={handleEditNote}
          onDelete={handleDelete}
          onExportMd={handleExportMd}
          onExportDocx={handleExportDocx}
          onClose={() => setMode('idle')}
        />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    zIndex: 9999,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#e53e3e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
});
