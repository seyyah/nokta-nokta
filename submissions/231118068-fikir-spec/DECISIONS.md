# DECISIONS

## Track Selection

Track C was selected because the implementation adds STUCK handling and an in-app expert bridge on top of the voice visualizer and avatar scene.

## Voice and Avatar

- `expo-av` recording metering is used as the low-latency signal for animated voice bars.
- The same metering value drives avatar mouth movement through GLB morph targets and jaw bones when available.
- `app/avatar.glb` is kept at the contract path, while `app/assets/avatar.glb` is retained for the existing Metro asset import.

## Bridge

- Jitsi was selected because it needs no API key and supports video, audio, and screen sharing.
- The bridge can be opened manually, and the app also opens it after two forge fail/rollback signals.
- The bridge summary is written back as markdown so it can feed the next forge cycle.

## Audit and Forge

- `<AuditWidget />` is mounted globally in `App.tsx`.
- Audit report markdown is stored under `reports/`.
- `FORGE.md` records commit and rollback cycles with timestamps, hypotheses, tests, and outcomes.
