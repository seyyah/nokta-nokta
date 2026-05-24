# DECISIONS.md — NoteMigrator Week 15

## Track

**Track A — Sadakat**

Chose Track A because the core deliverable (avatar + voice + forge + bridge) is identical across all tracks, and Track A's quality focus — latency, lipsync fidelity, animation smoothness — plays directly to what is already built. Adding a second persona (Track B) or autonomous STUCK detection (Track C) would require additional scope without improving the core submission.

---

## Phase A Decisions

### Why react-three-fiber over Three.js directly

R3F's declarative component model fits React Native's rendering model. Direct Three.js scene management in RN requires manual GL context lifecycle management. R3F + expo-gl handles that bridge automatically.

### Why expo-gl over bare WebGL

expo-gl is the official Expo bridge for OpenGL/WebGL. It integrates with the EAS build system and does not require ejecting. Bare WebGL would require a custom native module.

### Avatar camera: position [0, 0.6, 0.85], FOV 38

Tuned to show head + upper chest. Lower Y centers on forehead; raising to 0.6 shows the face clearly. FOV 38 avoids distortion at close range. Model shifted down to Y=-1.55 to bring the face into frame.

### Why Groq Whisper for STT

Same API key already in `.env.local` (`EXPO_PUBLIC_GROQ_API_KEY`). No second service to configure. `whisper-large-v3-turbo` is fast (< 1s for typical voice note) and multilingual (Turkish, Malay, English all work). The existing Groq integration in `claudeApi.ts` proved the raw fetch pattern works in React Native.

### Metering interval: 50ms

50ms gives 20 updates/second — enough for smooth bar animation without excessive main-thread load. The viseme `useFrame` loop drives at the canvas frame rate (~30fps on device); audioLevel is sampled at 20fps and spring-interpolated visually.

### Viseme morph targets: viseme_aa, viseme_O, viseme_E, viseme_I

Avaturn exports Ready Player Me–compatible morph targets. These four cover the primary mouth open/close shapes. A sine wave offset per morph at `Date.now()/120` adds organic variation rather than uniform single-morph snapping.

### Fallback to NoktaMascot on GLB load failure

If `avatar.glb` fails to load (device storage issue, missing asset, R3F context failure), the existing emoji mascot renders instead. The app remains functional. This also allows testing on simulators that lack full WebGL support.

---

## Phase C Decisions

### Why Jitsi over Daily.co or LiveKit

Jitsi (meet.jit.si) requires no API key and no account. Daily.co and LiveKit require account registration and API keys. For a student submission where the expert call is a classmate in the same network, Jitsi is the fastest path to a working demo. Screen share is built into the Jitsi mobile UI.

### WebView over react-native-jitsi-meet SDK

The Jitsi SDK requires additional native configuration and a larger binary. A WebView pointing to `meet.jit.si/<room>` loads the full Jitsi web client which has screen share, video, and audio without any SDK. The trade-off is no programmatic control over call state — accepted, since the demo only needs to show the call running.

### Room ID includes timestamp

`nokta-9221118097-<timestamp>` makes each bridge call use a unique room, preventing collisions with other students and ensuring the demo video shows a fresh call.

### Bridge FAB position: bottom-left

The audit 🐛 FAB is bottom-right (from AuditWidget). Placing the 📞 bridge FAB bottom-left avoids overlap. Both are always visible — Track A does not hide the bridge button behind a STUCK counter.

---

## Build Decisions

### --legacy-peer-deps for npm install

`@react-three/drei@9.x` declares a peer dependency on `@react-three/fiber@^8` but works correctly with v9. This is a known upstream semver annotation issue in the drei package. `--legacy-peer-deps` bypasses the resolution check without affecting runtime behavior.

### GLB asset declaration in app.json plugins

expo-asset requires explicit asset declaration in `app.json` plugins to bundle `.glb` files into the EAS build. Without this, the file is accessible in dev builds (Metro serves it) but missing from production APK. The plugin ensures the asset is embedded.

### metro.config.js: add glb, gltf, bin to assetExts

Metro's default asset resolver does not recognize `.glb` or `.bin` (which GLTF binary chunks use). Adding them to `assetExts` allows `require('../assets/avatar.glb')` to resolve correctly at bundle time.
