import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Idea, RootStackParamList } from '../types';
import { ideaStorage } from '../utils/ideaStorage';

const statusColors = {
  seed: '#FCD34D',
  growing: '#34D399',
  mature: '#60A5FA',
};

const statusLabels = {
  seed: 'Tohum',
  growing: 'Büyüyor',
  mature: 'Olgun',
};

export default function HomeScreen() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const loadIdeas = useCallback(async () => {
    const loaded = await ideaStorage.loadIdeas();
    setIdeas(loaded);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadIdeas();
    }, [loadIdeas])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadIdeas();
    setRefreshing(false);
  };

  const renderIdea = ({ item }: { item: Idea }) => (
    <TouchableOpacity
      style={styles.ideaCard}
      onPress={() => navigation.navigate('IdeaDetail', { ideaId: item.id })}
    >
      <View style={styles.ideaHeader}>
        <Text style={styles.ideaTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
          <Text style={styles.statusText}>{statusLabels[item.status]}</Text>
        </View>
      </View>
      <Text style={styles.ideaDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.tagsContainer}>
        {item.tags.slice(0, 3).map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NOKTA</Text>
        <Text style={styles.headerSubtitle}>Fikirlerini yakala, büyüt</Text>
      </View>

      {ideas.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💡</Text>
          <Text style={styles.emptyText}>Henüz fikir yok</Text>
          <Text style={styles.emptySubtext}>İlk fikrini eklemek için + butonuna dokun</Text>
        </View>
      ) : (
        <FlatList
          data={ideas}
          renderItem={renderIdea}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddIdea')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1E293B',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  ideaCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  ideaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ideaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  ideaDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});
