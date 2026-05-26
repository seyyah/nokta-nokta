import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';

const SILENCE_DB = -60;
const UPDATE_INTERVAL_MS = 50;

function normalizedLevel(db: number) {
  return Math.max(0, Math.min(1, (db - SILENCE_DB) / -SILENCE_DB));
}

export function useVoiceMeter() {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const mountedRef = useRef(true);
  const [level, setLevel] = useState(0);
  const [decibels, setDecibels] = useState(SILENCE_DB);
  const [active, setActive] = useState(false);
  const [error, setError] = useState('');

  const resetMeter = useCallback(() => {
    if (!mountedRef.current) {
      return;
    }
    setActive(false);
    setDecibels(SILENCE_DB);
    setLevel(0);
  }, []);

  const stop = useCallback(async () => {
    const recording = recordingRef.current;
    recordingRef.current = null;
    if (recording) {
      recording.setOnRecordingStatusUpdate(null);
      await recording.stopAndUnloadAsync().catch(() => undefined);
    }
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => undefined);
    resetMeter();
  }, [resetMeter]);

  const start = useCallback(async () => {
    if (recordingRef.current) {
      return;
    }

    setError('');
    const permissionResult = await Audio.requestPermissionsAsync();
    if (!permissionResult.granted) {
      setError('Mikrofon izni verilmedi.');
      return;
    }

    const recording = new Audio.Recording();
    recordingRef.current = recording;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
      });
      await recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.LOW_QUALITY,
        isMeteringEnabled: true,
      });
      recording.setProgressUpdateInterval(UPDATE_INTERVAL_MS);
      recording.setOnRecordingStatusUpdate((status) => {
        if (!mountedRef.current || !status.isRecording) {
          return;
        }
        const db = status.metering ?? SILENCE_DB;
        setDecibels(db);
        setLevel((previous) => previous * 0.25 + normalizedLevel(db) * 0.75);
      });
      await recording.startAsync();
      if (mountedRef.current) {
        setActive(true);
      }
    } catch {
      setError('Ses olcumu baslatilamadi.');
      await stop();
    }
  }, [stop]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      void stop();
    };
  }, [stop]);

  return {
    active,
    decibels,
    error,
    level,
    start,
    stop,
    sampleIntervalMs: UPDATE_INTERVAL_MS,
  };
}
