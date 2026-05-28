import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PHASES = [
  {
    href: './voice',
    label: 'Phase A',
    title: 'Voice visualizer',
    body: 'expo-av mikrofon metering ile bar ve wave animasyonu.',
  },
  {
    href: './avatar',
    label: 'Phase B',
    title: 'Avatar lipsync',
    body: 'Kendi avatar.glb modelin ve RMS tabanli viseme pipeline.',
  },
  {
    href: './forge',
    label: 'Phase C',
    title: 'Forge expert bridge',
    body: '2 ardil rollback/stuck sonrasi Jitsi expert call tetigi.',
  },
] as const;

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Final hafta</Text>
          <Text style={styles.title}>Nokta voice avatar forge</Text>
          <Text style={styles.subtitle}>
            Sesin gorsellesir, avatarin konusur, forge dongusu takilinca insan uzmana acilir.
          </Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Teslim durumu</Text>
          <Text style={styles.statusText}>Track: C - STUCK heuristigi + Expert Bridge</Text>
          <Text style={styles.statusText}>avatar.glb: ana klasor + app asset olarak baglandi</Text>
          <Text style={styles.statusText}>Jitsi: forge ekranindaki Uzmana Baglan butonu</Text>
        </View>

        {PHASES.map((phase) => (
          <TouchableOpacity
            key={phase.href}
            style={styles.phaseCard}
            onPress={() => router.push(phase.href)}>
            <Text style={styles.phaseLabel}>{phase.label}</Text>
            <Text style={styles.phaseTitle}>{phase.title}</Text>
            <Text style={styles.phaseBody}>{phase.body}</Text>
          </TouchableOpacity>
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
  hero: {
    backgroundColor: '#10131b',
    borderRadius: 8,
    gap: 10,
    padding: 20,
  },
  kicker: {
    color: '#58f0d5',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#ffffff',
    fontSize: 31,
    fontWeight: '800',
    lineHeight: 37,
  },
  subtitle: {
    color: '#b9c3d1',
    fontSize: 15,
    lineHeight: 22,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderColor: '#d7e0e6',
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 16,
  },
  statusTitle: {
    color: '#17212b',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  statusText: {
    color: '#53606f',
    fontSize: 14,
  },
  phaseCard: {
    backgroundColor: '#ffffff',
    borderColor: '#d7e0e6',
    borderRadius: 8,
    borderWidth: 1,
    gap: 7,
    padding: 16,
  },
  phaseLabel: {
    color: '#245a53',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  phaseTitle: {
    color: '#17212b',
    fontSize: 20,
    fontWeight: '800',
  },
  phaseBody: {
    color: '#53606f',
    fontSize: 14,
    lineHeight: 20,
  },
});
