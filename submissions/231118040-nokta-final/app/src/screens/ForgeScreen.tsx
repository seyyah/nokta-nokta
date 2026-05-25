import { AlertCircle, CheckCircle2, PhoneCall, RotateCcw } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { cycles, type CycleStatus } from '../data/cycles';
import { colors } from '../theme';

function StatusIcon({ status }: { status: CycleStatus }) {
  if (status === 'COMMIT') {
    return <CheckCircle2 color={colors.voice} size={18} />;
  }
  if (status === 'ROLLBACK') {
    return <RotateCcw color={colors.warning} size={18} />;
  }
  return <AlertCircle color={colors.danger} size={18} />;
}

export function ForgeScreen({ openBridge }: { openBridge: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.summary}>
        <View>
          <Text style={styles.summaryLabel}>RATCHET LOAD</Text>
          <Text style={styles.summaryValue}>11 kg</Text>
        </View>
        <View style={styles.divider} />
        <View>
          <Text style={styles.summaryLabel}>HUMAN TOUCH</Text>
          <Text style={styles.summaryValue}>01 pending</Text>
        </View>
      </View>

      {cycles.map((cycle) => (
        <View key={cycle.id} style={styles.cycle}>
          <View style={styles.cycleTop}>
            <View style={styles.status}>
              <StatusIcon status={cycle.status} />
              <Text style={styles.cycleTitle}>Cycle {cycle.id} / {cycle.slug}</Text>
            </View>
            <Text style={styles.duration}>{cycle.duration} min</Text>
          </View>
          <Text style={styles.file}>{cycle.input}</Text>
          <Text style={styles.detail}>{cycle.summary}</Text>
          <View style={[styles.pill, cycle.status === 'STUCK' && styles.pillStuck]}>
            <Text style={[styles.pillText, cycle.status === 'STUCK' && styles.pillStuckText]}>
              STATUS: {cycle.status}
            </Text>
          </View>
        </View>
      ))}

      <Pressable onPress={openBridge} style={styles.bridgeButton}>
        <PhoneCall color="#ffffff" size={20} />
        <View>
          <Text style={styles.bridgeTitle}>Uzmana Baglan</Text>
          <Text style={styles.bridgeSub}>Cycle 4 STUCK / human bridge required</Text>
        </View>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 10,
    paddingBottom: 92,
    paddingHorizontal: 18,
  },
  summary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 18,
    padding: 15,
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
  },
  summaryValue: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '800',
    marginTop: 4,
  },
  divider: {
    backgroundColor: colors.border,
    width: 1,
  },
  cycle: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 13,
  },
  cycleTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  status: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  cycleTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  duration: {
    color: colors.muted,
    fontSize: 11,
  },
  file: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 10,
  },
  detail: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.canvas,
    borderRadius: 5,
    marginTop: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  pillStuck: {
    backgroundColor: '#ffe7eb',
  },
  pillText: {
    color: colors.ink,
    fontSize: 10,
    fontWeight: '800',
  },
  pillStuckText: {
    color: colors.danger,
  },
  bridgeButton: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 11,
    marginTop: 4,
    minHeight: 64,
    paddingHorizontal: 16,
  },
  bridgeTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  bridgeSub: {
    color: '#ffe9ed',
    fontSize: 11,
    marginTop: 2,
  },
});
