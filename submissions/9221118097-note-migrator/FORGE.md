# FORGE.md — NoteMigrator Forge Ledger

## Rules
- Each cycle: READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT/ROLLBACK
- Time box: 15 minutes per cycle
- Ratchet: new fix cannot break existing behavior
- Commit format: [FORGE: ScreenName] Description — Xkg
- kg weights: style fix=5kg, layout fix=10kg, new feature=20kg, API integration=30kg

## Cycles

| # | Report | Hypothesis | Result | Files Changed | Test | Commit | kg | Human Touch Points |
|---|---|---|---|---|---|---|---|---|
| 1 | report-01-review-screen.md | Add a rejection reason modal (TextInput + confirm) that fires when user taps ✗ Reject. Reason stored in local state `rejectedReasons` keyed by card id. Shown as a red badge on the card. Skip button allows rejecting without a reason. | ✅ COMMITTED | `screens/ReviewScreen.tsx` | `npx tsc --noEmit` → 0 errors | `a903ec9` [FORGE: ReviewScreen] Add rejection reason modal — 20kg | 20kg | Review: modal UX, "Skip" vs "Confirm" labeling |
| 2 | report-02-cards-screen.md | Add a horizontal scrollable filter bar above the FlatList with chips: All · 🍳 · 📚 · ⏰ · 💡 · 📌. Active chip highlighted purple. Cards array filtered by `activeFilter` state before render. Header count updates to show `filtered / total`. | ✅ COMMITTED | `screens/CardsScreen.tsx` | `npx tsc --noEmit` → 0 errors | `13be2cd` [FORGE: CardsScreen] Add category filter bar — 20kg | 20kg | Review: empty-state message wording |
| 3 | report-03-dump-screen.md | Add a camera/photo button that opens `expo-image-picker`, reads a photo, and runs OCR (via a free OCR API or `expo-modules-core`) to extract text into the TextInput. | ❌ ROLLBACK | — | — | — | — | **Why rolled back:** `expo-image-picker` is not installed and cannot be added without maintainer approval (per CLAUDE.md "Dep Lock" gate). No OCR native module is available in the current SDK bundle. No free OCR API key is configured in the project. Implementing any of these would violate the hard gate on unauthorized dependencies and would not be verifiable within the 15-minute cycle. Hypothesis too complex without pre-approved infrastructure. |
| 4 | report-03-dump-screen.md (retry) | Smaller hypothesis: add a "📋 Paste from Clipboard" button above the TextInput using `expo-clipboard` (SDK 54-compatible). Tapping it reads `Clipboard.getStringAsync()` and appends content to the existing TextInput value. No camera, no OCR, no new API key. | ✅ COMMITTED | `screens/DumpScreen.tsx`, `package.json`, `package-lock.json` | `npx tsc --noEmit` → 0 errors | `974cb50` [FORGE: DumpScreen] Add clipboard paste button — 10kg | 10kg | Review: consider clearing vs. appending clipboard content |

---

## Week 15 Cycles

## Cycle 5 — avatar-color-facing — 2026-05-24T12:10
STATUS: COMMIT
INPUT: audit-reports/report-04-avatar-on-dump-screen.md
HYPOTHESIS: Avatar appears colorless because Avaturn PBR materials require an environment map; add drei <Environment preset="city" /> inside the R3F Suspense boundary. Avatar not facing forward because Avaturn exports face +Z away from camera; add rotation={[0, Math.PI, 0]} to primitive.
CHANGES: app/components/AvatarMascot.tsx
TEST: npx tsc --noEmit → 0 errors
DURATION_MIN: 8
NOTES: Also reduced ambientLight to 0.6 and added a fill directionalLight from behind-left to avoid flat lighting. Environment preset loads an HDR from drei's bundled presets — no external asset required.

## Cycle 6 — avatar-lipsync-fft — 2026-05-24T12:20
STATUS: ROLLBACK
INPUT: audit-reports/report-04-avatar-on-dump-screen.md
HYPOTHESIS: Replace simple RMS audioLevel with per-frequency FFT bins so each viseme morph maps to a specific frequency band (aa→low, O→mid-low, E→mid, I→high) for more accurate lipsync.
CHANGES: —
TEST: —
DURATION_MIN: 14
NOTES: expo-av's Audio.Recording does not expose FFT data — only metering (single dB value). Implementing a Web Audio API analyser in React Native would require react-native-audio-api or expo-modules-core custom native module, neither of which is in the approved dependency set. Cannot be completed within 20 min cycle budget without a pre-configured DSP pipeline. Rolled back. Future path: use expo-av playback with AnalyserNode once expo-audio (SDK 55) ships.

## Cycle 7 — voice-bars-color-theme — 2026-05-24T12:36
STATUS: COMMIT
INPUT: audit-reports/report-04-avatar-on-dump-screen.md
HYPOTHESIS: Voice bars use a static blue (#3B82F6) that clashes with the app's purple (#6c47ff) accent color. Changing bar color to #6c47ff and adding a gradient-style opacity variation per bar makes the visualizer feel native to the app's design system.
CHANGES: app/components/VoiceBars.tsx
TEST: npx tsc --noEmit → 0 errors
DURATION_MIN: 6
NOTES: Also increased MAX_HEIGHT from 80 to 96px for more visual presence in the taller DumpScreen layout.

---

## Total weight accumulated: 50kg (20 + 20 + 0 + 10) + Week 15 cycles

## Evaluation set (EVAL.md candidates)
- **ReviewScreen reject modal:** tapping ✗ Reject opens modal → typing reason → tapping Reject stores reason on card → red badge appears. Skip path also works.
- **CardsScreen filter bar:** tapping 📚 shows only Study cards; count updates; tapping All resets; empty state shown when no cards match.
- **DumpScreen clipboard:** tapping 📋 Paste appends clipboard text to input; empty clipboard shows alert.

## Failed hypotheses log
- **Cycle 3 — Camera OCR:** Blocked by missing `expo-image-picker` and no OCR service available within the project's approved dependency set. Future cycle: add `expo-image-picker` after maintainer approval, wire to a configured OCR endpoint (e.g. Google Vision, Tesseract WASM).
