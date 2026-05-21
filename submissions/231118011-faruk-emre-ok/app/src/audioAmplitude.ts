import { Audio } from "expo-av";
import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { Platform } from "react-native";

type PermissionState = "unknown" | "granted" | "denied";

type WebAudioRuntime = {
  analyser: AnalyserNode;
  context: AudioContext;
  data: Uint8Array;
  frameId: number;
  stream: MediaStream;
};

export type VoiceAmplitudeState = {
  amplitude: number;
  bars: number[];
  error: string | null;
  isListening: boolean;
  lastLatencyMs: number;
  permission: PermissionState;
  start: () => Promise<void>;
  stop: () => Promise<void>;
};

const BAR_COUNT = 18;
const SILENCE_BARS = Array.from({ length: BAR_COUNT }, () => 0);

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function dbToAmplitude(db?: number) {
  if (typeof db !== "number" || Number.isNaN(db)) {
    return 0;
  }

  const clipped = Math.max(-72, Math.min(0, db));
  const normalized = (clipped + 72) / 72;
  return clamp01(Math.pow(normalized, 1.45));
}

function publishReading(
  nextAmplitude: number,
  setAmplitude: (value: number) => void,
  setBars: Dispatch<SetStateAction<number[]>>,
  latencyStartedAt: number,
  setLastLatencyMs: (value: number) => void
) {
  const value = clamp01(nextAmplitude);
  setAmplitude(value);
  setBars((current) => [...current.slice(1), value]);
  setLastLatencyMs(Math.max(0, Math.round(Date.now() - latencyStartedAt)));
}

export function useVoiceAmplitude(): VoiceAmplitudeState {
  const [amplitude, setAmplitude] = useState(0);
  const [bars, setBars] = useState<number[]>(SILENCE_BARS);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [lastLatencyMs, setLastLatencyMs] = useState(0);
  const [permission, setPermission] = useState<PermissionState>("unknown");
  const recordingRef = useRef<Audio.Recording | null>(null);
  const webRuntimeRef = useRef<WebAudioRuntime | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const stop = useCallback(async () => {
    const recording = recordingRef.current;
    recordingRef.current = null;

    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch {
        // Recording may already be unloaded when the OS revokes input.
      }
    }

    const webRuntime = webRuntimeRef.current;
    webRuntimeRef.current = null;
    if (webRuntime) {
      cancelAnimationFrame(webRuntime.frameId);
      webRuntime.stream.getTracks().forEach((track) => track.stop());
      await webRuntime.context.close();
    }

    if (mountedRef.current) {
      setIsListening(false);
      setAmplitude(0);
      setBars(SILENCE_BARS);
    }
  }, []);

  const startWeb = useCallback(async () => {
    const nav = globalThis.navigator;
    if (!nav?.mediaDevices?.getUserMedia) {
      throw new Error("Web microphone input is not available.");
    }

    const stream = await nav.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true
      }
    });
    const webWindow = window as typeof window & { webkitAudioContext?: typeof AudioContext };
    const AudioContextCtor = webWindow.AudioContext ?? webWindow.webkitAudioContext;
    if (!AudioContextCtor) {
      throw new Error("Web Audio API is not available.");
    }

    const context = new AudioContextCtor();
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (const point of data) {
        const centered = (point - 128) / 128;
        sum += centered * centered;
      }
      const rms = Math.sqrt(sum / data.length);
      publishReading(rms * 5.5, setAmplitude, setBars, Date.now() - 16, setLastLatencyMs);
      const runtime = webRuntimeRef.current;
      if (runtime) {
        runtime.frameId = requestAnimationFrame(tick);
      }
    };

    const frameId = requestAnimationFrame(tick);
    webRuntimeRef.current = { analyser, context, data, frameId, stream };
  }, []);

  const startNative = useCallback(async () => {
    const permissionResult = await Audio.requestPermissionsAsync();
    if (!permissionResult.granted) {
      setPermission("denied");
      throw new Error("Microphone permission denied.");
    }

    setPermission("granted");
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true
    });

    const recording = new Audio.Recording();
    recording.setProgressUpdateInterval(80);
    recording.setOnRecordingStatusUpdate((status: { metering?: number }) => {
      publishReading(dbToAmplitude(status.metering), setAmplitude, setBars, Date.now() - 80, setLastLatencyMs);
    });

    await recording.prepareToRecordAsync({
      ...Audio.RecordingOptionsPresets.LOW_QUALITY,
      isMeteringEnabled: true,
      keepAudioActiveHint: true
    });
    await recording.startAsync();
    recordingRef.current = recording;
  }, []);

  const start = useCallback(async () => {
    setError(null);
    await stop();

    try {
      setIsListening(true);
      setPermission("unknown");
      if (Platform.OS === "web") {
        await startWeb();
        setPermission("granted");
      } else {
        await startNative();
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Microphone start failed.";
      setError(message);
      await stop();
    }
  }, [startNative, startWeb, stop]);

  useEffect(() => {
    return () => {
      void stop();
    };
  }, [stop]);

  return {
    amplitude,
    bars,
    error,
    isListening,
    lastLatencyMs,
    permission,
    start,
    stop
  };
}
