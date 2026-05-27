// One-shot audio recorder for dictation → transcription.
// Distinct from audioAnalyzer.js — that one streams amplitude frames live;
// this one records a full clip and returns { base64, mimeType } when stopped.

import { Platform } from 'react-native';

// ─────────────────────────────── WEB ───────────────────────────────
function createWebRecorder() {
  let mediaRecorder, stream, chunks = [], mimeType = null, running = false;

  async function start() {
    if (running) return;
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Prefer webm/opus (Chrome native). Fall back to default.
    const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
    mimeType = candidates.find((m) => window.MediaRecorder?.isTypeSupported?.(m)) || '';
    mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    chunks = [];
    mediaRecorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    mediaRecorder.start();
    running = true;
  }

  async function stop() {
    if (!running) return null;
    running = false;
    return new Promise((resolve, reject) => {
      mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: mediaRecorder.mimeType || mimeType || 'audio/webm' });
          // Blob → base64 (strip the data URL prefix)
          const dataUrl = await new Promise((res, rej) => {
            const r = new FileReader();
            r.onloadend = () => res(r.result);
            r.onerror = () => rej(r.error);
            r.readAsDataURL(blob);
          });
          const base64 = String(dataUrl).split(',')[1] || '';
          stream.getTracks().forEach((t) => t.stop());
          resolve({ base64, mimeType: blob.type, sizeBytes: blob.size });
        } catch (err) { reject(err); }
      };
      mediaRecorder.stop();
    });
  }

  return { start, stop, get isRunning() { return running; } };
}

// ────────────────────────────── NATIVE ──────────────────────────────
function createNativeRecorder() {
  let recorder, running = false;

  async function start() {
    if (running) return;
    const ExpoAudio = require('expo-audio');
    const { AudioModule, AudioRecorder, RecordingPresets, setAudioModeAsync } = ExpoAudio;

    const perm = await AudioModule.requestRecordingPermissionsAsync();
    if (perm && perm.granted === false) throw new Error('Microphone permission denied');
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });

    recorder = new AudioRecorder(RecordingPresets.HIGH_QUALITY);
    await recorder.prepareToRecordAsync();
    recorder.record();
    running = true;
  }

  async function stop() {
    if (!running) return null;
    running = false;
    try { await recorder.stop(); } catch {}
    const uri = recorder.uri;
    let base64 = '';
    let sizeBytes = 0;
    try {
      const FS = require('expo-file-system');
      base64 = await FS.readAsStringAsync(uri, { encoding: FS.EncodingType?.Base64 ?? 'base64' });
      const info = await FS.getInfoAsync(uri);
      sizeBytes = info?.size ?? 0;
    } catch (err) {
      // Without expo-file-system we still return the URI for debugging,
      // but transcription will fail (Gemini needs base64).
      throw new Error('Reading recorded file failed: ' + err.message);
    }
    try { recorder.release && recorder.release(); } catch {}
    recorder = null;
    // HIGH_QUALITY default extension is .m4a → audio/mp4 mime
    return { base64, mimeType: 'audio/mp4', sizeBytes };
  }

  return { start, stop, get isRunning() { return running; } };
}

export function createRecorder() {
  return Platform.OS === 'web' ? createWebRecorder() : createNativeRecorder();
}
