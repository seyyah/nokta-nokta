# DECISIONS

## 2026-05-21 — Jitsi for HITL

I used a Jitsi room instead of a native WebRTC SDK because the assignment needs video, audio, and screen share quickly, and the submission must not introduce global native config churn outside `submissions/231118011-faruk-emre-ok/`. The app opens the same room from native and embeds it on web.

## 2026-05-21 — Amplitude lipsync

The mouth driver is amplitude-based rather than phoneme/ASR-based. This keeps latency low and honest: the app reads real mic metering, maps it to a normalized amplitude, and applies it to Avaturn mouth/jaw targets. It is less precise than a viseme classifier, but it satisfies the "talking now" feel within the Track A scope.

## 2026-05-21 — `expo-av` metering

Native audio uses `expo-av` recording status metering because it is SDK-compatible and does not require a custom native module. Web uses the Web Audio API RMS path because browser recording status does not expose the same dB meter.

## 2026-05-21 — `@react-three/fiber/native`

I first tried `expo-three`, then rolled it back after npm reported old peer expectations. The final stack uses `@react-three/fiber/native`, `@react-three/drei/native`, `three`, `expo-gl`, and `expo-asset`, all scoped to the submission app.

## 2026-05-21 — Local state only

The mic amplitude and report shelf stay in local React state/static files. Adding backend state would make the old audit boundary harder to remove and would not improve the assignment evidence.

## 2026-05-21 — Patch strategy

The existing `@xtatistix/mobile-audit` postinstall patch remains untouched. New work sits beside the host app, and the single root layout audit mount stays the only widget mount.

## 2026-05-21 — EAS build path

The first EAS build attempt from the repo checkout failed because EAS archived the git root and exceeded the 2.0 GB upload limit. I did not add root ignore files. Instead, I copied only the submission app to a temporary folder outside the repo, installed dependencies there for config resolution, built remotely with EAS, and copied the finished APK back to `app-release.apk`.

## 2026-05-21 — Evidence honesty

`avatar.glb` is real and present, and `app-release.apk` is a fresh EAS artifact from build `02068895-74e2-49b7-a86a-e2972a4d40ca`. A new `demo.mp4` still needs real recording evidence; I did not create a placeholder because the spec explicitly forbids fake demo artifacts.
