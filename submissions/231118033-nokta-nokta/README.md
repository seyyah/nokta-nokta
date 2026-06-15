# Nokta Nokta Final Submission

Track: A — Voice Visualizer + Avatar + Expert Bridge

---

## Student

**Student No:** 231118033  
**Project:** Nokta Nokta Voice Forge  
**Submission Folder:** `submissions/231118033-nokta-nokta`

---

## Project Summary

This submission extends the previous Nokta app with a final integrated flow:

1. The user speaks into the microphone.
2. The app visualizes the voice signal with animated waveform bars.
3. The personal `avatar.glb` model is rendered in a React Three Fiber scene.
4. Voice activity drives RMS-based avatar motion.
5. Persona modes can read Turkish feedback with different tones.
6. Voice/STT or demo fallback text is converted into audit-style markdown.
7. The audit findings are fed into a documented forge loop.
8. If the flow enters FAIL / ROLLBACK / STUCK, the app opens an expert bridge through Jitsi Meet.

---

## Included Files

```text
submissions/231118033-nokta-nokta/
├── README.md
├── FORGE.md
├── BRIDGE.md
├── PERSONAS.md
├── DECISIONS.md
├── avatar.glb
├── app-release.apk
├── audit-reports/
│   ├── report-01-voice.md
│   ├── report-02-avatar.md
│   └── report-03-bridge.md
└── app/
    ├── App.tsx
    ├── App.native.tsx
    ├── AvatarScene.tsx
    ├── avatar.glb
    ├── app.json
    ├── eas.json
    ├── package.json
    ├── package-lock.json
    ├── index.ts
    ├── metro.config.js
    ├── tsconfig.json
    ├── declarations.d.ts
    └── assets/
        ├── avatar.glb
        ├── icon.png
        ├── favicon.png
        ├── splash-icon.png
        ├── android-icon-background.png
        ├── android-icon-foreground.png
        └── android-icon-monochrome.png
Phase A — Voice Visualizer

The app captures microphone input and visualizes the signal with animated waveform bars.

Implemented
- Microphone permission flow
- Real-time audio level calculation
- RMS-style level indicator
- Raw RMS and Peak debug values
- Animated bars that move while speaking
- Idle state when silent
- Manual visualizer test fallback for demo reliability
Status
Microphone opens: Yes
Voice bars move: Yes
Silence state: Yes
Latency target: < 200ms visual response target
Fallback visualizer: Yes
Phase B — Avatar + Lipsync Fallback

The app renders a personal Avaturn-exported avatar.glb file with React Three Fiber.

Implemented
- Personal avatar model included as avatar.glb
- Avatar rendered in AvatarScene.tsx
- RMS level is passed from the voice visualizer to the avatar scene
- Avatar reacts to speech using RMS-based motion
- Persona TTS activity can also move the avatar
Important Limitation

The current Avaturn .glb export does not expose reliable facial morph targets such as:

jawOpen
mouthOpen
viseme_AA
viseme_O

Because of this, full phoneme/viseme lipsync could not be completed with the current model.

The project keeps a stable RMS-based and TTS-driven avatar motion fallback and documents this limitation in:

README.md
FORGE.md
BRIDGE.md
DECISIONS.md
Status
Full viseme lipsync: Not fully completed
RMS-based avatar motion fallback: Active
TTS-driven avatar motion fallback: Active
Personal avatar: Yes
Phase B — Voice to Audit Markdown

The app includes a voice-to-audit flow.

Implemented
- Dictation area for audit notes
- STT support where the browser supports SpeechRecognition
- Dictation status display
- Demo STT fallback text button
- Clean demo audit text loader
- Markdown audit report generation
- Audit reports stored under audit-reports/
Audit Reports
audit-reports/report-01-voice.md
audit-reports/report-02-avatar.md
audit-reports/report-03-bridge.md
Phase B — Personas

The app includes two persona modes:

Junior-Sen
Senior-Sen

These are documented in PERSONAS.md.

Implemented
- Junior-Sen / Senior-Sen switch
- Turkish persona feedback reading
- Different rate and pitch settings
- Junior-Sen: supportive and guiding
- Senior-Sen: slower, deeper, technical and validation-focused
- Avatar motion during persona reading
Phase C — Forge Loop

The forge loop is documented in FORGE.md.

Required Evidence
Cycle 01: COMMIT
Cycle 02: COMMIT
Cycle 03: ROLLBACK
Cycle 04: STUCK

Additional implementation cycles are also documented for persona reading, demo fallback, and native APK fallback.

Forge Loop Includes
- 3 burn-in audit reports
- at least 2 COMMIT cycles
- at least 1 ROLLBACK cycle
- 1 intentional STUCK scenario
- 20-minute timebox per cycle
- expert bridge escalation
Expert Bridge

The app opens a Jitsi Meet bridge when the flow is stuck.

Bridge URL
https://meet.jit.si/231118033-nokta-nokta-bridge
Bridge Session
Expert: Alperen Eri
Duration: 150 seconds
Audio: demonstrated
Video: demonstrated
Screen sharing: demonstrated
Summary: documented in BRIDGE.md
Native APK Fallback

The project includes App.native.tsx for Android APK build safety.

The full interactive experience uses web-only APIs such as:

window
navigator.mediaDevices
AudioContext
SpeechRecognition
speechSynthesis

Because these APIs are not guaranteed in native Android runtime, the native APK uses a safe fallback screen.

APK purpose: installable delivery artifact
Full demo purpose: web-based interactive video demonstration
How to Run
Web Demo
cd submissions/231118033-nokta-nokta/app
npm install
npx expo start --web
Android APK Build
cd submissions/231118033-nokta-nokta/app
eas build --platform android --profile preview
Demo Video

The final demo video shows:

1. App running
2. Microphone visualizer
3. Voice bars reacting to speech or demo voice fallback
4. Avatar scene with personal avatar
5. RMS/TTS-based avatar motion fallback
6. Junior-Sen / Senior-Sen persona switch
7. Persona Turkish report reading
8. Voice-to-markdown audit generation
9. Forge timeline with COMMIT / ROLLBACK / STUCK
10. STUCK selection
11. Jitsi expert bridge opening
12. Audio/video/screen sharing for at least 60 seconds
Demo Video Link
https://youtu.be/buZz6u4RkRA
APK

APK is included in the submission folder as:

app-release.apk
APK Download Link
https://expo.dev/accounts/hakankocoo/projects/app/builds/67a2fa29-6531-422f-b29d-afc75ab0a21b
Verification
npx expo install --check  -> passed
npx tsc --noEmit          -> passed
expo-doctor               -> only expo-av maintenance warning remains
Jitsi bridge              -> tested
Expert duration           -> 150 seconds
Expert                    -> Alperen Eri
Known Limitations
1. STT works only where browser SpeechRecognition is available.
2. Browser microphone access depends on Chrome/Windows microphone permissions.
3. The current Avaturn GLB does not expose reliable facial viseme/mouth morph targets.
4. Full phoneme/viseme lipsync is documented as a future improvement.
5. RMS-based and TTS-driven avatar motion are used as stable fallbacks.
6. Native APK uses App.native.tsx fallback; full interactive demo is shown in the web demo video.
7. Automatic Jitsi transcription is not implemented; the bridge summary is manually documented in BRIDGE.