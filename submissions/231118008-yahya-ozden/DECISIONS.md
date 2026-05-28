# DECISIONS.md

## MVP Decisions

- Microphone input uses `expo-av` recording metering because it is the fastest Expo-compatible
  path for live amplitude.
- Visualizer bars use smoothed RMS/amplitude, not raw dB, so silence fades and speech does not
  jitter too hard.
- Avatar lipsync first attempts GLB morph targets such as `MouthOpen`, `jawOpen`, and common
  viseme names. If the exported avatar has no usable morph target, the fallback avatar mouth still
  moves from the same amplitude signal.
- Expert bridge uses `Linking.openURL` instead of WebView because Jitsi screen sharing, camera,
  and microphone permissions are more reliable in the browser/native app.
- Forge cycles are displayed inside the app so the demo can show Phase B and Phase C without extra
  navigation.
