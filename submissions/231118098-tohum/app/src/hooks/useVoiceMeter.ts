import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';

const BAR_COUNT = 32;
const UPDATE_INTERVAL_MS = 16;
const SILENCE_DB = -60;
const MAX_DB = 0;

export type VoiceMeter = {
  amplitude: number;
  bars: number[];
  isRecording: boolean;
  latencyMs: number;
  permissionGranted: boolean;
  start: () => Promise<void>;
  stop: () => Promise<void>;
};

function dbToAmplitude(db: number): number {
  if (db <= SILENCE_DB) return 0;
  if (db >= MAX_DB) return 1;
  return (db - SILENCE_DB) / (MAX_DB - SILENCE_DB);
}

function makeSyntheticBars(history: number[], current: number): number[] {
  const next = [...history.slice(1), current];
  return next.map((value, index) => {
    const envelope = Math.sin(((index + 0.5) / BAR_COUNT) * Math.PI);
    const shaped = value * (0.5 + envelope * 0.5);
    return Math.min(1, Math.max(0, shaped));
  });
}

export function useVoiceMeter(): VoiceMeter {
  const [amplitude, setAmplitude] = useState(0);
  const [bars, setBars] = useState<number[]>(() => Array(BAR_COUNT).fill(0));
  const [isRecording, setIsRecording] = useState(false);
  const [latencyMs, setLatencyMs] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const historyRef = useRef<number[]>(Array(BAR_COUNT).fill(0));

  const start = useCallback(async () => {
    if (recordingRef.current) return;

    const permission = await Audio.requestPermissionsAsync();
    setPermissionGranted(permission.granted);
    if (!permission.granted) return;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync({
      ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
      isMeteringEnabled: true,
    });

    recording.setProgressUpdateInterval(UPDATE_INTERVAL_MS);
    recording.setOnRecordingStatusUpdate((status) => {
      if (!status.isRecording || status.metering === undefined) return;

      const now = Date.now();
      if (lastUpdateRef.current > 0) {
        setLatencyMs(now - lastUpdateRef.current);
      }
      lastUpdateRef.current = now;

      const amp = dbToAmplitude(status.metering);
      setAmplitude(amp);

      const nextBars = makeSyntheticBars(historyRef.current, amp);
      historyRef.current = nextBars;
      setBars(nextBars);
    });

    await recording.startAsync();
    recordingRef.current = recording;
    setIsRecording(true);
  }, []);

  const stop = useCallback(async () => {
    const recording = recordingRef.current;
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
    } catch {
      // already stopped
    }
    recordingRef.current = null;
    lastUpdateRef.current = 0;
    historyRef.current = Array(BAR_COUNT).fill(0);
    setIsRecording(false);
    setAmplitude(0);
    setBars(Array(BAR_COUNT).fill(0));
    setLatencyMs(0);
  }, []);

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
      }
    };
  }, []);

  return { amplitude, bars, isRecording, latencyMs, permissionGranted, start, stop };
}
