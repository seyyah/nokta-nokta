import { useCallback, useEffect, useState } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

export function useDictation() {
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [volume, setVolume] = useState(0);

  useSpeechRecognitionEvent('start', () => {
    setError('');
    setRecognizing(true);
  });
  useSpeechRecognitionEvent('end', () => {
    setRecognizing(false);
    setVolume(0);
  });
  useSpeechRecognitionEvent('result', (event) => {
    const next = event.results[0]?.transcript ?? '';
    if (next) {
      setTranscript(next);
    }
  });
  useSpeechRecognitionEvent('volumechange', (event) => {
    setVolume(Math.max(0, Math.min(1, event.value / 10)));
  });
  useSpeechRecognitionEvent('error', (event) => {
    setRecognizing(false);
    setError(event.message || 'Dikte basarisiz oldu.');
  });

  const start = useCallback(async () => {
    setError('');
    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      setError('Konusma tanima izni verilmedi.');
      return;
    }
    ExpoSpeechRecognitionModule.start({
      continuous: false,
      interimResults: true,
      lang: 'tr-TR',
      volumeChangeEventOptions: {
        enabled: true,
        intervalMillis: 80,
      },
    });
  }, []);

  const stop = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  const clear = useCallback(() => {
    setTranscript('');
    setError('');
  }, []);

  useEffect(() => {
    return () => {
      ExpoSpeechRecognitionModule.abort();
    };
  }, []);

  return {
    clear,
    error,
    recognizing,
    start,
    stop,
    transcript,
    volume,
  };
}
