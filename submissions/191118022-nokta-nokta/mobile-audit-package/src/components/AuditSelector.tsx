import React, { useRef, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  PanResponder,
  Dimensions,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import type { AuditNoteBounds } from '../core/types';

interface Props {
  screenshotUri: string;
  captureRef: (ref: React.RefObject<any>) => Promise<string>;
  onConfirm: (bounds: AuditNoteBounds, annotatedUri: string) => void;
  onCancel: () => void;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('screen');

export function AuditSelector({ screenshotUri, captureRef, onConfirm, onCancel }: Props) {
  const [box, setBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [burning, setBurning] = useState(false);
  const startPage = useRef<{ x: number; y: number } | null>(null);
  const compositeRef = useRef<View>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (e: GestureResponderEvent) => {
        const { pageX, pageY } = e.nativeEvent;
        startPage.current = { x: pageX, y: pageY };
        setBox({ x: pageX, y: pageY, w: 0, h: 0 });
      },

      onPanResponderMove: (_: GestureResponderEvent, gs: PanResponderGestureState) => {
        if (!startPage.current) return;
        const { x, y } = startPage.current;
        const w = gs.dx;
        const h = gs.dy;
        setBox({
          x: w < 0 ? x + w : x,
          y: h < 0 ? y + h : y,
          w: Math.abs(w),
          h: Math.abs(h),
        });
      },

      onPanResponderRelease: () => {},
    })
  ).current;

  const handleConfirm = async () => {
    if (!box || box.w < 10 || box.h < 10) return;
    setBurning(true);
    try {
      // Capture the composite view (screenshot + yellow box drawn on top)
      const annotatedUri = await captureRef(compositeRef);
      onConfirm({ x: box.x, y: box.y, width: box.w, height: box.h }, annotatedUri);
    } catch (e) {
      console.warn('[AuditSelector] captureRef failed:', e);
    } finally {
      setBurning(false);
    }
  };

  const hasBox = box && box.w > 10 && box.h > 10;

  return (
    <View style={styles.container}>
      {/* Composite view that gets captured — screenshot + highlight box */}
      <View ref={compositeRef} style={styles.composite} collapsable={false}>
        <Image
          source={{ uri: screenshotUri }}
          style={styles.screenshot}
          resizeMode="stretch"
        />
        {box && box.w > 2 && box.h > 2 && (
          <View
            pointerEvents="none"
            style={[styles.selectionBox, { left: box.x, top: box.y, width: box.w, height: box.h }]}
          />
        )}
      </View>

      {/* Dark overlay — NOT inside compositeRef so it doesn't burn into the image */}
      <View style={styles.overlay} pointerEvents="none" />

      {/* Redraw box above overlay so it's visible while selecting */}
      {box && box.w > 2 && box.h > 2 && (
        <View
          pointerEvents="none"
          style={[styles.selectionBoxOverlay, { left: box.x, top: box.y, width: box.w, height: box.h }]}
        />
      )}

      {/* Full-screen touch capture */}
      <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers} />

      <View style={styles.topBar} pointerEvents="none">
        <Text style={styles.instruction}>
          {hasBox ? 'Seçim tamam — onayla veya yeniden çiz' : 'Sorunlu alanı işaretle'}
        </Text>
      </View>

      <View style={styles.bottomBar} pointerEvents="box-none">
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={burning}>
          <Text style={styles.cancelText}>İptal</Text>
        </TouchableOpacity>
        {hasBox && (
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} disabled={burning}>
            {burning
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.confirmText}>Devam →</Text>
            }
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_W,
    height: SCREEN_H,
    zIndex: 10000,
  },
  composite: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_W,
    height: SCREEN_H,
  },
  screenshot: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_W,
    height: SCREEN_H,
  },
  // Burned into final image — no border opacity trick needed
  selectionBox: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#f6e05e',
    backgroundColor: 'rgba(246,224,94,0.2)',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  // Shown on top of overlay while user is selecting (same visual)
  selectionBoxOverlay: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#f6e05e',
    backgroundColor: 'rgba(246,224,94,0.15)',
    zIndex: 2,
  },
  topBar: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instruction: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 48,
    left: 24,
    right: 24,
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cancelText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: '#e53e3e',
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
