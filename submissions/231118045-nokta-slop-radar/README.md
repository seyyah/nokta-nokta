# Nokta Slop Radar - Week 3 Submission

**Student No:** `231118045`  
**Submission Folder:** `submissions/231118045-nokta-slop-radar/`  
**Project Theme:** Voice-first anti-slop audit, avatar feedback, forge repair loop, expert bridge  
**Chosen Track:** `PERSONAS + BRIDGE`

## Project Summary

Nokta Slop Radar is a mobile audit assistant for product reports and pitch drafts. The user speaks a report, watches the live voice visualizer react, receives avatar-delivered feedback, and can push repeated failures into a forge loop. When the loop gets stuck, the app exposes an expert bridge for human escalation.

Core flow:

1. Speak or paste a report draft.
2. Watch the voice visualizer and avatar react in real time.
3. Run an audit and receive a slop score plus repair actions.
4. Simulate or run forge cycles.
5. Trigger expert escalation on repeated broken cycles.

## Repo Contents

Mandatory submission artifacts already present in this folder:

- `avatar.glb`
- `FORGE.md`
- `PERSONAS.md`
- `BRIDGE.md`
- `app/`

Manual artifacts that must still be attached before final delivery:

- `3 minute demo video`
- `APK`
- `opened PR link`

## Run Locally

```powershell
cd "submissions/231118045-nokta-slop-radar/app"
npm install
npm start -c
```

For iPhone testing, use the latest Expo Go and scan the QR code.  
If LAN networking is unstable, run:

```powershell
npx expo start --tunnel -c
```

## Week 3 Features

- Live voice visualizer driven by microphone input
- Persona-based avatar feedback layer
- Voice-first hero layout with `Record -> Audit -> Repair` structure
- Forge loop state machine with `SUCCESS / FAIL / ROLLBACK`
- Expert bridge CTA for repeated broken cycles
- Local `avatar.glb` asset included in both submission root and app assets

## Decision Log

1. **Track selection:** I chose `PERSONAS + BRIDGE` because the strongest Week 3 value of this project is not only scoring reports, but showing how spoken feedback changes under different personas and how the system escalates when repeated repair cycles fail.
2. **Voice-first interface:** I rebuilt the app around `Record -> Audit -> Repair` so the product story is visible immediately instead of looking like unrelated widgets on one page.
3. **Avatar role:** The avatar is positioned as a speaking guide rather than decoration. It sits in the hero area and reacts to the live voice layer.
4. **Mobile-first delivery:** The app is optimized for Expo Go mobile demo flow. Browser support is treated as a secondary fallback path rather than the main delivery surface.
5. **Submission structure:** I documented forge cycles, persona behavior, and expert bridge flow separately so the Week 3 evaluation criteria map directly to repository artifacts.

## Delivery Checklist

Before opening the final PR, complete these manual items:

- Record one full demo video covering `Phase A + Phase B + Phase C`
- Export or link the Android APK
- Replace all `TODO` placeholders inside `FORGE.md`
- Replace all `TODO` placeholders inside `BRIDGE.md`
- Add the final demo video link below
- Add the final PR URL below

## Final Links

- Expo QR / Expo Go Link: `exp://7f40i80-yagmurtoprakli-8081.exp.direct`
- Demo Video: `TODO`
- APK: `TODO`
- PR: `TODO`
