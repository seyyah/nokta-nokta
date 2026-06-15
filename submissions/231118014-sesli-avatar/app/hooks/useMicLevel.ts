import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

/**
 * Normalises a metering value from expo-audio (dBFS, typically -160..0)
 * into a 0..1 amplitude with a noise gate so silence stays at 0.
 */
function dbToAmplitude(db: number | undefined): number {
  if (db == null || !Number.isFinite(db)) return 0;
  // Treat anything below -55dB as silence.
  const floor = -55;
  if (db <= floor) return 0;
  const clamped = Math.min(0, db);
  const t = (clamped - floor) / -floor; // 0..1
  // Slight curve so quiet talk doesn't feel flat.
  return Math.pow(t, 1.5);
}

const POLL_INTERVAL_MS = 50; // ~20fps metering -> well under 200ms latency budget

export type MicLevelHandle = {
  /** 0..1 smoothed loudness updated from mic metering. */
  level: number;
  /** Raw most-recent amplitude (no smoothing) — useful for transient triggers. */
  raw: number;
  isRecording: boolean;
  isReady: boolean;
  hasPermission: boolean | null;
  error: string | null;
  start: () => Promise<void>;
  stop: () => Promise<void>;
};

export function useMicLevel(): MicLevelHandle {
  const recorder = useAudioRecorder({
    ...RecordingPresets.LOW_QUALITY,
    isMeteringEnabled: true,
  });
  const state = useAudioRecorderState(recorder, POLL_INTERVAL_MS);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [smoothed, setSmoothed] = useState<number>(0);
  const smoothedRef = useRef<number>(0);
  const rawRef = useRef<number>(0);

  // Request mic permission + configure audio session once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        if (cancelled) return;
        setHasPermission(status.granted);
        if (!status.granted) {
          setError("Mikrofon izni reddedildi.");
          return;
        }
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      } catch (e) {
        console.log("[useMicLevel] init error", e);
        if (!cancelled) setError("Ses kurulumu başarısız.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Smooth metering into a perceptually pleasant value.
  useEffect(() => {
    const raw = dbToAmplitude(state.metering);
    rawRef.current = raw;
    // Asymmetric smoothing: fast attack, slower release — feels alive.
    const attack = 0.6;
    const release = 0.15;
    const prev = smoothedRef.current;
    const next = raw > prev ? prev + (raw - prev) * attack : prev + (raw - prev) * release;
    smoothedRef.current = next;
    setSmoothed(next);
  }, [state.metering]);

  const start = useCallback(async () => {
    try {
      setError(null);
      await recorder.prepareToRecordAsync({
        ...RecordingPresets.LOW_QUALITY,
        isMeteringEnabled: true,
      });
      recorder.record();
    } catch (e) {
      console.log("[useMicLevel] start error", e);
      setError("Kayıt başlatılamadı.");
    }
  }, [recorder]);

  const stop = useCallback(async () => {
    try {
      if (state.isRecording) {
        await recorder.stop();
      }
      smoothedRef.current = 0;
      setSmoothed(0);
    } catch (e) {
      console.log("[useMicLevel] stop error", e);
    }
  }, [recorder, state.isRecording]);

  useEffect(() => {
    return () => {
      // Best-effort cleanup if user navigates away mid-record.
      if (Platform.OS !== "web") {
        recorder.stop().catch(() => {});
      }
    };
  }, [recorder]);

  return {
    level: smoothed,
    raw: rawRef.current,
    isRecording: state.isRecording,
    isReady: state.canRecord,
    hasPermission,
    error,
    start,
    stop,
  };
}
