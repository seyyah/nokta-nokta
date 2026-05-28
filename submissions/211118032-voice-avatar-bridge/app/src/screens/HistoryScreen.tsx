import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SessionSummary, RootStackParamList } from '../types';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';
import SummaryCard from '../components/SummaryCard';
import { SummaryService } from '../services/summaryService';
import { StorageHelper } from '../storage/storageHelper';

type RootNav = NativeStackNavigationProp<RootStackParamList>;

export default function HistoryScreen() {
  const navigation = useNavigation<RootNav>();
  const [summaries, setSummaries] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await SummaryService.getAllSummaries();
    setSummaries(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Geçmişi Temizle',
      'Tüm geçmiş oturumlar ve talepler kalıcı olarak silinecek. Devam et?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet, Temizle',
          style: 'destructive',
          onPress: async () => {
            setClearing(true);
            await StorageHelper.clearAll();
            setSummaries([]);
            setClearing(false);
          },
        },
      ],
    );
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: SessionSummary }) => (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('Summary', {
            escalationId: item.escalationId,
            summaryId: item.id,
          })
        }
      >
        <SummaryCard summary={item} compact />
      </TouchableOpacity>
    ),
    [navigation],
  );

  if (loading && summaries.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!loading && summaries.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🗂️</Text>
        <Text style={styles.emptyTitle}>Geçmiş oturum yok</Text>
        <Text style={styles.emptyDesc}>
          Tamamlanan mentor görüşmelerinin özetleri{'\n'}burada listelenir.
        </Text>
        <TouchableOpacity
          style={styles.emptyBtn}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Chat' })}
          activeOpacity={0.85}
        >
          <Text style={styles.emptyBtnText}>İlk Sohbeti Başlat</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={summaries}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={load}
          tintColor={Colors.primary}
          colors={[Colors.primary]}
        />
      }
      ListHeaderComponent={
        <View style={styles.listHeader}>
          <Text style={styles.listHeaderText}>
            {summaries.length} tamamlanmış oturum
          </Text>
          <TouchableOpacity
            style={styles.clearAllBtn}
            onPress={handleClearAll}
            disabled={clearing}
            activeOpacity={0.75}
          >
            {clearing ? (
              <ActivityIndicator size="small" color={Colors.error} />
            ) : (
              <Text style={styles.clearAllText}>🗑️ Geçmişi Temizle</Text>
            )}
          </TouchableOpacity>
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
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xl,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  listHeaderText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.error,
    backgroundColor: '#fff5f5',
  },
  clearAllText: {
    fontSize: FontSize.sm,
    color: Colors.error,
    fontWeight: FontWeight.semibold,
  },
});
