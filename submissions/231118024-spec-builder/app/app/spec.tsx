import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';

export default function SpecScreen() {
  const { summary, problem, targetAudience, scope } = useLocalSearchParams<{
    summary: string,
    problem: string,
    targetAudience: string,
    scope: string
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleReset = () => {
    router.replace('/');
  };

  const Section = ({ title, content, icon, color }: { title: string, content: string, icon: string, color: string }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={18} color={color} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.contentCard}>
        <Text style={styles.sectionContent}>{content || 'Belirtilmedi'}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
      <ScrollView
        style={{ flex: 1, backgroundColor: '#ffffff' }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[Colors.light.primary, Colors.light.secondary]}
              style={styles.logoGradient}
            >
              <Ionicons name="sparkles" size={32} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={styles.headerTitle}>Fikir Belgesi</Text>
          <Text style={styles.headerSubtitle}>Proje Özeti ve Kapsamı</Text>
        </View>

        <Section title="Fikir Özeti" content={summary || ''} icon="bulb" color="#f59e0b" />
        <Section title="Temel Problem" content={problem || ''} icon="flash" color="#ef4444" />
        <Section title="Hedef Kullanıcılar" content={targetAudience || ''} icon="people" color="#3b82f6" />
        <Section title="MVP Kapsamı" content={scope || ''} icon="rocket" color="#10b981" />

        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={14} color="#2cc95eff" />
            <Text style={styles.badgeText}>Doğrulandı</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="time" size={14} color="#2cc95eff" />
            <Text style={styles.badgeText}>Yeni Nesil</Text>
          </View>
        </View>

        <View style={styles.successCard}>
          <Text style={styles.successText}>Bu spesifikasyon AI tarafından işlendi ve geliştirilmeye hazır hale getirildi.</Text>
        </View>
      </ScrollView>

      <View style={[styles.buttonWrapper, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={handleReset}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.light.primary, Colors.light.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Tamamla ve Ana Sayfaya Dön</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: '#ffffff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    marginBottom: 16,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  logoGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 4,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  contentCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionContent: {
    fontSize: 17,
    color: '#1e293b',
    lineHeight: 26,
    fontWeight: '500',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
    backgroundColor: '#ffffff',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    color: '#2cc95eff',
    fontWeight: '700',
  },
  successCard: {
    backgroundColor: '#f0fdf4',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#dcfce7',
    alignItems: 'center',
  },
  successText: {
    fontSize: 14,
    color: '#166534',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '600',
  },
  buttonWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
  },
  buttonContainer: {
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  button: {
    flexDirection: 'row',
    paddingVertical: 20,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
