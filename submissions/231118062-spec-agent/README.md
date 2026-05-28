Track: C - STUCK heuristigi + Expert Bridge

# Nokta Final Week Submission

Student no: 231118062  
Slug: spec-agent  
Folder: `submissions/231118062-spec-agent/`

## Demo

- Expo: run `cd app && npm install && npx expo start`, then scan the QR with Expo Go.
- Demo video: record as `demo.mp4` after the Jitsi expert bridge rehearsal.
- APK: build as `app-release.apk` before PR if Android build credentials are available.

## Checklist

- Only `submissions/231118062-spec-agent/` was changed for this final-week work.
- `avatar.glb` exists in the submission root.
- `app/assets/avatar.glb` exists as the app-bundled GLB asset.
- Voice visualizer screen added with `expo-av` microphone metering.
- Avatar scene added with `react-three-fiber`, GLB loading, and RMS-driven mouth targets.
- Forge screen added with 2-cycle ROLLBACK/STUCK heuristic and Jitsi expert bridge button.
- `FORGE.md`, `BRIDGE.md`, and `PERSONAS.md` are present.
- `audit-reports/` contains three final-week dictated audit reports with burn-in SVG evidence.

## Decision Log

- Chose Track C because the final week rewards autonomy: the app should know when the agent is stuck and open a human bridge without waiting for a manual routing decision.
- Used `expo-av` metering as a low-latency RMS proxy. It updates every 80ms, leaving budget under the 200ms visual latency target.
- Kept the expert bridge as a Jitsi room link so the demo can prove audio, video, and screen share without adding account-bound SDK keys.
- Duplicated the avatar file into `app/assets/avatar.glb` so Metro can bundle it while the root `avatar.glb` still satisfies the required submission artifact.

## Human Touch Points

1. User supplied the real `avatar.glb` exported from Avaturn.
2. User records the final 3-minute demo video and the 60-second Jitsi screen-share segment.
3. User builds or uploads `app-release.apk` if local Android/EAS credentials are available.

## AI Tool Log

Tool: Codex  
Use: final-week app extension, voice visualizer, avatar lipsync scaffold, STUCK bridge heuristic, audit report drafting, `FORGE.md`, `BRIDGE.md`, and `PERSONAS.md`.
