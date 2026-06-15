import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';
import { stuckTracker, CycleRecord } from '../services/stuckTracker';

type Props = {
  onConnectExpert: (lastCycleId?: string) => void;
};

/**
 * Ardışık 2 ROLLBACK/FAIL/STUCK varsa görünür; "Uzmana Bağlan" CTA'sı.
 * Track A: manuel tetik. Track C: agent stuckTracker.append() çağırınca
 * otomatik görünür.
 */
export default function StuckBanner({ onConnectExpert }: Props) {
  const [visible, setVisible] = useState(false);
  const [lastCycle, setLastCycle] = useState<CycleRecord | undefined>();
  const slide = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const unsub = stuckTracker.subscribe(({ stuck, recent }) => {
      setVisible(stuck);
      setLastCycle(recent[recent.length - 1]);
    });
    return unsub;
  }, []);

  useEffect(() => {
    Animated.timing(slide, {
      toValue: visible ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [visible, slide]);

  if (!visible && (slide as unknown as { _value: number })._value === 0) return null;

  const translateY = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [-90, 0],
  });

  return (
    <Animated.View style={[styles.wrap, { transform: [{ translateY }] }]} pointerEvents={visible ? 'auto' : 'none'}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>⚠️</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>Ardışık 2 cycle başarısız — STUCK</Text>
        <Text style={styles.subtitle}>
          {lastCycle ? `Son hipotez: ${lastCycle.hypothesis}` : 'Agent çözemedi.'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.cta}
        onPress={() => onConnectExpert(lastCycle?.id)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Uzmana bağlan"
      >
        <Text style={styles.ctaText}>📞 Uzmana Bağlan</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: Radius.lg,
    padding: Spacing.sm + 2,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
    elevation: 3,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: '#7f1d1d',
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: '#991b1b',
  },
  cta: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.md,
  },
  ctaText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
});
