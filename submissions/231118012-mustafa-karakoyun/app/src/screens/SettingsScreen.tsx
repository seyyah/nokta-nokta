import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Switch, TouchableOpacity } from 'react-native';

export const SettingsScreen = () => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [faceId, setFaceId] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Ayarlar</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Alex Yılmaz</Text>
            <Text style={styles.profileEmail}>alex@nokta-audit.com</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Düzenle</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Tercihler</Text>
        <View style={styles.cardGroup}>
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Text style={styles.settingIcon}>🔔</Text>
              <Text style={styles.settingLabel}>Bildirimler</Text>
            </View>
            <Switch 
              value={pushEnabled} 
              onValueChange={setPushEnabled}
              trackColor={{ false: '#d1d5db', true: '#818cf8' }}
              thumbColor={pushEnabled ? '#4f46e5' : '#f3f4f6'}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Text style={styles.settingIcon}>🌙</Text>
              <Text style={styles.settingLabel}>Karanlık Mod</Text>
            </View>
            <Switch 
              value={darkMode} 
              onValueChange={setDarkMode}
              trackColor={{ false: '#d1d5db', true: '#818cf8' }}
              thumbColor={darkMode ? '#4f46e5' : '#f3f4f6'}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Text style={styles.settingIcon}>🛡️</Text>
              <Text style={styles.settingLabel}>Face ID ile Giriş</Text>
            </View>
            <Switch 
              value={faceId} 
              onValueChange={setFaceId}
              trackColor={{ false: '#d1d5db', true: '#818cf8' }}
              thumbColor={faceId ? '#4f46e5' : '#f3f4f6'}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Diğer</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Yardım Merkezi</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Hizmet Şartları</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Oturumu Kapat</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fafb' },
  container: { flexGrow: 1, paddingBottom: 100, paddingHorizontal: 24 },
  header: { paddingTop: 40, paddingBottom: 20 },
  title: { fontSize: 32, fontWeight: '800', color: '#111827' },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: { color: '#ffffff', fontSize: 24, fontWeight: 'bold' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  profileEmail: { fontSize: 14, color: '#6b7280' },
  editButton: { backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  editButtonText: { color: '#4f46e5', fontWeight: '600', fontSize: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#6b7280', marginBottom: 12, marginLeft: 8, textTransform: 'uppercase' },
  cardGroup: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  settingLabelContainer: { flexDirection: 'row', alignItems: 'center' },
  settingIcon: { fontSize: 20, marginRight: 12 },
  settingLabel: { fontSize: 16, color: '#374151', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginHorizontal: 20 },
  chevron: { fontSize: 24, color: '#9ca3af', fontWeight: '300' },
  logoutButton: {
    backgroundColor: '#fee2e2',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' },
});
