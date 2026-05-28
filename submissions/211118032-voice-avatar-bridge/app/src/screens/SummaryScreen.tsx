import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, SessionSummary } from '../types';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';
import { SummaryService } from '../services/summaryService';

type Props = NativeStackScreenProps<RootStackParamList, 'Summary'>;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildShareText(summary: SessionSummary): string {
  const recs = summary.mentorRecommendations.map((r, i) => `${i + 1}. ${r}`).join('\n');
  const steps = summary.nextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n');
  return `📋 Nokta Expert Oturum Özeti\n\nKonu: ${summary.topic}\nMentor: ${summary.mentorName}\nTarih: ${formatDate(summary.createdAt)}\n\n💡 Öneriler:\n${recs}\n\n🚀 Sonraki Adımlar:\n${steps}`;
}

export default function SummaryScreen({ navigation, route }: Props) {
  const { summaryId } = route.params;
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await SummaryService.getSummaryById(summaryId);
      setSummary(data);
      setLoading(false);
    })();
  }, [summaryId]);

  const handleShare = async () => {
    if (!summary) return;
    await Share.share({ message: buildShareText(summary) });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Özet bulunamadı.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.successBanner}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successTitle}>Oturum Tamamlandı!</Text>
        <Text style={styles.successDate}>{formatDate(summary.createdAt)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Konu</Text>
        <Text style={styles.cardValue}>{summary.topic}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Mentor</Text>
        <View style={styles.mentorRow}>
          <View style={styles.mentorAvatar}>
            <Text style={styles.mentorAvatarText}>{summary.mentorName.charAt(0)}</Text>
          </View>
          <Text style={styles.mentorName}>{summary.mentorName}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>💡</Text>
          <Text style={styles.sectionTitle}>Mentor Önerileri</Text>
        </View>
        {summary.mentorRecommendations.map((rec, i) => (
          <View key={i} style={styles.listItem}>
            <View style={styles.bullet} />
            <Text style={styles.listText}>{rec}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>🚀</Text>
          <Text style={styles.sectionTitle}>Sonraki Adımlar</Text>
        </View>
        {summary.nextSteps.map((step, i) => (
          <View key={i} style={styles.listItem}>
            <View style={styles.stepNumCircle}>
              <Text style={styles.stepNum}>{i + 1}</Text>
            </View>
            <Text style={styles.listText}>{step}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={handleShare}
          activeOpacity={0.85}
        >
          <Text style={styles.shareBtnText}>📤 Paylaş</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Ana Sayfaya Dön</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('MainTabs', { screen: 'History' })}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText}>Geçmişi Görüntüle</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  successBanner: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
  successIcon: {
    fontSize: 52,
    marginBottom: Spacing.xs,
  },
  successTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  successDate: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    gap: Spacing.sm,
  },
  cardLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  mentorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  mentorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mentorAvatarText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  mentorName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 2,
  },
  sectionIcon: {
    fontSize: FontSize.lg,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingLeft: 2,
  },
  bullet: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 7,
    flexShrink: 0,
  },
  stepNumCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepNum: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  listText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  actions: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  shareBtn: {
    backgroundColor: Colors.secondaryLight,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm + 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  shareBtnText: {
    color: Colors.secondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  secondaryBtn: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryBtnText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
});
