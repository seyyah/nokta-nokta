import { Audio } from "expo-av";
import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceMeterState = {
  amplitude: number;
  decibels: number | null;
  isListening: boolean;
  isSpeaking: boolean;
  permission: "unknown" | "granted" | "denied";
  statusLabel: string;
  error: string | null;
  start: () => Promise<void>;
  stop: () => Promise<void>;
};

const SILENCE_DB = -58;
const FLOOR_DB = -72;
const CEILING_DB = -18;
const RECORDING_OPTIONS = {
  ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
  isMeteringEnabled: true
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const dbToAmplitude = (db: number) => {
  const normalized = (db - FLOOR_DB) / (CEILING_DB - FLOOR_DB);
  return clamp(normalized, 0, 1);
};

export function useMicrophoneLevel(): VoiceMeterState {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const smoothRef = useRef(0);
  const [amplitude, setAmplitude] = useState(0);
  const [decibels, setDecibels] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [permission, setPermission] = useState<VoiceMeterState["permission"]>("unknown");
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(async () => {
    const recording = recordingRef.current;
    recordingRef.current = null;
    setIsListening(false);
    smoothRef.current = 0;
    setAmplitude(0);
    setDecibels(null);

    if (!recording) {
      return;
    }

    try {
      await recording.stopAndUnloadAsync();
    } catch {
      // The recorder can already be unloaded when the OS revokes the input.
    }
  }, []);

  const start = useCallback(async () => {
    setError(null);

    const permissionResponse = await Audio.requestPermissionsAsync();
    if (!permissionResponse.granted) {
      setPermission("denied");
      setError("Microphone permission is required for the live audit meter.");
      return;
    }

    setPermission("granted");
    await stop();
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      });

      const { recording } = await Audio.Recording.createAsync(
        RECORDING_OPTIONS,
        (status) => {
          const meter = typeof status.metering === "number" ? status.metering : FLOOR_DB;
          const raw = dbToAmplitude(meter);
          const attack = raw > smoothRef.current ? 0.42 : 0.16;
          const smoothed = smoothRef.current + (raw - smoothRef.current) * attack;
          smoothRef.current = smoothed;
          setDecibels(meter);
          setAmplitude(smoothed);
        },
        80
      );

      recordingRef.current = recording;
      setIsListening(true);
    } catch (cause) {
      smoothRef.current = 0;
      setAmplitude(0);
      setDecibels(null);
      setIsListening(false);
      setError(cause instanceof Error ? cause.message : "Could not start the microphone meter.");
    }
  }, [stop]);

  useEffect(
    () => () => {
      void stop();
    },
    [stop]
  );

  const isSpeaking = isListening && amplitude > 0.18 && (decibels ?? FLOOR_DB) > SILENCE_DB;
  const statusLabel = !isListening ? "Idle" : isSpeaking ? "Speech detected" : "Listening for speech";

  return {
    amplitude,
    decibels,
    isListening,
    isSpeaking,
    permission,
    statusLabel,
    error,
    start,
    stop
  };
}
