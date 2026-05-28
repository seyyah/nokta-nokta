import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TabParamList, RootStackParamList } from '../types';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';

type Props = BottomTabScreenProps<TabParamList, 'Home'>;
type RootNav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen({ navigation }: Props) {
  const rootNav = useNavigation<RootNav>();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>N</Text>
            </View>
            <View style={styles.logoAccent} />
          </View>
          <Text style={styles.title}>Nokta · Voice · Avatar · Bridge</Text>
          <Text style={styles.subtitle}>
            Halka kapanışı: kendi yüzün konuşur, sesin görselleşir,{'\n'}
            sıkıştığında insan gelir.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Studio')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Voice Studio aç"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.primaryBtnIcon}>🎙️</Text>
          <View style={styles.btnTextBlock}>
            <Text style={styles.primaryBtnText}>Voice Studio</Text>
            <Text style={styles.btnHint}>Mikrofon · Bar viz · Avatar lipsync →</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bridgeBtn}
          onPress={() => rootNav.navigate('ExpertBridge', { trigger: 'manual' })}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Uzman görüşmesi başlat"
        >
          <Text style={styles.bridgeIcon}>📞</Text>
          <View style={styles.btnTextBlock}>
            <Text style={styles.bridgeText}>Uzmana Bağlan</Text>
            <Text style={styles.bridgeSub}>Görüntülü · ekran paylaşımlı (Jitsi)</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.legacyRow}>
          <TouchableOpacity
            style={styles.legacyBtn}
            onPress={() => navigation.navigate('Chat')}
            activeOpacity={0.7}
          >
            <Text style={styles.legacyIcon}>💬</Text>
            <Text style={styles.legacyText}>Sohbet</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.legacyBtn}
            onPress={() => navigation.navigate('Status')}
            activeOpacity={0.7}
          >
            <Text style={styles.legacyIcon}>📋</Text>
            <Text style={styles.legacyText}>Talepler</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Üç Faz</Text>
          <View style={styles.stepList}>
            {STEPS.map((step, i) => (
              <View key={i} style={styles.step}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{step.tag}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.keywordSection}>
          <Text style={styles.keywordTitle}>Track A — Sadakat odağı</Text>
          <View style={styles.keywordGrid}>
            {KEYWORDS.map((kw) => (
              <View key={kw.label} style={styles.keywordChip}>
                <Text style={styles.keywordIcon}>{kw.icon}</Text>
                <Text style={styles.keywordLabel}>{kw.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const STEPS = [
  {
    tag: 'A',
    title: 'Ayna · Voice + Avatar',
    desc: 'Mikrofona konuş, barlar canlansın, avatarın lipsync oynasın.',
  },
  {
    tag: 'B',
    title: 'Self-as-User · Forge',
    desc: 'Kendi appini denetle, sesli rapor üret, agent fix\'lesin.',
  },
  {
    tag: 'C',
    title: 'Köprü · HITL Bridge',
    desc: '2 cycle ROLLBACK gelirse uzmanı çağır — Jitsi görüntülü.',
  },
];

const KEYWORDS = [
  { icon: '🎙️', label: 'expo-av RMS' },
  { icon: '🪞', label: 'avaturn .glb' },
  { icon: '🧠', label: 'viseme pipeline' },
  { icon: '🛠️', label: 'forge cycles' },
  { icon: '📞', label: 'Jitsi WebRTC' },
  { icon: '⚡', label: '< 200ms latency' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: FontWeight.bold,
  },
  logoAccent: {
    position: 'absolute',
    bottom: -4,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.secondary,
    borderWidth: 3,
    borderColor: Colors.background,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
    minHeight: 64,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
    borderWidth: 2,
    borderColor: '#1d4ed8',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  btnTextBlock: {
    alignItems: 'flex-start',
    gap: 2,
  },
  btnHint: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: FontWeight.medium,
  },
  primaryBtnIcon: {
    fontSize: 24,
  },
  primaryBtnText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  bridgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    minHeight: 56,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
    elevation: 4,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  bridgeIcon: {
    fontSize: 22,
  },
  bridgeText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  bridgeSub: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: FontWeight.medium,
  },
  legacyRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  legacyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  legacyIcon: {
    fontSize: FontSize.md,
  },
  legacyText: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  infoSection: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  infoTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  stepList: {
    gap: Spacing.md,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  stepContent: {
    flex: 1,
    gap: 2,
  },
  stepTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  stepDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  keywordSection: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  keywordTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  keywordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  keywordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 1,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  keywordIcon: {
    fontSize: FontSize.sm,
  },
  keywordLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
});
