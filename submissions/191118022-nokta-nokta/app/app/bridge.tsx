import React, { useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { palette, spacing } from '../lib/theme';
import {
  createJitsiRoomUrl,
  detectBridgeTrigger,
  type ForgeCycleStatus,
} from '../lib/stuckDetector';

const initialCycles: ForgeCycleStatus[] = ['COMMIT', 'ROLLBACK', 'FAIL'];
const roomUrl = createJitsiRoomUrl('191118022', 'nokta-nokta');

export default function BridgeScreen() {
  const [cycles, setCycles] = useState<ForgeCycleStatus[]>(initialCycles);
  const trigger = useMemo(() => detectBridgeTrigger(cycles), [cycles]);

  const openBridge = async () => {
    await Linking.openURL(roomUrl);
  };

  return (
    <ScreenScaffold
      title="Human bridge"
      subtitle="If the forge loop hits two consecutive FAIL/ROLLBACK outcomes, the app exposes a one-tap expert bridge. Jitsi keeps it keyless for the demo."
    >
      <View style={styles.statusCard}>
        <Text style={styles.eyebrow}>STUCK detector</Text>
        <Text style={styles.statusTitle}>
          {trigger.shouldOpenBridge ? 'Uzmana bağlanma zamanı' : 'Forge hala kendi kendine ilerliyor'}
        </Text>
        <Text style={styles.statusBody}>
          {trigger.reason}. Demo için son iki cycle başarısız bırakıldı; gerçek forge
          ledger finalde BRIDGE.md ile eşleşecek.
        </Text>
      </View>

      <View style={styles.timeline}>
        {cycles.map((cycle, index) => (
          <View key={`${cycle}-${index}`} style={styles.cycleRow}>
            <Text style={styles.cycleIndex}>Cycle {index + 1}</Text>
            <Text style={[styles.cycleStatus, getStatusStyle(cycle)]}>{cycle}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setCycles(['COMMIT', 'COMMIT', 'ROLLBACK'])}
          style={({ pressed }) => [styles.secondaryButton, pressed ? styles.pressed : null]}
        >
          <Text style={styles.secondaryButtonText}>Tek hata simüle et</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => setCycles(initialCycles)}
          style={({ pressed }) => [styles.secondaryButton, pressed ? styles.pressed : null]}
        >
          <Text style={styles.secondaryButtonText}>STUCK simüle et</Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={!trigger.shouldOpenBridge}
        onPress={() => void openBridge()}
        style={({ pressed }) => [
          styles.bridgeButton,
          !trigger.shouldOpenBridge ? styles.disabled : null,
          pressed && trigger.shouldOpenBridge ? styles.pressed : null,
        ]}
      >
        <Text style={styles.bridgeButtonText}>Uzmana Bağlan</Text>
      </Pressable>

      <View style={styles.urlCard}>
        <Text style={styles.urlTitle}>Demo odası</Text>
        <Text selectable style={styles.urlText}>{roomUrl}</Text>
        <Text style={styles.urlHint}>
          Demo sırasında uzman kişi masaüstünden bu odaya girip ekran paylaşımını açacak;
          telefondaki uygulama çağrıyı buradan başlatacak.
        </Text>
      </View>
    </ScreenScaffold>
  );
}

function getStatusStyle(status: ForgeCycleStatus) {
  if (status === 'COMMIT') return styles.cycleCOMMIT;
  if (status === 'FAIL') return styles.cycleFAIL;
  if (status === 'ROLLBACK') return styles.cycleROLLBACK;
  return styles.cycleSTUCK;
}

const styles = StyleSheet.create({
  statusCard: {
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: 28,
    borderWidth: 1,
    gap: 8,
    padding: spacing.card,
  },
  eyebrow: {
    color: palette.accent,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statusTitle: {
    color: palette.ink,
    fontSize: 22,
    fontWeight: '900',
  },
  statusBody: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 22,
  },
  timeline: {
    gap: 10,
  },
  cycleRow: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  cycleIndex: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  cycleStatus: {
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 12,
    fontWeight: '900',
  },
  cycleCOMMIT: {
    backgroundColor: palette.accentSoft,
    color: palette.success,
  },
  cycleFAIL: {
    backgroundColor: '#fee2e2',
    color: palette.danger,
  },
  cycleROLLBACK: {
    backgroundColor: palette.accentWarmSoft,
    color: '#b45309',
  },
  cycleSTUCK: {
    backgroundColor: '#fee2e2',
    color: palette.danger,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: palette.surfaceAlt,
    borderColor: palette.line,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  secondaryButtonText: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  bridgeButton: {
    alignItems: 'center',
    backgroundColor: palette.danger,
    borderRadius: 20,
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: 18,
  },
  bridgeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.82,
  },
  urlCard: {
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: 24,
    borderWidth: 1,
    gap: 8,
    padding: spacing.card,
  },
  urlTitle: {
    color: palette.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  urlText: {
    color: palette.accent,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 20,
  },
  urlHint: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 20,
  },
});
