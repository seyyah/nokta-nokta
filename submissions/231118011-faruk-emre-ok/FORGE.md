# FORGE

## Cycle 1 — avaturn-asset — 2026-05-21T12:51

STATUS: COMMIT
INPUT: audit-reports/capture-cta.md
HYPOTHESIS: The voice avatar can stay local to the submission if the real Avaturn GLB and 3D deps live inside the Expo app.
CHANGES: app/avatar.glb, app/package.json, app/package-lock.json, app/app.json, app/metro.config.js, app/src/assets.d.ts
TEST: `npm run typecheck` passed after the asset and dependency boundary was added.
DURATION_MIN: 6
NOTES: Commit 5b9906d. The avatar came from `C:\Users\faruk\Downloads\avatar.glb` and was copied into the required submission path.

## Cycle 2 — expo-three-peer-rollback — 2026-05-21T12:50

STATUS: ROLLBACK
INPUT: audit-reports/capture-cta.md
HYPOTHESIS: `expo-three` would simplify the native Three.js bridge without adding risk.
CHANGES: none in final tree
TEST: `npm install expo-three` produced stale peer warnings around old Expo browser polyfills; the package was removed before the feature commit.
DURATION_MIN: 3
NOTES: Rolled back to `@react-three/fiber/native` plus `@react-three/drei/native` so the app keeps Expo SDK 55 aligned.

## Cycle 3 — mic-rms-lipsync — 2026-05-21T12:51

STATUS: COMMIT
INPUT: audit-reports/capture-cta.md
HYPOTHESIS: `expo-av` metering at 80ms can drive waveform bars and mouth targets within the 200ms budget.
CHANGES: app/src/audioAmplitude.ts, app/src/components/AvatarStage.tsx, app/src/components/VoiceAvatarPanel.tsx
TEST: `npm run typecheck` passed; hook uses native metering and web WebAudio RMS instead of generated animation.
DURATION_MIN: 8
NOTES: Commit 746327e. Mouth movement first tries Avaturn morph targets such as mouthOpen/jawOpen/viseme_aa, then jaw bones if present.

## Cycle 4 — jitsi-hitl-bridge — 2026-05-21T12:51

STATUS: COMMIT
INPUT: audit-reports/forge-ratchet.md
HYPOTHESIS: Jitsi gives video, audio, and screen share fastest without native SDK churn.
CHANGES: app/src/components/BridgePanel.tsx
TEST: `npm run typecheck` passed; bridge URL is a stable Jitsi room with web iframe and native external open path.
DURATION_MIN: 5
NOTES: Commit 18aeeeb. The app contains the `Uzmana Baglan` control; the real expert call still needs to be recorded by a human participant.

## Cycle 5 — route-panel-integration — 2026-05-21T12:51

STATUS: COMMIT
INPUT: audit-reports/reports-export.md
HYPOTHESIS: The new Ayna and HITL panels can attach to existing routes without adding a second audit widget mount.
CHANGES: app/src/NoktaScreen.tsx, app/src/screens.ts, app/src/components/ReportStack.tsx
TEST: `npm run typecheck` passed; `rg -n "AuditWidget" submissions/231118011-faruk-emre-ok/app -g '!node_modules'` still returns one mount line.
DURATION_MIN: 4
NOTES: Commit b8103b4. The old Link style-array fix remains intact: no `asChild` tab links were reintroduced.

## Cycle 6 — hitl-demo-recording — 2026-05-21T12:56

STATUS: STUCK
INPUT: audit-reports/forge-ratchet.md
HYPOTHESIS: The agent can complete the >=60s expert-call demo evidence in this run.
CHANGES: none
TEST: Blocked because the required proof needs a real second human/expert bridge session with camera, microphone, and screen share.
DURATION_MIN: 2
NOTES: No placeholder `demo.mp4` was created. This is intentionally left honest until the student records the real bridge segment.

## Cycle 7 — halka-docs — 2026-05-21T13:00

STATUS: COMMIT
INPUT: audit-reports/reports-export.md
HYPOTHESIS: The handoff can be accepted or rejected faster if the README, decision log, and bridge notes call out real proof gaps.
CHANGES: README.md, DECISIONS.md, BRIDGE.md, PERSONAS.md, audit-reports/*.md, FORGE.md
TEST: Documentation scan for required README sections and exact first line `Track: A`.
DURATION_MIN: 10
NOTES: This cycle is the documentation commit created after feature code and before final verification.

## Cycle 8 — eas-root-archive — 2026-05-21T13:12

STATUS: STUCK
INPUT: FORGE.md
HYPOTHESIS: The Android APK can be rebuilt directly from the checked-out repo after adding an app-level `.easignore`.
CHANGES: app/.easignore
TEST: EAS still archived the git root and failed at 2.6 GB, above the 2.0 GB upload limit.
DURATION_MIN: 9
NOTES: Commit 4668400 keeps the app-level ignore for app-root builds, but the repo-root EAS route was abandoned because root edits are forbidden.

## Cycle 9 — eas-temp-apk — 2026-05-21T13:28

STATUS: COMMIT
INPUT: FORGE.md
HYPOTHESIS: A temporary app-only copy outside the repo can produce the required fresh APK without touching root files.
CHANGES: app-release.apk, README.md, DECISIONS.md, EVAL.md, FORGE.md
TEST: EAS Android preview build finished: `da945328-c173-4df2-82ed-3b4352974e83`; downloaded APK size is 92,585,406 bytes.
DURATION_MIN: 16
NOTES: Build URL: https://expo.dev/accounts/farukkemree/projects/nokta-audit-forge-231118011/builds/da945328-c173-4df2-82ed-3b4352974e83
