import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState
} from "expo-audio";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import { colors, radius, spacing, typography } from "../constants/theme";

const BAR_COUNT = 12;
const MIN_IDLE_LEVEL = 0.08;
const LEVEL_PUBLISH_INTERVAL_MS = 100;

function normalizeMetering(metering) {
  if (typeof metering !== "number" || Number.isNaN(metering)) {
    return null;
  }

  const clamped = Math.max(-60, Math.min(0, metering));
  return Math.max(MIN_IDLE_LEVEL, (clamped + 60) / 60);
}

export default function VoiceVisualizer({ onLevelChange }) {
  const fallbackTickRef = useRef(0);
  const lastPublishedAtRef = useRef(0);
  const animatedLevel = useRef(new Animated.Value(MIN_IDLE_LEVEL)).current;
  const recordingOptions = useMemo(
    () => ({
      ...RecordingPresets.HIGH_QUALITY,
      isMeteringEnabled: true
    }),
    []
  );
  const recorder = useAudioRecorder(recordingOptions, (status) => {
    if (status.hasError) {
      setMessage(`Mikrofon hatasi: ${status.error || "bilinmeyen hata"}`);
    }
  });
  const recorderState = useAudioRecorderState(recorder, 100);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(MIN_IDLE_LEVEL);
  const [message, setMessage] = useState("Mikrofon hazir. Dinlemeyi baslat.");

  const bars = useMemo(() => Array.from({ length: BAR_COUNT }, (_, index) => index), []);

  const publishLevel = (nextLevel, options = {}) => {
    const bounded = Math.max(MIN_IDLE_LEVEL, Math.min(1, nextLevel));
    const now = Date.now();

    if (!options.force && now - lastPublishedAtRef.current < LEVEL_PUBLISH_INTERVAL_MS) {
      return;
    }

    lastPublishedAtRef.current = now;
    setVoiceLevel(bounded);
    onLevelChange?.(bounded);
    Animated.timing(animatedLevel, {
      toValue: bounded,
      duration: 90,
      useNativeDriver: false
    }).start();
  };

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    const meteredLevel = normalizeMetering(recorderState.metering);

    if (meteredLevel !== null) {
      publishLevel(meteredLevel);
      setMessage("Ses seviyesi expo-audio metering ile okunuyor.");
      return;
    }

    fallbackTickRef.current += 1;
    const fallbackLevel = 0.14 + Math.abs(Math.sin(fallbackTickRef.current / 2.6)) * 0.22;
    publishLevel(fallbackLevel);
    setMessage("Metering yok; kayit durumu uzerinden fallback animasyon kullaniliyor.");
  }, [isRecording, recorderState.durationMillis, recorderState.metering]);

  const ensurePermission = async () => {
    const permission = await requestRecordingPermissionsAsync();
    setPermissionStatus(permission.status);
    return permission.granted || permission.status === "granted";
  };

  const startRecording = async () => {
    setMessage("Mikrofon izni kontrol ediliyor.");
    const granted = await ensurePermission();

    if (!granted) {
      setMessage("Mikrofon izni verilmedi. Ayarlardan mikrofon iznini acin.");
      publishLevel(MIN_IDLE_LEVEL, { force: true });
      return;
    }

    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true
    });

    await recorder.prepareToRecordAsync(recordingOptions);
    recorder.record();
    setIsRecording(true);
    setMessage("Dinleniyor. Hedef mic-to-mouth latency: < 200ms.");
  };

  const stopRecording = async () => {
    setIsRecording(false);

    if (recorder.isRecording) {
      await recorder.stop().catch(() => {});
    }

    await setAudioModeAsync({ allowsRecording: false }).catch(() => {});
    publishLevel(MIN_IDLE_LEVEL, { force: true });
    setMessage("Sessizlik/idle durumuna donuldu.");
  };

  const handleToggle = () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    startRecording().catch((error) => {
      setIsRecording(false);
      publishLevel(MIN_IDLE_LEVEL, { force: true });
      setMessage(`Mikrofon baslatilamadi: ${error.message}`);
    });
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Voice visualizer</Text>
        <Text style={styles.levelLabel}>{Math.round(voiceLevel * 100)}%</Text>
      </View>

      <View style={styles.waveRow}>
        {bars.map((barIndex) => {
          const phase = 0.45 + ((barIndex % 6) + 1) / 10;
          const height = animatedLevel.interpolate({
            inputRange: [0, 1],
            outputRange: [10 + (barIndex % 3) * 2, 28 + phase * 46]
          });

          return (
            <Animated.View
              key={barIndex}
              style={[
                styles.bar,
                {
                  height,
                  opacity: isRecording ? 0.95 : 0.48
                }
              ]}
            />
          );
        })}
      </View>

      <Text style={styles.message}>{message}</Text>
      {permissionStatus === "denied" ? (
        <Text style={styles.warning}>Mikrofon izni olmadan ses seviyesi okunamaz.</Text>
      ) : null}

      {isRecording ? (
        <SecondaryButton title="Dinlemeyi Durdur" onPress={handleToggle} />
      ) : (
        <PrimaryButton title="Dinlemeyi Baslat" onPress={handleToggle} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  label: {
    ...typography.label,
    color: colors.text
  },
  levelLabel: {
    ...typography.caption,
    color: colors.primary
  },
  waveRow: {
    minHeight: 96,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTint,
    borderWidth: 1,
    borderColor: colors.border
  },
  bar: {
    width: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.primary
  },
  message: {
    ...typography.bodySm,
    color: colors.textMuted
  },
  warning: {
    ...typography.caption,
    color: colors.danger
  }
});
