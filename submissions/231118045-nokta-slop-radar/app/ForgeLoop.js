import React, { useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const COLORS = {
  shell: '#121720',
  shellAlt: '#0B1119',
  border: '#273243',
  borderStrong: '#37506C',
  primary: '#8BF3FF',
  textMain: '#F4F7FB',
  textDim: '#91A0B4',
  textSoft: '#6E7C8E',
  success: '#59F2A4',
  danger: '#FF5C77',
  warning: '#FFB347',
};

function ActionButton({ label, tone, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.actionButton,
        tone === 'success' && styles.successButton,
        tone === 'danger' && styles.dangerButton,
        tone === 'warning' && styles.warningButton,
      ]}
      onPress={onPress}
    >
      <Text style={styles.actionButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function ForgeLoop({ onStatusChange }) {
  const [cycles, setCycles] = useState([]);
  const [consecutiveFails, setConsecutiveFails] = useState(0);

  const loopState = consecutiveFails >= 2 ? 'STUCK' : cycles.length === 0 ? 'IDLE' : 'ACTIVE';

  const stateCopy = useMemo(() => {
    if (loopState === 'STUCK') {
      return 'Two consecutive broken cycles were detected. Escalation is now recommended.';
    }

    if (loopState === 'ACTIVE') {
      return 'The loop is collecting cycle outcomes and monitoring for repeated failure.';
    }

    return 'No cycle has been recorded yet. Start by simulating a forge outcome.';
  }, [loopState]);

  const addCycle = (status) => {
    const nextCycles = [
      ...cycles,
      { id: cycles.length + 1, status, time: new Date().toLocaleTimeString() },
    ];
    setCycles(nextCycles);

    if (status === 'FAIL' || status === 'ROLLBACK') {
      const nextFails = consecutiveFails + 1;
      setConsecutiveFails(nextFails);
      if (nextFails >= 2) {
        onStatusChange('STUCK');
      }
      return;
    }

    setConsecutiveFails(0);
    onStatusChange('OK');
  };

  const connectExpert = () => {
    Linking.openURL('https://meet.jit.si/NoktaExpertCall');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>FORGE LOOP</Text>
          <Text style={styles.title}>Repair timeline and escalation controls</Text>
          <Text style={styles.description}>{stateCopy}</Text>
        </View>

        <View
          style={[
            styles.statePill,
            loopState === 'STUCK' && styles.statePillDanger,
            loopState === 'ACTIVE' && styles.statePillActive,
          ]}
        >
          <Text
            style={[
              styles.statePillText,
              loopState === 'STUCK' && styles.statePillTextDanger,
              loopState === 'ACTIVE' && styles.statePillTextActive,
            ]}
          >
            {loopState}
          </Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <ActionButton label="Mark Success" tone="success" onPress={() => addCycle('SUCCESS')} />
        <ActionButton label="Mark Fail" tone="danger" onPress={() => addCycle('FAIL')} />
        <ActionButton label="Mark Rollback" tone="warning" onPress={() => addCycle('ROLLBACK')} />
      </View>

      <View style={styles.timelineCard}>
        <View style={styles.timelineHeader}>
          <Text style={styles.timelineTitle}>Cycle Timeline</Text>
          <Text style={styles.timelineMeta}>
            {cycles.length} cycle{cycles.length === 1 ? '' : 's'}
          </Text>
        </View>

        <ScrollView style={styles.logBox} showsVerticalScrollIndicator={false}>
          {cycles.length === 0 ? (
            <Text style={styles.emptyText}>No cycles yet. Record a result to populate the forge timeline.</Text>
          ) : (
            cycles.map((cycle) => (
              <View key={cycle.id} style={styles.logRow}>
                <View
                  style={[
                    styles.logMarker,
                    cycle.status === 'SUCCESS' && styles.logMarkerSuccess,
                    cycle.status === 'FAIL' && styles.logMarkerDanger,
                    cycle.status === 'ROLLBACK' && styles.logMarkerWarning,
                  ]}
                />
                <View style={styles.logCopy}>
                  <Text style={styles.logTitle}>
                    Cycle #{cycle.id} · {cycle.status}
                  </Text>
                  <Text style={styles.logTime}>{cycle.time}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {loopState === 'STUCK' && (
        <View style={styles.stuckCard}>
          <Text style={styles.stuckTitle}>Expert bridge recommended</Text>
          <Text style={styles.stuckText}>
            The loop repeated a broken outcome twice. Open the expert bridge to continue with a human in the loop.
          </Text>
          <TouchableOpacity style={styles.bridgeButton} onPress={connectExpert}>
            <Text style={styles.bridgeButtonText}>Open Expert Bridge</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.shell,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    gap: 16,
  },
  headerRow: {
    gap: 12,
  },
  headerCopy: {
    gap: 6,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  title: {
    color: COLORS.textMain,
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '800',
  },
  description: {
    color: COLORS.textDim,
    fontSize: 14,
    lineHeight: 21,
  },
  statePill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: '#111925',
  },
  statePillActive: {
    borderColor: '#31524B',
  },
  statePillDanger: {
    borderColor: '#6F3242',
    backgroundColor: '#25131A',
  },
  statePillText: {
    color: COLORS.textDim,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  statePillTextActive: {
    color: COLORS.success,
  },
  statePillTextDanger: {
    color: COLORS.danger,
  },
  actionsRow: {
    gap: 10,
  },
  actionButton: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  successButton: {
    backgroundColor: '#10231B',
    borderColor: '#31524B',
  },
  dangerButton: {
    backgroundColor: '#25131A',
    borderColor: '#6F3242',
  },
  warningButton: {
    backgroundColor: '#251B0D',
    borderColor: '#6E4A1F',
  },
  actionButtonText: {
    color: COLORS.textMain,
    fontSize: 14,
    fontWeight: '800',
  },
  timelineCard: {
    backgroundColor: COLORS.shellAlt,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 12,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  timelineTitle: {
    color: COLORS.textMain,
    fontSize: 18,
    fontWeight: '800',
  },
  timelineMeta: {
    color: COLORS.textSoft,
    fontSize: 12,
    fontWeight: '700',
  },
  logBox: {
    maxHeight: 180,
  },
  emptyText: {
    color: COLORS.textSoft,
    fontSize: 14,
    lineHeight: 21,
  },
  logRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#18202C',
  },
  logMarker: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginTop: 5,
    backgroundColor: COLORS.textSoft,
  },
  logMarkerSuccess: {
    backgroundColor: COLORS.success,
  },
  logMarkerDanger: {
    backgroundColor: COLORS.danger,
  },
  logMarkerWarning: {
    backgroundColor: COLORS.warning,
  },
  logCopy: {
    flex: 1,
    gap: 3,
  },
  logTitle: {
    color: COLORS.textMain,
    fontSize: 14,
    fontWeight: '700',
  },
  logTime: {
    color: COLORS.textSoft,
    fontSize: 12,
  },
  stuckCard: {
    backgroundColor: '#25131A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6F3242',
    padding: 16,
    gap: 10,
  },
  stuckTitle: {
    color: COLORS.danger,
    fontSize: 18,
    fontWeight: '900',
  },
  stuckText: {
    color: COLORS.textDim,
    fontSize: 14,
    lineHeight: 21,
  },
  bridgeButton: {
    marginTop: 4,
    borderRadius: 16,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    paddingVertical: 14,
  },
  bridgeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
