import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';

const SILENCE_DB = -60;
const UPDATE_INTERVAL_MS = 50;

function normalizedLevel(db: number) {
  return Math.max(0, Math.min(1, (db - SILENCE_DB) / -SILENCE_DB));
}

export function useVoiceMeter() {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [level, setLevel] = useState(0);
  const [decibels, setDecibels] = useState(SILENCE_DB);
  const [active, setActive] = useState(false);
  const [permission, setPermission] = useState<'denied' | 'granted' | 'undetermined' | 'unknown'>('unknown');
  const [error, setError] = useState('');

  const stop = useCallback(async () => {
    const recording = recordingRef.current;
    recordingRef.current = null;
    if (recording) {
      recording.setOnRecordingStatusUpdate(null);
      await recording.stopAndUnloadAsync().catch(() => undefined);
    }
    setActive(false);
    setDecibels(SILENCE_DB);
    setLevel(0);
  }, []);

  const start = useCallback(async () => {
    setError('');
    if (recordingRef.current) {
      return;
    }
    const permissionResult = await Audio.requestPermissionsAsync();
    setPermission(permissionResult.status);
    if (!permissionResult.granted) {
      setError('Mikrofon izni verilmedi.');
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.LOW_QUALITY,
        isMeteringEnabled: true,
      });
      recording.setProgressUpdateInterval(UPDATE_INTERVAL_MS);
      recording.setOnRecordingStatusUpdate((status) => {
        if (!status.isRecording) {
          return;
        }
        const db = status.metering ?? SILENCE_DB;
        const next = normalizedLevel(db);
        setDecibels(db);
        setLevel((previous) => previous * 0.25 + next * 0.75);
      });
      await recording.startAsync();
      recordingRef.current = recording;
      setActive(true);
    } catch {
      setError('Ses olcumu baslatilamadi.');
      await stop();
    }
  }, [stop]);

  useEffect(() => {
    return () => {
      void stop();
    };
  }, [stop]);

  return {
    active,
    decibels,
    error,
    level,
    permission,
    start,
    stop,
    sampleIntervalMs: UPDATE_INTERVAL_MS,
  };
}
