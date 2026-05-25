import { useCallback, useEffect, useState } from 'react';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

const SILENCE_DB = -60;
const UPDATE_INTERVAL_MS = 50;

function normalizedLevel(db: number) {
  return Math.max(0, Math.min(1, (db - SILENCE_DB) / -SILENCE_DB));
}

export function useVoiceMeter() {
  const recorder = useAudioRecorder({
    ...RecordingPresets.LOW_QUALITY,
    isMeteringEnabled: true,
  });
  const recorderState = useAudioRecorderState(recorder, UPDATE_INTERVAL_MS);
  const [level, setLevel] = useState(0);
  const [decibels, setDecibels] = useState(SILENCE_DB);
  const [active, setActive] = useState(false);
  const [permission, setPermission] = useState<'denied' | 'granted' | 'undetermined' | 'unknown'>('unknown');
  const [error, setError] = useState('');

  const stop = useCallback(async () => {
    if (recorderState.isRecording) {
      await recorder.stop().catch(() => undefined);
    }
    setActive(false);
    setDecibels(SILENCE_DB);
    setLevel(0);
  }, [recorder, recorderState.isRecording]);

  const start = useCallback(async () => {
    setError('');
    if (recorderState.isRecording) {
      return;
    }
    const permissionResult = await AudioModule.requestRecordingPermissionsAsync();
    setPermission(permissionResult.status);
    if (!permissionResult.granted) {
      setError('Mikrofon izni verilmedi.');
      return;
    }

    try {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setActive(true);
    } catch {
      setError('Ses olcumu baslatilamadi.');
      await stop();
    }
  }, [recorder, recorderState.isRecording, stop]);

  useEffect(() => {
    if (!recorderState.isRecording) {
      return;
    }
    const db = recorderState.metering ?? SILENCE_DB;
    const next = normalizedLevel(db);
    setDecibels(db);
    setLevel((previous) => previous * 0.25 + next * 0.75);
  }, [recorderState.isRecording, recorderState.metering]);

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
