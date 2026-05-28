import * as Linking from 'expo-linking';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { FORGE_CYCLES } from '@/src/data/forge-cycles';

const JITSI_ROOM = 'https://meet.jit.si/nokta-231118062-forge-bridge';

function shouldTriggerBridge() {
  let streak = 0;
  for (const cycle of FORGE_CYCLES) {
    if (cycle.result === 'ROLLBACK' || cycle.result === 'STUCK') {
      streak += 1;
      if (streak >= 2) {
        return true;
      }
    } else {
      streak = 0;
    }
  }
  return false;
}

export default function ForgeScreen() {
  const bridgeReady = shouldTriggerBridge();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Phase C</Text>
          <Text style={styles.title}>Forge bridge</Text>
          <Text style={styles.subtitle}>
            Agent iki cycle ust uste ROLLBACK/STUCK gorurse expert bridge otomatik acilir.
          </Text>
        </View>

        <View style={[styles.bridgeCard, bridgeReady && styles.bridgeReady]}>
          <Text style={styles.bridgeTitle}>
            {bridgeReady ? 'Expert bridge tetiklendi' : 'Bridge beklemede'}
          </Text>
          <Text style={styles.bridgeText}>
            Jitsi odasi ses, video ve ekran paylasimi demosu icin hazir. Arkadasin laptopla
            ayni linke girip ekran paylasir.
          </Text>
          <TouchableOpacity
            disabled={!bridgeReady}
            style={[styles.bridgeButton, !bridgeReady && styles.bridgeButtonDisabled]}
            onPress={() => Linking.openURL(JITSI_ROOM)}>
            <Text style={styles.bridgeButtonText}>Uzmana Baglan</Text>
          </TouchableOpacity>
          <Text style={styles.room}>{JITSI_ROOM}</Text>
        </View>

        {FORGE_CYCLES.map((cycle) => (
          <View key={cycle.id} style={styles.cycleCard}>
            <View style={styles.cycleTop}>
              <Text style={styles.cycleNo}>Cycle {cycle.id}</Text>
              <Text style={[styles.badge, styles[`badge${cycle.result}`]]}>{cycle.result}</Text>
            </View>
            <Text style={styles.report}>{cycle.report}</Text>
            <Text style={styles.hypothesis}>{cycle.hypothesis}</Text>
            <Text style={styles.meta}>Tests: {cycle.tests}</Text>
            <Text style={styles.meta}>Kg: {cycle.kg} | Human touch: {cycle.humanTouches}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f4f7f8',
    flex: 1,
  },
  content: {
    gap: 14,
    padding: 20,
    paddingBottom: 48,
  },
  header: {
    gap: 8,
  },
  eyebrow: {
    color: '#245a53',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#17212b',
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: '#53606f',
    fontSize: 15,
    lineHeight: 22,
  },
  bridgeCard: {
    backgroundColor: '#ffffff',
    borderColor: '#d7e0e6',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  bridgeReady: {
    borderColor: '#2ab69d',
  },
  bridgeTitle: {
    color: '#17212b',
    fontSize: 19,
    fontWeight: '800',
  },
  bridgeText: {
    color: '#53606f',
    fontSize: 14,
    lineHeight: 20,
  },
  bridgeButton: {
    alignItems: 'center',
    backgroundColor: '#2ab69d',
    borderRadius: 8,
    paddingVertical: 13,
  },
  bridgeButtonDisabled: {
    backgroundColor: '#b8c4cc',
  },
  bridgeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  room: {
    color: '#245a53',
    fontSize: 12,
  },
  cycleCard: {
    backgroundColor: '#ffffff',
    borderColor: '#d7e0e6',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  cycleTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cycleNo: {
    color: '#17212b',
    fontSize: 16,
    fontWeight: '800',
  },
  badge: {
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeSUCCESS: {
    backgroundColor: '#d9f6ed',
    color: '#11614f',
  },
  badgeROLLBACK: {
    backgroundColor: '#ffe3df',
    color: '#a23830',
  },
  badgeSTUCK: {
    backgroundColor: '#fff0c4',
    color: '#74540a',
  },
  report: {
    color: '#245a53',
    fontSize: 13,
    fontWeight: '700',
  },
  hypothesis: {
    color: '#2b3543',
    fontSize: 14,
    lineHeight: 20,
  },
  meta: {
    color: '#6a7584',
    fontSize: 12,
  },
});
