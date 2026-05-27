import React, { useMemo, useRef, useState } from 'react';
import {
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AuditNoteBounds } from './types';

interface Props {
  screenshot: string;
  onCancel: () => void;
  onConfirm: (payload: { screenshot: string; bounds: AuditNoteBounds | null }) => void;
  captureRef: (ref: any) => Promise<string>;
}

export function AuditSelector({ screenshot, onCancel, onConfirm, captureRef }: Props) {
  const compositeRef = useRef<View>(null);
  const startRef = useRef({ x: 0, y: 0 });
  const [bounds, setBounds] = useState<AuditNoteBounds | null>(null);
  const [saving, setSaving] = useState(false);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: event => {
          const { locationX, locationY } = event.nativeEvent;
          startRef.current = { x: locationX, y: locationY };
          setBounds({ x: locationX, y: locationY, width: 0, height: 0 });
        },
        onPanResponderMove: event => {
          const { locationX, locationY } = event.nativeEvent;
          const x = Math.min(startRef.current.x, locationX);
          const y = Math.min(startRef.current.y, locationY);
          setBounds({
            x,
            y,
            width: Math.abs(locationX - startRef.current.x),
            height: Math.abs(locationY - startRef.current.y),
          });
        },
      }),
    [],
  );

  const confirmSelection = async () => {
    if (saving) return;
    const validBounds = bounds && bounds.width >= 10 && bounds.height >= 10 ? bounds : null;
    setSaving(true);
    try {
      const burnedScreenshot = compositeRef.current
        ? await captureRef(compositeRef.current)
        : screenshot;
      onConfirm({ screenshot: burnedScreenshot, bounds: validBounds });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <View ref={compositeRef} collapsable={false} style={styles.captureSurface} {...panResponder.panHandlers}>
        <Image source={{ uri: screenshot }} style={styles.screenshot} resizeMode="cover" />
        <View style={styles.dim} pointerEvents="none" />
        {bounds ? (
          <View
            pointerEvents="none"
            style={[
              styles.selection,
              {
                left: bounds.x,
                top: bounds.y,
                width: Math.max(1, bounds.width),
                height: Math.max(1, bounds.height),
              },
            ]}
          />
        ) : null}
      </View>
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
          <Text style={styles.secondaryText}>Vazgec</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={confirmSelection} disabled={saving}>
          <Text style={styles.primaryText}>{saving ? 'Hazirlaniyor' : 'Devam'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    backgroundColor: '#111827',
  },
  captureSurface: {
    flex: 1,
    overflow: 'hidden',
  },
  screenshot: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.24)',
  },
  selection: {
    position: 'absolute',
    borderWidth: 4,
    borderColor: '#facc15',
    backgroundColor: 'rgba(250, 204, 21, 0.14)',
  },
  toolbar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 34,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#111827',
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  secondaryText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
});
