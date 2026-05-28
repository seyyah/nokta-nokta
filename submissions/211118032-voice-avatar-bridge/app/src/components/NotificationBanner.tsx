import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Platform,
} from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';

type Props = {
  message: string;
  subMessage?: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  visible: boolean;
  type?: 'info' | 'success' | 'warning';
};

export default function NotificationBanner({
  message,
  subMessage,
  actionLabel,
  onAction,
  onDismiss,
  visible,
  type = 'success',
}: Props) {
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -120,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, opacity]);

  const bgColor =
    type === 'success'
      ? Colors.green
      : type === 'warning'
      ? Colors.amber
      : Colors.primary;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: bgColor, transform: [{ translateY }], opacity },
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <View style={styles.content}>
        <View style={styles.texts}>
          <Text style={styles.message}>{message}</Text>
          {subMessage ? <Text style={styles.subMessage}>{subMessage}</Text> : null}
        </View>
        <View style={styles.actions}>
          {actionLabel && onAction ? (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onAction}
              activeOpacity={0.85}
            >
              <Text style={styles.actionLabel}>{actionLabel}</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn} activeOpacity={0.7}>
            <Text style={styles.dismissIcon}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 0 : 0,
    left: 0,
    right: 0,
    zIndex: 999,
    paddingTop: Platform.OS === 'ios' ? 52 : 12,
    paddingBottom: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  message: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  subMessage: {
    color: Colors.white,
    fontSize: FontSize.sm,
    opacity: 0.85,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  actionLabel: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  dismissBtn: {
    padding: 4,
  },
  dismissIcon: {
    color: Colors.white,
    fontSize: FontSize.md,
    opacity: 0.8,
  },
});
