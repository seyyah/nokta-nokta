import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Escalation, RootStackParamList } from '../types';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';
import EscalationCard from '../components/EscalationCard';
import { useEscalations } from '../hooks/useEscalations';

type RootNav = NativeStackNavigationProp<RootStackParamList>;

export default function StatusScreen() {
  const navigation = useNavigation<RootNav>();
  const { escalations, loading, refresh } = useEscalations();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleCardPress = useCallback(
    (escalation: Escalation) => {
      if (escalation.status === 'accepted') {
        navigation.navigate('Mentor', { escalationId: escalation.id });
      }
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Escalation }) => (
      <EscalationCard
        escalation={item}
        onPress={() => handleCardPress(item)}
        showAction={item.status === 'accepted'}
        actionLabel="Mentorla Görüş →"
      />
    ),
    [handleCardPress],
  );

  if (loading && escalations.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!loading && escalations.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📭</Text>
        <Text style={styles.emptyTitle}>Henüz talep yok</Text>
        <Text style={styles.emptyDesc}>
          Sohbet sırasında uzman desteği istediğinde{'\n'}talepler burada görünür.
        </Text>
        <TouchableOpacity
          style={styles.emptyBtn}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Chat' })}
          activeOpacity={0.85}
        >
          <Text style={styles.emptyBtnText}>Sohbet Başlat</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const pending = escalations.filter((e) => e.status === 'pending');
  const accepted = escalations.filter((e) => e.status === 'accepted');
  const resolved = escalations.filter((e) => e.status === 'resolved');

  return (
    <FlatList
      data={escalations}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refresh}
          tintColor={Colors.primary}
          colors={[Colors.primary]}
        />
      }
      ListHeaderComponent={
        <View style={styles.statsRow}>
          {[
            { count: pending.length, label: 'bekliyor', color: Colors.amber },
            { count: accepted.length, label: 'kabul edildi', color: Colors.blue },
            { count: resolved.length, label: 'tamamlandı', color: Colors.green },
          ].map((stat) => (
            <View key={stat.label} style={styles.statPill}>
              <View style={[styles.statDot, { backgroundColor: stat.color }]} />
              <Text style={styles.statText}>
                {stat.count} {stat.label}
              </Text>
            </View>
          ))}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.background,
    gap: Spacing.sm,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyBtn: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 4,
    borderRadius: Radius.lg,
  },
  emptyBtnText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  list: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
});
