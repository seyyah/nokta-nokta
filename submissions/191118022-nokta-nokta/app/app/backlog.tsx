import React from 'react';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { palette, spacing } from '../lib/theme';

const cards = [
  {
    title: 'Hero CTA wraps on narrow devices',
    stage: 'Needs forge',
    tags: ['home-screen', 'layout-overflow', 'small-device-only'],
    body: 'The action row is still locked to fixed-width buttons, which leaves almost no escape hatch on smaller Android widths.',
  },
  {
    title: 'Backlog chips collapse into the edge',
    stage: 'Observed in test pass',
    tags: ['card-grid', 'chip-alignment', 'overflow-risk'],
    body: 'Severity and owner chips stay on one line, so long labels start pushing the content block off rhythm.',
  },
  {
    title: 'Settings hint contrast is too soft',
    stage: 'Queued',
    tags: ['settings', 'contrast', 'readability'],
    body: 'Muted helper copy fades into the paper background and gets harder to scan during quick QA passes.',
  },
] as const;

export default function BacklogScreen() {
  return (
    <ScreenScaffold
      title="Bug backlog"
      subtitle="Three candidate issues sit here before being captured through the audit widget. The screen is intentionally dense enough to surface chip wrapping and spacing problems."
    >
      <View style={styles.list}>
        {cards.map((card) => (
          <View key={card.title} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.stage}>{card.stage}</Text>
            </View>
            <View style={styles.tags}>
              {card.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.cardBody}>{card.body}</Text>
          </View>
        ))}
      </View>

      <Link href="/insights" asChild>
        <Pressable style={styles.linkButton}>
          <Text style={styles.linkButtonText}>Open cycle insights</Text>
        </Pressable>
      </Link>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 14,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    padding: spacing.card,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 12,
  },
  cardHeader: {
    gap: 8,
  },
  cardTitle: {
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '800',
    color: palette.ink,
  },
  stage: {
    alignSelf: 'flex-start',
    backgroundColor: palette.accentWarmSoft,
    color: palette.accentWarm,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontWeight: '700',
    fontSize: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 8,
    rowGap: 8,
  },
  tag: {
    backgroundColor: '#f2ede4',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  tagText: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: '700',
  },
  cardBody: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 23,
  },
  linkButton: {
    backgroundColor: palette.ink,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
});
