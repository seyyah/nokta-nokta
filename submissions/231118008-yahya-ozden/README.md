# Nokta-Nokta Submission - 231118008 yahya-ozden

Track: Voice visualizer + lipsync + bridge

## Run

```bash
cd submissions/231118008-yahya-ozden/app
npm install
npm start
```

## Demo Flow

1. Voice ekraninda `Mikrofonu Baslat` butonuna bas, konusunca barlar hareket eder.
2. Avatar ekranina gec, ayni mikrofon amplitude degeri avatar agzini oynatir.
3. Forge ekranina gec, Cycle 3 rollback sonrasi `STUCK detected` ve `Uzmana Baglan` gorunur.
4. Buton Jitsi odasini acar: `https://meet.jit.si/nokta-nokta-231118008-stuck-bridge`

## Required Files

- `app/` Expo MVP
- `avatar.glb` and `app/assets/avatar.glb`
- `avatar-source/` raw local GLB variants kept inside the submission folder
- `FORGE.md`
- `BRIDGE.md`
- `SUBMISSION_INDEX.md`
- `DEMO.md`
- `app-debug.apk` local Android debug build output
- `app-release.apk` standalone Android release build output

## Build Note

The APKs were built from a short temporary Windows path to avoid CMake path-length issues, then
copied back to this folder.

## PR / Classroom

Classroom submission link:

```text
https://github.com/seyyah/nokta-nokta/pull/27
```

Demo video should show the installed APK on a phone: voice visualizer, avatar lipsync, forge stuck
state, and the Jitsi expert bridge button.
