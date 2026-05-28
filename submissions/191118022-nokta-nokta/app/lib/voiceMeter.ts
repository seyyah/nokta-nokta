import { Audio } from 'expo-av';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const SILENCE_DB = -58;
const HOT_DB = -12;

export type VoiceMeterState = {
  active: boolean;
  bins: number[];
  error: string | null;
  level: number;
  meteringDb: number | null;
  recordingUri: string | null;
  start: () => Promise<void>;
  stop: () => Promise<void>;
};

export function levelFromMetering(db: number | null | undefined) {
  if (typeof db !== 'number' || Number.isNaN(db)) {
    return 0;
  }

  return clamp((db - SILENCE_DB) / (HOT_DB - SILENCE_DB));
}

export function buildVoiceBins(level: number, tick: number, count = 22) {
  return Array.from({ length: count }, (_, index) => {
    const phase = tick / 140 + index * 0.72;
    const harmonic = 0.62 + Math.sin(phase) * 0.22 + Math.sin(phase * 0.41) * 0.16;
    const taper = 0.42 + Math.sin((index / Math.max(1, count - 1)) * Math.PI) * 0.58;
    return clamp(level * harmonic * taper);
  });
}

export function useVoiceMeter(): VoiceMeterState {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [active, setActive] = useState(false);
  const [level, setLevel] = useState(0);
  const [meteringDb, setMeteringDb] = useState<number | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const stop = useCallback(async () => {
    const recording = recordingRef.current;
    recordingRef.current = null;
    setActive(false);
    setLevel(0);
    setMeteringDb(null);

    if (!recording) {
      return;
    }

    try {
      await recording.stopAndUnloadAsync();
      setRecordingUri(recording.getURI());
    } catch (stopError) {
      setError(getErrorMessage(stopError, 'Recording could not be stopped.'));
    }
  }, []);

  const start = useCallback(async () => {
    if (recordingRef.current) {
      return;
    }

    setError(null);
    setRecordingUri(null);

    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      setError('Microphone permission is required for the voice mirror.');
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });

    const recording = new Audio.Recording();
    recording.setProgressUpdateInterval(80);
    recording.setOnRecordingStatusUpdate((status) => {
      if (!status.isRecording) {
        return;
      }

      const metering = (status as { metering?: number }).metering ?? SILENCE_DB;
      const nextLevel = levelFromMetering(metering);
      setMeteringDb(metering);
      setLevel(nextLevel);
      setTick(Date.now());
    });

    try {
      await recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      } as Audio.RecordingOptions);
      await recording.startAsync();
      recordingRef.current = recording;
      setActive(true);
    } catch (startError) {
      recordingRef.current = null;
      setActive(false);
      setError(getErrorMessage(startError, 'Recording could not be started.'));
    }
  }, []);

  useEffect(() => {
    return () => {
      const recording = recordingRef.current;
      recordingRef.current = null;
      if (recording) {
        void recording.stopAndUnloadAsync().catch(() => undefined);
      }
    };
  }, []);

  const bins = useMemo(() => buildVoiceBins(active ? level : level * 0.2, tick), [active, level, tick]);

  return {
    active,
    bins,
    error,
    level,
    meteringDb,
    recordingUri,
    start,
    stop,
  };
}

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
