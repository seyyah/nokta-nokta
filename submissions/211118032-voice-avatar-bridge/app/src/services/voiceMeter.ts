/**
 * voiceMeter — expo-av Audio.Recording üzerinden mikrofon RMS/dBFS okur,
 * 0..1 amplitude değerine map'ler ve subscriber'lara push eder.
 *
 * Tasarım kararları (DECISIONS.md'ye bakın):
 * - SDK 54'te expo-av hâlâ stabil. expo-audio metering JS'te eksik (issue #33256).
 * - 60ms update interval → < 200ms mic-to-mouth latency.
 * - dBFS → amplitude eğrisi: floor=-50dB, ceiling=-15dB (insan sesi aralığı).
 */

import { Audio } from 'expo-av';

export type MeterListener = (amplitude: number) => void;

const UPDATE_MS = 60;
const SILENCE_DBFS = -50;
const LOUD_DBFS = -15;

class VoiceMeter {
  private recording: Audio.Recording | null = null;
  private listeners = new Set<MeterListener>();
  private smoothed = 0;
  private lastAmplitude = 0;

  isActive(): boolean {
    return this.recording !== null;
  }

  getAmplitude(): number {
    return this.lastAmplitude;
  }

  subscribe(listener: MeterListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async start(): Promise<void> {
    if (this.recording) return;

    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Mikrofon izni reddedildi.');
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync({
      isMeteringEnabled: true,
      android: {
        extension: '.m4a',
        outputFormat: Audio.AndroidOutputFormat.MPEG_4,
        audioEncoder: Audio.AndroidAudioEncoder.AAC,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 64000,
      },
      ios: {
        extension: '.m4a',
        audioQuality: Audio.IOSAudioQuality.MEDIUM,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 64000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: {
        mimeType: 'audio/webm',
        bitsPerSecond: 64000,
      },
    });

    recording.setProgressUpdateInterval(UPDATE_MS);
    recording.setOnRecordingStatusUpdate((status) => {
      if (!status.isRecording) return;
      const dbfs = (status as { metering?: number }).metering;
      if (typeof dbfs !== 'number') return;

      // dBFS → 0..1 amplitude
      const clamped = Math.max(SILENCE_DBFS, Math.min(LOUD_DBFS, dbfs));
      const raw = (clamped - SILENCE_DBFS) / (LOUD_DBFS - SILENCE_DBFS);

      // Exponential smoothing (low-pass, ~80ms time constant)
      this.smoothed = this.smoothed * 0.55 + raw * 0.45;
      this.lastAmplitude = this.smoothed;

      this.listeners.forEach((l) => l(this.smoothed));
    });

    await recording.startAsync();
    this.recording = recording;
  }

  async stop(): Promise<void> {
    if (!this.recording) return;
    try {
      await this.recording.stopAndUnloadAsync();
    } catch {
      // ignore — recording may already be unloaded
    }
    this.recording = null;
    this.smoothed = 0;
    this.lastAmplitude = 0;
    this.listeners.forEach((l) => l(0));
  }
}

export const voiceMeter = new VoiceMeter();
