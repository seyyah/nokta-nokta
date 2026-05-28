import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import VoiceVisualizer from '../components/VoiceVisualizer';
import AvatarStage from '../components/AvatarStage';
import StuckBanner from '../components/StuckBanner';
import { voiceMeter } from '../services/voiceMeter';
import { stuckTracker } from '../services/stuckTracker';
import { RootStackParamList } from '../types';
import {
  Colors,
  FontSize,
  FontWeight,
  Radius,
  Spacing,
} from '../constants/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function VoiceStudioScreen() {
  const navigation = useNavigation<Nav>();
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      voiceMeter.stop().catch(() => {});
    };
  }, []);

  // Track perceived latency: time between first non-zero amplitude and now
  useEffect(() => {
    if (!recording) {
      setLatencyMs(null);
      return;
    }
    const startedAt = Date.now();
    let measured = false;
    const unsub = voiceMeter.subscribe((a) => {
      if (!measured && a > 0.15) {
        setLatencyMs(Date.now() - startedAt);
        measured = true;
      }
    });
    return unsub;
  }, [recording]);

  const handleToggle = useCallback(async () => {
    setError(null);
    if (recording) {
      await voiceMeter.stop();
      setRecording(false);
    } else {
      try {
        await voiceMeter.start();
        setRecording(true);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Mikrofon başlatılamadı.';
        setError(msg);
        Alert.alert('Mikrofon hatası', msg);
      }
    }
  }, [recording]);

  const handleConnectExpert = useCallback(
    (cycleId?: string) => {
      navigation.navigate('ExpertBridge', {
        trigger: 'auto',
        stuckCycleId: cycleId,
      });
    },
    [navigation],
  );

  const handleManualBridge = useCallback(() => {
    navigation.navigate('ExpertBridge', { trigger: 'manual' });
  }, [navigation]);

  return (
    <View style={styles.root}>
      <StuckBanner onConnectExpert={handleConnectExpert} />

      <View style={styles.stage}>
        <AvatarStage active={recording} />
        <View style={styles.stageOverlay} pointerEvents="none">
          <Text style={styles.stageLabel}>
            {recording ? '🎙️ Dinliyor' : '⏸️ Bekliyor'}
          </Text>
          {latencyMs !== null && (
            <Text style={styles.latency}>
              latency: {latencyMs}ms {latencyMs < 200 ? '✓' : '⚠'}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.viz}>
        <VoiceVisualizer barCount={24} height={110} active={recording} />
      </View>

      <ScrollView
        style={styles.controls}
        contentContainerStyle={styles.controlsContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={[styles.micBtn, recording && styles.micBtnActive]}
          onPress={handleToggle}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={recording ? 'Mikrofonu durdur' : 'Mikrofonu başlat'}
        >
          <Text style={styles.micIcon}>{recording ? '⏹' : '🎙️'}</Text>
          <Text style={styles.micText}>
            {recording ? 'Durdur' : 'Mikrofonu Aç'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={handleManualBridge}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryIcon}>📞</Text>
          <Text style={styles.secondaryText}>Uzmana Bağlan (manuel)</Text>
        </TouchableOpacity>

        <View style={styles.info}>
          <Text style={styles.infoTitle}>Stüdyo</Text>
          <Text style={styles.infoBody}>
            Mikrofona konuş — barlar canlansın, avatarın dudakları senkron oynasın.
            Hedef: mic-to-mouth latency &lt; 200ms.
          </Text>
          {error && <Text style={styles.error}>{error}</Text>}
          {Platform.OS === 'web' && (
            <Text style={styles.note}>
              Not: Web'de mic erişimi tarayıcı izniyle çalışır. APK/dev-build önerilir.
            </Text>
          )}
        </View>

        <View style={styles.devBlock}>
          <Text style={styles.devTitle}>Forge Cycle Debug</Text>
          <Text style={styles.devBody}>
            Test amaçlı ardışık 2 ROLLBACK üretip STUCK banner'ı tetikleyebilirsin:
          </Text>
          <View style={styles.devRow}>
            <TouchableOpacity
              style={styles.devBtn}
              onPress={async () => {
                await stuckTracker.append({
                  status: 'ROLLBACK',
                  inputReport: 'audit-reports/voice-bug-mentor.md',
                  hypothesis: 'Manual debug rollback',
                  durationMin: 5,
                  notes: 'Dev trigger',
                });
              }}
            >
              <Text style={styles.devBtnText}>+ ROLLBACK</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.devBtn}
              onPress={async () => {
                await stuckTracker.append({
                  status: 'COMMIT',
                  inputReport: 'audit-reports/voice-bug-mentor.md',
                  hypothesis: 'Manual debug commit',
                  durationMin: 5,
                  notes: 'Dev trigger',
                });
              }}
            >
              <Text style={styles.devBtnText}>+ COMMIT</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.devBtn, styles.devBtnDanger]}
              onPress={() => stuckTracker.clear()}
            >
              <Text style={styles.devBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  stage: {
    height: 320,
    backgroundColor: '#0a0e1a',
    overflow: 'hidden',
    position: 'relative',
  },
  stageOverlay: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    alignItems: 'flex-end',
    gap: 4,
  },
  stageLabel: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.md,
  },
  latency: {
    color: '#86efac',
    fontSize: FontSize.xs,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  viz: {
    backgroundColor: '#0a0e1a',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  controls: {
    flex: 1,
  },
  controlsContent: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  micBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.xl,
    minHeight: 60,
    borderWidth: 2,
    borderColor: Colors.primaryDark,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  micBtnActive: {
    backgroundColor: '#dc2626',
    borderColor: '#7f1d1d',
    shadowColor: '#dc2626',
  },
  micIcon: {
    fontSize: 24,
  },
  micText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryIcon: {
    fontSize: FontSize.lg,
  },
  secondaryText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  info: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  infoBody: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  error: {
    fontSize: FontSize.sm,
    color: Colors.error,
    fontWeight: FontWeight.medium,
  },
  note: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  devBlock: {
    backgroundColor: '#fffbeb',
    padding: Spacing.sm + 2,
    borderRadius: Radius.lg,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  devTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: '#92400e',
  },
  devBody: {
    fontSize: FontSize.xs,
    color: '#78350f',
  },
  devRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
    marginTop: Spacing.xs,
  },
  devBtn: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 1,
    borderRadius: Radius.md,
  },
  devBtnDanger: {
    backgroundColor: '#f87171',
  },
  devBtnText: {
    color: '#1f2937',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});
