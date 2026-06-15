// src/voice/useMicAnalyzer.ts
// Mikrofon yakalama + RMS (Root Mean Square) hesabı.
// expo-av Audio.Recording'in metering değerini polling ile okur,
// sessizlik (-160 dB) ile konuşma (-10 dB) arasındaki delta'yı
// 0..1 normalized "level" değerine çevirir.
//
// Bu seviye:
//   - VoiceVisualizer bar yüksekliklerini sürer
//   - LipsyncAvatar ağız açıklığını (mouthOpen) sürer
//
// Latency: ~50ms polling + ~50ms Audio.Recording metering = ~100ms.
// Spec'in 200ms hedefinin altında.

import { useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';

export interface MicState {
  level: number;       // 0..1 normalized
  isRecording: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => Promise<void>;
}

const POLL_MS = 50;
const SILENT_DB = -50;
const LOUD_DB = -10;

export function useMicAnalyzer(): MicState {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const smoothRef = useRef(0); // exponential smoothing buffer

  const [level, setLevel] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    try {
      setError(null);
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        setError('Mikrofon izni reddedildi. Lütfen ayarlardan izin verin.');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.LOW_QUALITY,
        isMeteringEnabled: true,
      });
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);

      // Polling loop — 50ms (~20Hz) → smooth UI
      pollRef.current = setInterval(async () => {
        try {
          const status = await recording.getStatusAsync();
          if (!status.isRecording) return;
          const dB = status.metering ?? SILENT_DB;
          // Map dB → 0..1
          const raw = Math.max(0, Math.min(1, (dB - SILENT_DB) / (LOUD_DB - SILENT_DB)));
          // Exponential smoothing — avoids jitter
          smoothRef.current = smoothRef.current * 0.6 + raw * 0.4;
          setLevel(smoothRef.current);
        } catch {
          // recording was stopped — ignore
        }
      }, POLL_MS);
    } catch (e: any) {
      setError(e?.message ?? 'Mic start failed');
    }
  };

  const stop = async () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {
        /* ignore */
      }
      recordingRef.current = null;
    }
    setIsRecording(false);
    setLevel(0);
    smoothRef.current = 0;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { level, isRecording, error, start, stop };
}
