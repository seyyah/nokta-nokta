import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Card } from '../components/Card';

const FILTERS = ['Tümü', 'Devam Eden', 'İncelemede', 'Tamamlanan'];

export const ProjectsScreen = () => {
  const [activeFilter, setActiveFilter] = useState('Tümü');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Projeler</Text>
          <Text style={styles.subtitle}>Ekiplerinizin güncel durumlarını takip edin.</Text>
        </View>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput 
            style={styles.searchInput} 
            placeholder="Proje veya etiket ara..." 
            placeholderTextColor="#9ca3af"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          {FILTERS.map(filter => (
            <TouchableOpacity 
              key={filter} 
              style={[styles.filterPill, activeFilter === filter && styles.activeFilterPill]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.content}>
          <Card 
            icon="📱"
            title="Mobil Tasarım Yenilemesi" 
            subtitle="Tasarım ekibi yeni UI kit'ini test ediyor." 
            progress={85}
          />
          <Card 
            icon="🔌"
            title="Backend API Geçişi" 
            subtitle="Eski sistemden Node.js microservislere geçiş." 
            progress={40}
          />
          <Card 
            icon="🔒"
            title="Güvenlik Denetimi" 
            subtitle="Nokta Audit araçları ile sistemsel açık taraması." 
            progress={15}
          />
          <Card 
            icon="🚀"
            title="Q3 Lansman Kampanyası" 
            subtitle="Pazarlama ekibi medya planlamasını bitirdi." 
            progress={100}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#dbeafe' },
  container: { flexGrow: 1, paddingBottom: 100, backgroundColor: '#dbeafe' },
  header: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 20 },
  title: { fontSize: 32, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 16, color: '#6b7280', marginTop: 8 },
  searchContainer: {
    marginHorizontal: 24,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  searchIcon: { fontSize: 20, marginRight: 12 },
  searchInput: { flex: 1, fontSize: 16, color: '#1f2937' },
  filterContainer: { paddingHorizontal: 24, paddingBottom: 10, gap: 12, marginBottom: 20 },
  filterPill: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeFilterPill: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  filterText: { color: '#4b5563', fontWeight: '600', fontSize: 14 },
  activeFilterText: { color: '#ffffff' },
  content: { paddingHorizontal: 24 },
});
