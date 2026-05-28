import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AvatarStage } from '../components/AvatarStage';
import { DictationCard } from '../components/DictationCard';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { palette, spacing } from '../lib/theme';
import { useDictation } from '../lib/useDictation';
import { useVoiceMeter } from '../lib/voiceMeter';

export default function AvatarScreen() {
  const meter = useVoiceMeter();
  const dictation = useDictation();

  return (
    <ScreenScaffold
      title="Avatar mirror"
      subtitle="The same mic level drives the mouth shape while dictated text picks a simple viseme. The final pass swaps the fallback head with your Avaturn avatar.glb."
    >
      <AvatarStage level={meter.level} transcript={dictation.transcript} />

      <View style={styles.controlRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => void (meter.active ? meter.stop() : meter.start())}
          style={({ pressed }) => [
            styles.primaryButton,
            meter.active ? styles.stopButton : null,
            pressed ? styles.pressed : null,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {meter.active ? 'Ses akışını durdur' : 'Sesle konuştur'}
          </Text>
        </Pressable>
      </View>

      <DictationCard dictation={dictation} />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Kritik blocker: avatar.glb</Text>
        <Text style={styles.cardBody}>
          Final kabulünde generic model geçmiyor. Avaturn.me'den kendi yüzünle export
          edilmiş `avatar.glb` dosyasını bu klasöre koymamız gerekiyor:
          `submissions/191118022-nokta-nokta/app/avatar.glb`.
        </Text>
      </View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  controlRow: {
    alignItems: 'stretch',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: palette.accent,
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 18,
  },
  stopButton: {
    backgroundColor: palette.danger,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.82,
  },
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: 26,
    borderWidth: 1,
    gap: 8,
    padding: spacing.card,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  cardBody: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 22,
  },
});
