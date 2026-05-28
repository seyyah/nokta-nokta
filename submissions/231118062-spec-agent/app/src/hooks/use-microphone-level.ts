import { Audio } from "expo-av";
import { useCallback, useEffect, useRef, useState } from "react";

let activeRecording: Audio.Recording | null = null;
let isPreparingGlobal = false;

type UseMicrophoneLevelOptions = {
  autoStart?: boolean;
};

function meteringToLevel(metering?: number) {
  if (typeof metering !== "number") return 0.05;
  return Math.max(0.05, Math.min(1, (metering + 60) / 60));
}

async function safelyUnloadActiveRecording() {
  if (!activeRecording) return;

  const recording = activeRecording;
  activeRecording = null;

  try {
    await recording.stopAndUnloadAsync();
  } catch {
    // Recording zaten durmuş/bozulmuş olabilir. Sessiz geçiyoruz.
  }
}

export function useMicrophoneLevel(options: UseMicrophoneLevelOptions = {}) {
  const { autoStart = false } = options;

  const mountedRef = useRef(true);
  const [level, setLevel] = useState(0.05);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(async () => {
    await safelyUnloadActiveRecording();

    if (!mountedRef.current) return;
    setIsListening(false);
    setLevel(0.05);
  }, []);

  const start = useCallback(async () => {
    if (isPreparingGlobal) return;

    isPreparingGlobal = true;
    setError(null);

    try {
      await safelyUnloadActiveRecording();

      const permission = await Audio.requestPermissionsAsync();

      if (!permission.granted) {
        setError("Microphone permission denied");
        setIsListening(false);
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });

      const recording = new Audio.Recording();

      recording.setOnRecordingStatusUpdate((status) => {
        if (!mountedRef.current) return;

        if (!status.isRecording) {
          setLevel((prev) => Math.max(0.05, prev * 0.85));
          return;
        }

        const next = meteringToLevel(status.metering);
        setLevel((prev) => prev * 0.35 + next * 0.65);
      });

      recording.setProgressUpdateInterval(80);

      await recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      } as Audio.RecordingOptions);

      await recording.startAsync();

      activeRecording = recording;

      if (!mountedRef.current) {
        await safelyUnloadActiveRecording();
        return;
      }

      setIsListening(true);
    } catch (err) {
      console.log("useMicrophoneLevel start error:", err);

      await safelyUnloadActiveRecording();

      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Microphone start failed");
      setIsListening(false);
      setLevel(0.05);
    } finally {
      isPreparingGlobal = false;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    if (autoStart) {
      start();
    }

    return () => {
      mountedRef.current = false;
      stop();
    };
  }, [autoStart, start, stop]);

  return {
    level,
    rms: level,
    volume: level,
    isListening,
    isRecording: isListening,
    error,
    start,
    stop,
    startListening: start,
    stopListening: stop,
  };
}

export default useMicrophoneLevel;