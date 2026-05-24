# BRIDGE.md — NoteMigrator Expert Bridge Log

## Bridge call — 2026-05-24T12:XX
TRIGGER: manual
STUCK_CYCLE: Cycle 6 (avatar-lipsync-fft — ROLLBACK)
EXPERT: sınıf arkadaşı
DURATION_SEC: ≥60
TRANSCRIPT_SUMMARY:
  - Avatar colorless + facing issue confirmed visible on device — fix needed before APK build
  - FFT-based lipsync rollback was the right call — expo-av metering-only limitation is a real constraint
  - Suggested simpler path: keep RMS-driven visemes but add more morph variation (wave offset already in code)
  - Screen share confirmed working via Jitsi built-in share button on Android
NEXT_CYCLE_INPUT: Do not pursue FFT this week. Focus on color/facing fix (Cycle 5) and voice bar polish (Cycle 7). Ship with RMS visemes — movement is visible and latency is within target.
