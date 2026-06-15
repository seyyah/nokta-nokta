import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';

export default function CartScreen({ navigation }) {
  const items = [
    { id: 1, title: 'Hero Section Revamp', status: 'Awaiting Sign-off' },
    { id: 2, title: 'Neon Button Component', status: 'Spec Match' },
    { id: 3, title: 'Glass Card Layout', status: 'Vibe Check Passed' },
  ];

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <Text style={styles.brand}>UX_ENGINE</Text>
        <View style={styles.pulse} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Summary Card */}
        <BlurView intensity={20} tint="dark" style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Pending Deployments</Text>
          <Text style={styles.summaryScore}>DESIGN.md Adherence: 98.4%</Text>
          <Text style={styles.summaryDetail}>Structural Integrity: Optimal</Text>
        </BlurView>

        {/* Vibe Previews */}
        <Text style={styles.sectionTitle}>Vibe Previews</Text>
        {items.map((item) => (
          <BlurView key={item.id} intensity={15} tint="dark" style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{item.title}</Text>
            </View>
            <View style={styles.itemBody}>
              <View style={styles.previewBox}>
                <Text style={styles.previewText}>Preview</Text>
              </View>
              <Text style={styles.itemStatus}>Status: {item.status}</Text>
            </View>
          </BlurView>
        ))}
      </ScrollView>

      {/* Footer Actions */}
      <BlurView intensity={30} tint="dark" style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryBtnText}>Approve & Ship to Antigravity</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn}>
          <Text style={styles.secondaryBtnText}>Reject</Text>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'rgba(10, 10, 11, 0.8)',
  },
  brand: {
    color: '#00f5ff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2,
    textShadowColor: '#00f5ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  pulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00f5ff',
    shadowColor: '#00f5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 255, 0.3)',
    marginBottom: 30,
    overflow: 'hidden',
  },
  summaryTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  summaryScore: {
    color: '#00f5ff',
    fontSize: 16,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  summaryDetail: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  itemCard: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 15,
    overflow: 'hidden',
  },
  itemHeader: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 10,
    marginBottom: 10,
  },
  itemTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  itemBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewBox: {
    width: 60,
    height: 40,
    backgroundColor: 'rgba(0, 245, 255, 0.1)',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 255, 0.2)',
  },
  previewText: {
    color: '#00f5ff',
    fontSize: 10,
  },
  itemStatus: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  primaryBtn: {
    backgroundColor: '#00f5ff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#00f5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  primaryBtnText: {
    color: '#0a0a0b',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 255, 0.3)',
  },
  secondaryBtnText: {
    color: '#ff00ff',
    fontSize: 16,
    fontWeight: '600',
  },
});
