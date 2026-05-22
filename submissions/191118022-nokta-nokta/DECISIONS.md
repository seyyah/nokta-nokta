# DECISIONS

| Time | Decision | Reason |
|---|---|---|
| 2026-05-22T00:00+03:00 | Use `seyyah/nokta-nokta` as the write target | The final challenge contract says previous repos are read-only context and only `nokta-nokta` receives the PR. |
| 2026-05-22T00:05+03:00 | Base the final app on the week-2 audit submission | It already has the drop-in widget, local storage, burn-in report flow, and Expo Router shell. |
| 2026-05-22T00:12+03:00 | Keep Track A | The fastest reliable score path is fidelity: voice visualizer, mouth sync, latency, and a clean demo. |
| 2026-05-22T00:20+03:00 | Use `expo-av` metering for the first voice visualizer pass | The spec names `expo-av`; recording metering gives a native RMS-like signal without adding DSP complexity. |
| 2026-05-22T00:28+03:00 | Use Jitsi for the expert bridge | It is keyless and avoids committing provider credentials; the app can open a stable room URL from a button. |
| 2026-05-22T00:35+03:00 | Do not fake `avatar.glb` | The spec explicitly rejects generic avatars; the app has a fallback stage, but final acceptance needs the user's own Avaturn export. |
