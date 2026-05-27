import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../components/Card';
import { useNavigation } from '@react-navigation/native';
import { BridgeModal } from '../components/Bridge/BridgeModal';

const QuickAction = ({ icon, label }: { icon: string, label: string }) => (
  <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
    <View style={styles.actionIconContainer}>
      <Text style={styles.actionIcon}>{icon}</Text>
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [bridgeVisible, setBridgeVisible] = useState(false);
  const [isStuck, setIsStuck] = useState(false);

  const triggerManualBridge = () => {
    setIsStuck(false);
    setBridgeVisible(true);
  };

  const simulateStuckState = () => {
    setIsStuck(true);
    setBridgeVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#4f46e5', '#3b82f6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Text style={styles.greeting}>Günaydın, Mustafa! 👋</Text>
          <Text style={styles.headerSubtitle}>Bugün harika görünüyorsun.</Text>
          
          <View style={styles.statsCard}>
            <View>
              <Text style={styles.statsLabel}>Haftalık Verimlilik</Text>
              <Text style={styles.statsValue}>%84</Text>
            </View>
            <View style={styles.statsBadge}>
              <Text style={styles.statsBadgeText}>+12% Artış</Text>
            </View>
          </View>
        </LinearGradient>

        {/* HITL İnsan Uzman Köprüsü & Stuck Simülasyonu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İnsan Uzman Köprüsü (HITL)</Text>
          <View style={styles.bridgeRow}>
            <TouchableOpacity 
              style={[styles.bridgeButton, styles.expertCallBtn]} 
              activeOpacity={0.8}
              onPress={triggerManualBridge}
            >
              <Text style={styles.bridgeBtnText}>📞 Uzmana Bağlan</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.bridgeButton, styles.stuckSimBtn]} 
              activeOpacity={0.8}
              onPress={simulateStuckState}
            >
              <Text style={styles.bridgeBtnText}>⚠️ Stuck Simüle Et</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.quickAddButton} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Projeler')}
          >
            <Text style={styles.quickAddIcon}>➕</Text>
            <Text style={styles.quickAddText}>Hızlı Proje Ekle</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsContainer}>
            <QuickAction icon="💸" label="Transfer" />
            <QuickAction icon="📊" label="Raporlar" />
            <QuickAction icon="📅" label="Takvim" />
            <QuickAction icon="⚙️" label="Ayarlar" />
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Son Aktiviteler</Text>
          <Card 
            icon="🔔" 
            title="Sistem Güncellemesi" 
            subtitle="V2.4 sürüme geçiş yapıldı." 
            value="10 dk önce" 
          />
          <Card 
            icon="📁" 
            title="Nokta Audit Raporu" 
            subtitle="Aylık denetim raporu onaylandı." 
            value="1 saat önce" 
          />
          <Card 
            icon="🎯" 
            title="Yeni Hedef Eklendi" 
            subtitle="Q3 büyüme hedefleri güncellendi." 
            value="Dün" 
          />
        </View>
      </ScrollView>
      <BridgeModal 
        visible={bridgeVisible} 
        onClose={() => setBridgeVisible(false)} 
        isStuckTriggered={isStuck} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bridgeRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  bridgeButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  expertCallBtn: {
    backgroundColor: '#0f172a',
    shadowColor: '#0f172a',
  },
  stuckSimBtn: {
    backgroundColor: '#dc2626',
    shadowColor: '#dc2626',
  },
  bridgeBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  safeArea: { flex: 1, backgroundColor: '#f9fafb' },
  container: { flexGrow: 1, paddingBottom: 100 },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  greeting: { fontSize: 32, fontWeight: '800', color: '#ffffff', marginBottom: 8 },
  headerSubtitle: { fontSize: 16, color: '#e0e7ff', opacity: 0.9, marginBottom: 24 },
  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  statsLabel: { color: '#e0e7ff', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  statsValue: { color: '#ffffff', fontSize: 36, fontWeight: 'bold' },
  statsBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statsBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  quickAddButton: {
    backgroundColor: '#ef4444',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  quickAddIcon: { fontSize: 24, marginRight: 12 },
  quickAddText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  section: { paddingHorizontal: 24, marginTop: 30 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  actionsContainer: { paddingBottom: 10, gap: 20 },
  actionItem: { alignItems: 'center' },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 8,
  },
  actionIcon: { fontSize: 28 },
  actionLabel: { fontSize: 13, color: '#4b5563', fontWeight: '600' },
});
