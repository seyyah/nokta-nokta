import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ideaStorage } from '../utils/ideaStorage';
import type { Idea } from '../types';

export default function ProfileScreen() {
  const [ideas, setIdeas] = useState<Idea[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    const loaded = await ideaStorage.loadIdeas();
    setIdeas(loaded);
  };

  const stats = {
    total: ideas.length,
    seed: ideas.filter((i) => i.status === 'seed').length,
    growing: ideas.filter((i) => i.status === 'growing').length,
    mature: ideas.filter((i) => i.status === 'mature').length,
  };

  const handleClearAll = () => {
    Alert.alert(
      'Tüm Fikirleri Sil',
      'Tüm fikirler silinecek. Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await ideaStorage.saveIdeas([]);
            setIdeas([]);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>N</Text>
        </View>
        <Text style={styles.username}>NOKTA Kullanıcısı</Text>
        <Text style={styles.bio}>Fikir avcısı, yenilik peşinde</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Toplam Fikir</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#422006' }]}>
          <Text style={[styles.statValue, { color: '#FCD34D' }]}>{stats.seed}</Text>
          <Text style={styles.statLabel}>Tohum</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#052E16' }]}>
          <Text style={[styles.statValue, { color: '#34D399' }]}>{stats.growing}</Text>
          <Text style={styles.statLabel}>Büyüyor</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#172554' }]}>
          <Text style={[styles.statValue, { color: '#60A5FA' }]}>{stats.mature}</Text>
          <Text style={styles.statLabel}>Olgun</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hakkında</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            NOKTA, dağınık fikirlerinizi yapılandırılmış spesifikasyonlara dönüştüren
            AI destekli bir mobil kuluçka ekosistemidir.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Özellikler</Text>
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💡</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Fikir Yakalama</Text>
              <Text style={styles.featureDesc}>Ham fikirleri anında kaydet</Text>
            </View>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🌱</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Büyütme</Text>
              <Text style={styles.featureDesc}>Fikirleri aşama aşama geliştir</Text>
            </View>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🐛</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Audit Widget</Text>
              <Text style={styles.featureDesc}>Bug raporla, ekran yakala</Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.dangerButton} onPress={handleClearAll}>
        <Text style={styles.dangerButtonText}>Tüm Verileri Temizle</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>NOKTA v1.0.0</Text>
        <Text style={styles.footerText}>231118098 - Audit Forge Challenge</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 60,
    backgroundColor: '#1E293B',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: '#94A3B8',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 22,
  },
  featureList: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    overflow: 'hidden',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  featureDesc: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  dangerButton: {
    margin: 16,
    backgroundColor: '#7F1D1D',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FCA5A5',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
  },
});
