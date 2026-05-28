import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { useCallback, useRef, useState } from 'react';

export type DictationState = {
  clear: () => void;
  error: string | null;
  listening: boolean;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  transcript: string;
};

export function useDictation(): DictationState {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const finalChunks = useRef<string[]>([]);

  useSpeechRecognitionEvent('start', () => {
    setListening(true);
    setError(null);
  });

  useSpeechRecognitionEvent('end', () => {
    setListening(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript.trim() ?? '';
    if (!text) {
      return;
    }

    if (event.isFinal) {
      finalChunks.current = [...finalChunks.current, text];
    }

    const prefix = finalChunks.current.join(' ').trim();
    setTranscript([prefix, event.isFinal ? '' : text].filter(Boolean).join(' ').trim());
  });

  useSpeechRecognitionEvent('error', (event) => {
    setListening(false);
    setError(event.message || 'Speech recognition failed.');
  });

  const start = useCallback(async () => {
    setError(null);
    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      setError('Speech recognition permission is required for dictated reports.');
      return;
    }

    ExpoSpeechRecognitionModule.start({
      lang: 'tr-TR',
      interimResults: true,
      continuous: true,
    });
  }, []);

  const stop = useCallback(async () => {
    ExpoSpeechRecognitionModule.stop();
    setListening(false);
  }, []);

  const clear = useCallback(() => {
    finalChunks.current = [];
    setTranscript('');
    setError(null);
  }, []);

  return {
    clear,
    error,
    listening,
    start,
    stop,
    transcript,
  };
}
