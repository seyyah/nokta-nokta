import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList, Idea } from '../types';
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

export default function IdeaDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'IdeaDetail'>>();
  const [idea, setIdea] = useState<Idea | null>(null);

  useEffect(() => {
    loadIdea();
  }, []);

  const loadIdea = async () => {
    const ideas = await ideaStorage.loadIdeas();
    const found = ideas.find((i) => i.id === route.params.ideaId);
    setIdea(found || null);
  };

  const handleDelete = () => {
    Alert.alert(
      'Fikri Sil',
      'Bu fikri silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await ideaStorage.deleteIdea(route.params.ideaId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleStatusChange = async (newStatus: Idea['status']) => {
    if (!idea) return;
    await ideaStorage.updateIdea(idea.id, { status: newStatus });
    setIdea({ ...idea, status: newStatus });
  };

  if (!idea) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{idea.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[idea.status] }]}>
            <Text style={styles.statusText}>{statusLabels[idea.status]}</Text>
          </View>
        </View>

        <Text style={styles.date}>
          Oluşturulma: {idea.createdAt.toLocaleDateString('tr-TR')}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Açıklama</Text>
          <Text style={styles.description}>{idea.description}</Text>
        </View>

        {idea.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Etiketler</Text>
            <View style={styles.tagsContainer}>
              {idea.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Durumu Güncelle</Text>
          <View style={styles.statusButtons}>
            {(['seed', 'growing', 'mature'] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.statusButton,
                  idea.status === s && { backgroundColor: statusColors[s] },
                ]}
                onPress={() => handleStatusChange(s)}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    idea.status === s && styles.statusButtonTextActive,
                  ]}
                >
                  {statusLabels[s]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Fikri Sil</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 20,
  },
  loadingText: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  date: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#E2E8F0',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#CBD5E1',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  statusButtonTextActive: {
    color: '#0F172A',
  },
  deleteButton: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
