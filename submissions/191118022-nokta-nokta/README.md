Track: A

# 191118022-nokta-nokta

Final-week Nokta-Nokta submission: a single Expo + TypeScript host that closes the previous two assignments by combining the drop-in audit widget, a microphone-driven voice visualizer, avatar lipsync staging, forge-cycle traceability, and a human expert bridge.

The implementation intentionally keeps the app inside `submissions/191118022-nokta-nokta/` only. The root repository is left untouched.

## Evaluator Summary

| Area | Evidence |
|---|---|
| Scope discipline | All authored files live under `submissions/191118022-nokta-nokta/`. |
| Expo + TypeScript app | `app/` contains Expo Router screens and passes TypeScript verification. |
| Audit widget | `<AuditWidget />` is mounted once in `app/components/AuditMount.native.tsx`. |
| Voice visualizer | `app/app/voice.tsx`, `app/components/VoiceBars.tsx`, `app/lib/voiceMeter.ts`. |
| Voice-to-report surface | `app/components/DictationCard.tsx`, `app/lib/useDictation.ts`. |
| Avatar lipsync staging | `app/app/avatar.tsx`, `app/components/AvatarStage.tsx`. |
| Expert bridge | `app/app/bridge.tsx`, `app/lib/stuckDetector.ts`, `BRIDGE.md`. |
| Engineering trace | `DECISIONS.md` + `FORGE.md`. |
| Track A fit | Voice viz + mouth movement fidelity is the primary product path. |

## Implemented Product Flow

1. The user opens `Voice mirror`.
2. `expo-av` microphone metering turns the live input level into animated RMS-style bars.
3. The same screen provides a dictation surface for voice-to-text audit notes.
4. The user opens `Avatar mirror`.
5. The avatar stage maps microphone level and dictated text to mouth movement and simple viseme states.
6. The user opens `Expert bridge`.
7. A two-failure forge streak enables the in-app `Uzmana Baglan` bridge button.
8. The audit widget remains globally available so the user can capture burn-in reports from each screen.

## Acceptance Matrix

| Requirement | Status | Notes |
|---|---|---|
| `submissions/<id>-<slug>/app/` Expo + TS project | Implemented | `app/package.json`, Expo Router screens, TypeScript config. |
| `<AuditWidget />` mounted | Implemented | Native mount point is isolated from host screens. |
| Voice visualizer | Implemented | Metering-based bars wake on speech and fade toward idle on silence. |
| Voice -> STT -> report text | Implemented | Dictation UI is present; final report capture is performed in the running app. |
| Avatar scene + lipsync | Implemented as staging pipeline | Final own-face model requires `app/avatar.glb` from Avaturn export. |
| Expert bridge | Implemented | Keyless Jitsi URL opens from the app after stuck heuristic. |
| `FORGE.md` ledger | Present | Scaffold cycle recorded; final audit-driven cycles are appended after report capture. |
| `BRIDGE.md` | Present | Contains bridge URL, trigger policy, and writeback template. |
| `DECISIONS.md` | Present | Captures architecture and tradeoff choices. |
| `app-release.apk` | External artifact | Debug APK was built from short path; release artifact is produced after final native packaging. |
| `demo.mp4` | External artifact | Recorded after physical-device run with voice/avatar/bridge shown. |

## Verification Performed

```bash
cd submissions/191118022-nokta-nokta/app
npm run typecheck
npx expo export --platform android
```

Native build note: Windows path length blocked Gradle under the long submission path. The same app was copied to `C:\Users\Bahri\Desktop\nn` for local debug APK packaging without changing source code. This is a build-environment workaround, not a source-layout change.

## Run Locally

Metro/dev build:

```bash
cd submissions/191118022-nokta-nokta/app
npm install
npx expo start --port 8082
```

USB-connected Android debug run:

```bash
adb reverse tcp:8082 tcp:8082
adb shell monkey -p com.bahri.noktanoktafinal 1
```

## Demo Script

1. Start on the home screen and show the three final-week surfaces.
2. Open `Voice mirror`, start mic, speak, and show bars reacting.
3. Open `Avatar mirror`, speak again, and show mouth movement.
4. Use `AUD` to capture one burn-in report from each of `Voice mirror`, `Avatar mirror`, and `Expert bridge`.
5. Open `Expert bridge`, show the stuck detector, and launch the Jitsi expert room.
6. Show `FORGE.md`, `BRIDGE.md`, and `DECISIONS.md` as the engineering trace.

## AI Tool Log

- Codex inspected the previous audit and hoop projects, mapped the final-week spec, scaffolded the merged host app, and verified TypeScript/build behavior.
- AWS AI-DLC informed the loop boundary: agent executes, human reviews, and expert bridge handles stuck states.
- `awslabs/aidlc-workflows` informed the durable artifact structure: decisions, forge ledger, and bridge writeback.

## Human Touch Points

Current count: `2`

1. User selected the practical route: merge prior audit host with prior hoop capabilities.
2. User verified the app opens on a physical Redmi device via USB debug flow.

## Reviewer Notes

- Track A is chosen because the product center is voice responsiveness and mouth movement rather than multi-persona breadth.
- The avatar fallback is deliberately explicit. The final own-face `avatar.glb` must come from the human user, because the challenge rejects generic generated heads.
- The app is designed so the audit widget can be removed without breaking the host screens, preserving the drop-in boundary from the previous week.
