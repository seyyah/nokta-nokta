import { StyleSheet, Text, View } from 'react-native';
import { AppScreen } from './BottomTabs';
import { colors } from '../theme';

const titles: Record<AppScreen, { label: string; title: string }> = {
  mirror: { label: 'PHASE A / AYNA', title: 'Voice Avatar' },
  audit: { label: 'PHASE B / SELF AUDIT', title: 'Not & Rapor' },
  forge: { label: 'PHASE B / RATCHET', title: 'Forge Ledger' },
  bridge: { label: 'PHASE C / HITL', title: 'Uzman Koprusu' },
};

export function AppHeader({ screen }: { screen: AppScreen }) {
  const content = titles[screen];
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.label}>{content.label}</Text>
        <Text style={styles.title}>{content.title}</Text>
      </View>
      <View style={styles.identity}>
        <Text style={styles.identityText}>231118040</Text>
        <Text style={styles.identitySub}>Track A</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  label: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: '800',
    marginTop: 3,
  },
  identity: {
    alignItems: 'flex-end',
  },
  identityText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '700',
  },
  identitySub: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 3,
  },
});
