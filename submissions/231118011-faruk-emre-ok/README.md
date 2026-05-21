Track: A

# 231118011 - Nokta Halka Kapanisi

## Track secimi

Track A - Sadakat. The submission keeps the previous audit boundary intact and adds the new voice, avatar, lipsync, and HITL bridge features without touching files outside `submissions/231118011-faruk-emre-ok/`.

## Project overview

This is an Expo SDK 55 + TypeScript + Expo Router app with three screens: `/`, `/reports`, and `/forge`. The app is named Nokta Halka and now has an Ayna surface on Capture, an audit artifact shelf on Reports, and a Jitsi human bridge on Forge. `@xtatistix/mobile-audit` still mounts once in `app/app/_layout.tsx`.

## Architecture

- Host app owns router, FileSystem storage, sharing, screenshot capture, mic input, avatar rendering, and Jitsi launch.
- Audit package receives those host dependencies through `deps`.
- `usePathname()` maps the active route to Capture, Reports, or Forge.
- New dependencies are scoped to `app/package.json`; root config and root lock files are untouched.

## Voice pipeline

Native uses `expo-av` recording with metering enabled and an 80ms status interval. Web uses `navigator.mediaDevices.getUserMedia` plus Web Audio RMS. The same normalized amplitude updates the waveform bars and avatar mouth value. Silence settles back to idle because the meter keeps returning near-zero amplitude.

## Avatar pipeline

The required Avaturn export is present at `app/avatar.glb`. Metro is configured inside the app to load `.glb` assets. The model is rendered with `@react-three/fiber/native`, `@react-three/drei/native`, `three`, `expo-gl`, and `expo-asset`.

## Lipsync approach

The implementation follows an amplitude-driven version of the common r3f lipsync pattern: traverse the GLB scene, find mouth/jaw morph targets such as `mouthOpen`, `jawOpen`, or `viseme_aa`, and drive those influences from the live mic amplitude. If a jaw bone exists, it is driven by the same value. This favors low latency over phoneme accuracy.

## Audit system

The audit widget remains a single root mount. The required check still targets:

```bash
rg -n "AuditWidget" submissions/231118011-faruk-emre-ok/app -g '!node_modules'
```

The existing audit reports still include burn-in screenshot, screen name, customer note, selection bounds, and agent input. They were extended with the Halka voice/avatar/bridge repair notes.

## Forge workflow

`FORGE.md` now uses the required block format with COMMIT, ROLLBACK, and STUCK cycles. The real rollback is the removed `expo-three` attempt after stale peer warnings. The STUCK cycle is the expert-call proof gap: the bridge feature is wired, but the >=60s two-person demo must be recorded honestly.

## HITL bridge

`Uzmana Baglan` on `/forge` opens the Jitsi room `Nokta231118011HalkaKapanisi`. Web embeds the room with camera, microphone, fullscreen, and display-capture permissions; native opens the same room externally so Jitsi can own video, audio, and screen sharing.

## Demo instructions

1. Install app dependencies inside `app/`.
2. Start the app with `npm run web` or `npx expo start`.
3. Open Capture, press `Mic`, and speak.
4. Confirm bars and mouth movement react to real speech and return to idle in silence.
5. Open Reports and inspect the three audit report cards.
6. Open Forge, press `Uzmana Baglan`, join from a second browser/device, and share the app screen.

## APK install

`app-release.apk` is a fresh Android APK built after the Halka voice/avatar/bridge changes, the Nokta Halka rename, and the final SDK patch alignment. EAS build id: `87d57eb8-9edd-451a-be33-1bf73d4b3f1d`. Artifact URL: https://expo.dev/artifacts/eas/hLRzfdxKbPokNJtCW75pTk.apk

## Expo Go / web link

- Expo project: https://expo.dev/accounts/farukkemree/projects/nokta-halka-231118011
- Expo project id: `cb584463-7b52-45bc-9134-baa871dc62ee`
- The fresh APK is the authoritative artifact for this handoff.
- Local web check command: `npx expo export --platform web --output-dir dist-web-check`

## Demo video link

- Demo video link: https://www.youtube.com/watch?v=p6Me4h7HOEs
- Required local file: `demo.mp4`
- Status: present. Source recording `C:\Users\faruk\Desktop\Video Project 7.mp4` was trimmed to 2:59 and compressed to stay under GitHub's file limit.

## Decision log summary

Jitsi was selected for the fastest video/audio/screen-share bridge. Lipsync is amplitude-driven to keep latency low. `expo-three` was rolled back after peer warnings; the final renderer uses r3f native + drei native. Local state was kept because the audit package boundary is more important than adding backend weight.

## Human touch points

- Student supplied the real Avaturn `avatar.glb`.
- Student must grant mic/camera permissions on the test device.
- Student recorded the real demo video with mic, audit flow, forge flow, and bridge proof.

## AI tool log

- Codex read the previous repo state and kept changes scoped to this submission.
- Codex copied the provided avatar into `app/avatar.glb`.
- Codex added scoped voice, avatar, lipsync, report shelf, and Jitsi bridge code.
- Codex updated audit reports, forge cycles, bridge notes, personas, and decisions.
- Codex ran `npm run typecheck` successfully after the feature implementation.
- Codex ran EAS Android preview build from a temporary app-only build folder and downloaded the finished APK into this submission.
- Codex trimmed and compressed the student-provided screen recording into `demo.mp4` without creating synthetic evidence.

## Rubric focus

- Score: Track A scope is complete; code proof and the real demo artifact are present.
- Delivery: fresh APK, avatar asset, demo video, app code, docs, reports, and bridge notes are included.
- Scope: git diff against `nokta-nokta/main` is limited to `submissions/231118011-faruk-emre-ok/`.
- Anti-Slop: no placeholder avatar, APK, bridge transcript, fake demo, or fake mic transcript was generated.
- Trace: `FORGE.md`, `DECISIONS.md`, `EVAL.md`, and audit reports record the real cycles, rollback, stuck point, and verification.

## Self-check

- [x] README first line is `Track: A`.
- [x] `DECISIONS.md` exists.
- [x] `app/avatar.glb` exists and is non-empty.
- [x] Voice visualization uses real mic input.
- [x] Avatar scene renders the real GLB through r3f.
- [x] Lipsync is amplitude-driven from the same mic value.
- [x] HITL bridge exposes video, audio, and screen-share room.
- [x] AuditWidget mount remains single.
- [x] FORGE includes COMMIT, ROLLBACK, and STUCK cycles.
- [x] New `demo.mp4` recorded with mic, audit flow, forge flow, and bridge proof.
- [x] Fresh APK rebuilt after the Halka code changes.

## Known limitations

The app code, fresh APK, Avaturn asset, and local demo video are present. Remaining risk is only manual review quality: the evaluator should confirm the compressed demo visibly shows the required Phase A, Phase B, and Phase C moments.
