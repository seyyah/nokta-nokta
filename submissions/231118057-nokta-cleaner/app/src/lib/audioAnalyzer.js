// Real-time mic analyzer with a uniform frame shape across web + native.
// frame = { amplitude: 0..1, bands: number[BAND_COUNT] (0..1 each), ts: ms }

import { Platform } from 'react-native';

export const BAND_COUNT = 16;

// Convert dB metering (-160..0) to perceptual 0..1 amplitude.
// -60dB ≈ near-silence threshold, 0dB ≈ clipping.
function dbToLinear(db) {
  if (db == null || !isFinite(db)) return 0;
  const clamped = Math.max(-60, Math.min(0, db));
  // smooth perceptual curve, slight gamma so quiet speech still moves bars
  return Math.pow((clamped + 60) / 60, 1.4);
}

// Deterministic pseudo-spectrum from a single amplitude value + time.
// Used on native where raw PCM isn't exposed. Each band wobbles at its own
// frequency so the bars feel like a real spectrum, but the overall envelope
// strictly tracks the mic amplitude.
function synthBands(amp, t) {
  const out = new Array(BAND_COUNT);
  for (let i = 0; i < BAND_COUNT; i++) {
    // bell-shaped weight: mids get more energy than extremes
    const x = (i + 0.5) / BAND_COUNT;
    const bell = Math.exp(-Math.pow((x - 0.4) * 2.2, 2));
    // per-band oscillator (different freq + phase per bar)
    const wob =
      0.55 +
      0.45 *
        Math.sin(t * 0.006 * (1 + i * 0.21) + i * 1.37) *
        Math.cos(t * 0.011 * (1 + i * 0.09));
    out[i] = Math.max(0, Math.min(1, amp * bell * wob));
  }
  return out;
}

// ─────────────────────────────── WEB ───────────────────────────────
function createWebAnalyzer() {
  let ctx, source, analyser, stream, raf, listeners = new Set(), running = false;
  const fftSize = 512;
  const timeBuf = new Uint8Array(fftSize);
  const freqBuf = new Uint8Array(fftSize / 2);

  async function start() {
    if (running) return;
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    source = ctx.createMediaStreamSource(stream);
    analyser = ctx.createAnalyser();
    analyser.fftSize = fftSize;
    analyser.smoothingTimeConstant = 0.65;
    source.connect(analyser);
    running = true;

    const tick = () => {
      if (!running) return;
      analyser.getByteTimeDomainData(timeBuf);
      analyser.getByteFrequencyData(freqBuf);

      // RMS amplitude from time-domain
      let sum = 0;
      for (let i = 0; i < timeBuf.length; i++) {
        const v = (timeBuf[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / timeBuf.length);
      const amplitude = Math.min(1, rms * 3.2); // boost — speech RMS rarely > 0.3

      // Downsample freq bins into BAND_COUNT bands (log-ish grouping)
      const bands = new Array(BAND_COUNT);
      const binCount = freqBuf.length;
      for (let i = 0; i < BAND_COUNT; i++) {
        const lo = Math.floor(Math.pow(i / BAND_COUNT, 1.6) * binCount);
        const hi = Math.floor(Math.pow((i + 1) / BAND_COUNT, 1.6) * binCount);
        let acc = 0, n = 0;
        for (let j = lo; j <= hi && j < binCount; j++) { acc += freqBuf[j]; n++; }
        bands[i] = n ? Math.min(1, (acc / n) / 200) : 0;
      }

      const frame = { amplitude, bands, ts: performance.now() };
      listeners.forEach(fn => fn(frame));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  async function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    if (source) try { source.disconnect(); } catch {}
    if (stream) stream.getTracks().forEach(t => t.stop());
    if (ctx) try { await ctx.close(); } catch {}
    ctx = source = analyser = stream = null;
  }

  function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

  return { start, stop, subscribe, get isRunning() { return running; } };
}

// ────────────────────────────── NATIVE ──────────────────────────────
function createNativeAnalyzer() {
  let recorder, listeners = new Set(), running = false, smoothedAmp = 0;
  let sub = null;

  async function start() {
    if (running) return;
    // Lazy require so web builds don't try to resolve the native module
    // and so missing-install errors surface only when actually used.
    const ExpoAudio = require('expo-audio');
    const { AudioModule, AudioRecorder, RecordingPresets, setAudioModeAsync } = ExpoAudio;

    const perm = await AudioModule.requestRecordingPermissionsAsync();
    if (perm && perm.granted === false) {
      throw new Error('Microphone permission denied');
    }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });

    // metering must be explicitly opted-in
    const opts = {
      ...RecordingPresets.LOW_QUALITY,
      isMeteringEnabled: true,
      meteringEnabled: true, // some platforms read the alt key
    };
    recorder = new AudioRecorder(opts, 50); // 50ms tick
    await recorder.prepareToRecordAsync();
    recorder.record();

    sub = recorder.addListener('recordingStatusUpdate', (status) => {
      if (!running) return;
      // status.metering on iOS/Android, status?.currentMetering elsewhere
      const db = status?.metering ?? status?.currentMetering ?? -60;
      const linAmp = dbToLinear(db);
      smoothedAmp = smoothedAmp * 0.55 + linAmp * 0.45;
      const ts = Date.now();
      listeners.forEach((fn) =>
        fn({ amplitude: smoothedAmp, bands: synthBands(smoothedAmp, ts), ts })
      );
    });

    running = true;
  }

  async function stop() {
    running = false;
    if (sub) { try { sub.remove(); } catch {} sub = null; }
    if (recorder) {
      try { await recorder.stop(); } catch {}
      try { recorder.release && recorder.release(); } catch {}
      recorder = null;
    }
    smoothedAmp = 0;
  }

  function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

  return { start, stop, subscribe, get isRunning() { return running; } };
}

// ─────────────────────────────── API ───────────────────────────────
export function createAnalyzer() {
  return Platform.OS === 'web' ? createWebAnalyzer() : createNativeAnalyzer();
}
