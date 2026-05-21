Track: A

# Nokta-Nokta Submission - Zeynep Bakirman

Student No: 231118031  
Slug: zeynep-bakirman

## Links

Expo Link: https://expo.dev/accounts/zeynepbakirman/projects/app/builds/f3f7c3bc-f144-4ec6-82fd-ecb03456538a  
Demo Video (Phase A+B+C): https://youtu.be/oAl6NrlqfjM?si=VKcCTmsGQgbL0LVS  
Demo File: `demo.mp4`  
APK: `app-release.apk`

## Checklist

- [x] `submissions/231118031-zeynep-bakirman/` created without root project edits
- [x] README includes track selection
- [x] `app/avatar.glb` exists
- [x] `app-release.apk` added after EAS build
- [x] `demo.mp4` added to submission folder
- [x] Demo video link added after upload
- [x] Mic input drives voice visualizer
- [x] Silent state returns to idle
- [x] Avatar GLB mounts in React Three Fiber scene
- [x] Lipsync pipeline drives morph targets when present and procedural mouth fallback when absent
- [x] Mic-to-mouth app update interval configured below 200 ms
- [x] `<AuditWidget />` mounted
- [ ] `FORGE.md` has at least 3 real cycle entries after audit testing
- [ ] At least 2 COMMIT and at least 1 ROLLBACK cycle recorded after audit testing
- [x] `Uzmana Baglan` button opens an embedded Jitsi WebRTC bridge
- [x] Jitsi bridge requests video, audio, and exposes screen share
- [x] `DECISIONS.md` logs Track A and Jitsi choices

## Run

```bash
cd submissions/231118031-zeynep-bakirman/app
npm install
npx expo start
```

## Build

```bash
cd submissions/231118031-zeynep-bakirman/app
eas build -p android --profile preview
```
