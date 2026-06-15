import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { palette, spacing } from '../lib/theme';

const toggles = [
  {
    title: 'Widget visible in QA builds',
    hint: 'Keep the host shell removable by making the audit layer opt-in for test builds only.',
    value: true,
  },
  {
    title: 'Share markdown after export',
    hint: 'Immediate sharing keeps the report close to the moment the tester sees the bug.',
    value: true,
  },
  {
    title: 'Lock forge writes behind review',
    hint: 'Track A still keeps humans in the merge seat even when agent cycles succeed.',
    value: false,
  },
] as const;

export default function SettingsScreen() {
  return (
    <ScreenScaffold
      title="Runtime policy"
      subtitle="The host remains accountable for visibility, export behavior, and how much of the loop reaches git without another human touch point."
    >
      <View style={styles.panel}>
        {toggles.map((toggle) => (
          <View key={toggle.title} style={styles.row}>
            <View style={styles.copy}>
              <Text style={styles.rowTitle}>{toggle.title}</Text>
              <Text style={styles.rowHint}>{toggle.hint}</Text>
            </View>
            <Switch value={toggle.value} />
          </View>
        ))}
      </View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: palette.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: palette.line,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: spacing.card,
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.line,
  },
  copy: {
    flex: 1,
    gap: 6,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: palette.ink,
  },
  rowHint: {
    fontSize: 13,
    lineHeight: 21,
    color: palette.muted,
  },
});
