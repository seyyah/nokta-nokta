# Final Submission Index

Student no: 231118008
Slug: yahya-ozden
Track: Voice visualizer + lipsync + bridge

## Main Folder

`submissions/231118008-yahya-ozden/`

## App Source

`submissions/231118008-yahya-ozden/app/`

The app contains:

- `expo-av` microphone permission and metering.
- RMS/amplitude smoothing for the voice visualizer.
- OpenAI voice-mode style orb and bar animation.
- Avaturn `avatar.glb` loading through react-three-fiber.
- Amplitude-driven face/lip motion when viseme morph targets are not present.
- Forge cycle screen with SUCCESS / ROLLBACK states.
- STUCK heuristic and expert bridge button.
- Jitsi bridge through `Linking.openURL`.

## Required Evidence Files

- `avatar.glb`: Avaturn export at submission root.
- `app/assets/avatar.glb`: same Avaturn GLB bundled into the APK.
- `FORGE.md`: three voice-dictated audit reports and forge cycle ledger.
- `BRIDGE.md`: STUCK reason, 60+ second expert bridge note, screen share note, and next-cycle context.
- `app-debug.apk`: Android installable build.
- `app-release.apk`: Android release build.
- `DEMO.md`: demo recording checklist.

## Pull Request

PR link for Classroom:

```text
https://github.com/seyyah/nokta-nokta/pull/27
```
