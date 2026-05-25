import { Bug, Hammer, UserRound, Video } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export type AppScreen = 'mirror' | 'audit' | 'forge' | 'bridge';

type Props = {
  active: AppScreen;
  onChange: (screen: AppScreen) => void;
};

const tabs = [
  { id: 'mirror' as const, label: 'Ayna', Icon: UserRound },
  { id: 'audit' as const, label: 'Audit', Icon: Bug },
  { id: 'forge' as const, label: 'Forge', Icon: Hammer },
  { id: 'bridge' as const, label: 'Kopru', Icon: Video },
];

export function BottomTabs({ active, onChange }: Props) {
  return (
    <View style={styles.tabs}>
      {tabs.map(({ Icon, id, label }) => {
        const selected = active === id;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            key={id}
            onPress={() => onChange(id)}
            style={[styles.tab, selected && styles.tabSelected]}
          >
            <Icon color={selected ? colors.accent : colors.muted} size={20} strokeWidth={selected ? 2.4 : 1.8} />
            <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    height: 68,
    paddingHorizontal: 10,
    paddingTop: 7,
  },
  tab: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  tabSelected: {
    backgroundColor: colors.accentSoft,
  },
  text: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  textSelected: {
    color: colors.accent,
  },
});
