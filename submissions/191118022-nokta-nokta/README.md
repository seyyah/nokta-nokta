Track: A

# 191118022-nokta-nokta

Final-week host app that closes the previous two loops: the week-2 audit widget remains mounted, voice input drives a live visualizer, avatar lipsync is staged for the required Avaturn `avatar.glb`, and repeated forge failures open a human expert bridge.

## Quick Links

- App root: [`app/`](./app)
- Audit reports: [`audit-reports/`](./audit-reports)
- Forge ledger: [`FORGE.md`](./FORGE.md)
- Bridge notes: [`BRIDGE.md`](./BRIDGE.md)
- Decisions: [`DECISIONS.md`](./DECISIONS.md)

## Current Status

| Requirement | Status |
|---|---|
| Expo + TypeScript app | Done |
| `<AuditWidget />` mounted | Done |
| Voice visualizer with mic metering | Done |
| Voice dictation surface | Done |
| Avatar lipsync pipeline | Scaffolded |
| Own-face `app/avatar.glb` | Pending user export |
| Expert bridge button | Done with keyless Jitsi room |
| ≥3 dictated audit reports | Pending device run |
| ≥2 COMMIT + ≥1 ROLLBACK forge cycles | Pending final repair pass |
| `app-release.apk` | Pending final native build |
| `demo.mp4` ≤3 min | Pending final recording |

## Expo / APK

- Expo local run: `cd submissions/191118022-nokta-nokta/app && npm install && npx expo start`
- Android native run: `npx expo run:android`
- Final APK target: `submissions/191118022-nokta-nokta/app-release.apk`

## Demo Plan

1. Open Voice Mirror, start microphone, speak, and show bars leaving idle state.
2. Open Avatar Mirror, speak again, and show mouth movement responding to RMS + dictated text.
3. Use the audit FAB to produce three burn-in reports from voice/avatar/bridge screens.
4. Show forge cycle outputs in `FORGE.md`.
5. Open Human Bridge and join the Jitsi room with a classmate sharing screen for at least 60 seconds.

## AI Tool Log

- Codex used for repository inspection, final-week spec mapping, app scaffolding, TypeScript implementation, and verification.
- AWS AI-DLC reference informed the human-in-the-loop boundary: AI executes planned cycles while the human approves critical artifacts and the expert bridge.
- `awslabs/aidlc-workflows` informed the persistent artifact style: decisions, ledger, bridge writeback, and repository-local context.

## Human Touch Points

Current count: `1`

1. User approved continuing with the most logical route: audit app as base, hoop capabilities folded in.

This count will change after `avatar.glb`, APK, audit report capture, and demo recording are completed.
