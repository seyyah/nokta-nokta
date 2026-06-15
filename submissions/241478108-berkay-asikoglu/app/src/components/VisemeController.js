// Basit amplitude-based viseme mapping
// Referans: wass08/r3f-lipsync-tutorial mantığı — RMS band'ları viseme index'ine map

const VISEME_LIST = [
  'viseme_sil',   // 0: sessizlik
  'viseme_MBP',   // 1: m, b, p
  'viseme_E',     // 2: e
  'viseme_I',     // 3: i
  'viseme_AAH',   // 4: a
  'viseme_OO',    // 5: o
  'viseme_U',     // 6: u
  'viseme_oh',    // 7: oh
];

export function mapRmsToViseme(rms) {
  if (rms < 0.02) return { index: 0, weight: 1.0 };
  if (rms < 0.08) return { index: 1, weight: rms * 10 };
  if (rms < 0.15) return { index: 2, weight: rms * 6 };
  if (rms < 0.25) return { index: 3, weight: rms * 4 };
  if (rms < 0.40) return { index: 4, weight: rms * 2.5 };
  if (rms < 0.55) return { index: 5, weight: rms * 1.8 };
  if (rms < 0.70) return { index: 6, weight: rms * 1.4 };
  return { index: 7, weight: 1.0 };
}

export function getVisemeName(rms) {
  return VISEME_LIST[mapRmsToViseme(rms).index];
}
