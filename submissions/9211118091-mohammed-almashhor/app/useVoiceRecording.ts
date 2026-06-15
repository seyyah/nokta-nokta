import { useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

let demoIndex = 0;
const DEMO_TEXTS = [
  "Sadece öğrencilerin edu.tr e-postasıyla üye olabildiği, kampüs içi güvenli bir ikinci el eşya ve kitap pazar yeri mobil uygulaması yapmak istiyorum.",
  "Ses testi, beni duyuyor musun?",
  "Bu veritabanı mimarisi konusunda yardıma ihtiyacım var, uzman desteği lazım."
];

export function useVoiceRecording() {
  const [isActive, setIsActive] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [speechText, setSpeechText] = useState('');
  
  const recRef = useRef<Audio.Recording | null>(null);

  useEffect(() => {
    return () => {
      if (recRef.current) {
        recRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  const beginRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });

      recRef.current = recording;
      recording.setProgressUpdateInterval(40);
      recording.setOnRecordingStatusUpdate((status) => {
        if (status.metering !== undefined) {
          const mappedVolume = Math.max(0, (status.metering + 50) / 50);
          setVolumeLevel(mappedVolume);
        }
      });

      setIsActive(true);
    } catch (error) {
      console.warn('Failed to begin recording:', error);
    }
  };

  const haltRecording = async () => {
    if (!recRef.current) return;

    try {
      await recRef.current.stopAndUnloadAsync();
      setIsActive(false);
      setVolumeLevel(0);

      // HARDCODED DEMO SCRIPT FLOW
      setSpeechText('🎙️ Sesiniz işleniyor...');
      
      setTimeout(() => {
        const textToSet = DEMO_TEXTS[demoIndex % DEMO_TEXTS.length];
        setSpeechText(textToSet);
        demoIndex++;
      }, 1500); // Simulate processing delay

    } catch (error) {
      console.warn('Halt recording error:', error);
      setSpeechText('🎙️ [Kayıt Hatası]');
    } finally {
      setVolumeLevel(0);
      recRef.current = null;
    }
  };

  return { isActive, volumeLevel, speechText, setSpeechText, beginRecording, haltRecording };
}
