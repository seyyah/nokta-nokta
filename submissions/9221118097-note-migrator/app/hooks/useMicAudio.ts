import { useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';

interface UseMicAudioResult {
  isRecording: boolean;
  audioLevel: number;
  transcribedText: string;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
}

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '';
const GROQ_TRANSCRIPTION_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

export function useMicAudio(): UseMicAudioResult {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcribedText, setTranscribedText] = useState('');
  const recordingRef = useRef<Audio.Recording | null>(null);
  const meterInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (meterInterval.current) clearInterval(meterInterval.current);
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  async function startRecording() {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
          isMeteringEnabled: true,
        }
      );

      recordingRef.current = recording;
      recording.setProgressUpdateInterval(50);
      recording.setOnRecordingStatusUpdate(status => {
        if (status.metering != null) {
          // metering is in dBFS: -160 (silent) to 0 (max)
          const normalized = Math.max(0, (status.metering + 60) / 60);
          setAudioLevel(normalized);
        }
      });

      setIsRecording(true);
    } catch (e) {
      console.warn('[useMicAudio] startRecording error:', e);
    }
  }

  async function stopRecording() {
    if (!recordingRef.current) return;

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      setIsRecording(false);
      setAudioLevel(0);

      if (uri && GROQ_API_KEY) {
        setTranscribedText('🎙️ Transcribing…');
        const text = await transcribeAudio(uri);
        setTranscribedText(text);
      } else {
        setTranscribedText('🎙️ [No API key — add EXPO_PUBLIC_GROQ_API_KEY]');
      }
    } catch (e) {
      console.warn('[useMicAudio] stopRecording error:', e);
      setIsRecording(false);
      setAudioLevel(0);
    } finally {
      recordingRef.current = null;
    }
  }

  return { isRecording, audioLevel, transcribedText, startRecording, stopRecording };
}

async function transcribeAudio(uri: string): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: 'recording.m4a',
      type: 'audio/m4a',
    } as any);
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('response_format', 'text');

    const response = await fetch(GROQ_TRANSCRIPTION_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.text();
      console.warn('[useMicAudio] Whisper error:', err);
      return '🎙️ [Transcription failed]';
    }

    const text = await response.text();
    return text.trim();
  } catch (e) {
    console.warn('[useMicAudio] transcribeAudio error:', e);
    return '🎙️ [Transcription error]';
  }
}
