# FORGE

Track A ledger. Her cycle 15 dakika kutulu tutuldu; commit edilen cycle'lar minimal diff ile kapandi, rollback cycle'i typecheck kapisindan gecmedigi icin commit edilmedi.

## 2026-05-28 Week Extension

| time (+03) | cycle | report | hypothesis | result | changed files | test / verification | commit |
|---|---:|---|---|---|---|---|---|
| 22:44 | 8 | discovery | Full repo checkout may expose all submissions for inspection. | stuck | none | `git clone` timed out after 604s; no code changes kept | n/a |
| 23:15 | 9 | discovery | Sparse checkout scoped to Ali's submission can preserve boundaries and avoid large unrelated blobs. | success | working tree config only | `git sparse-checkout set submissions/231118060-audit-forge`; branch checkout succeeded | n/a |
| 23:21 | 10 | voice-avatar-lipsync.md | Expo AV metering can drive both voice bars and a named GLB mouth node without moving AuditWidget. | success | `app/src/audio/*`, `app/src/components/*`, `app/assets/avatar.glb`, `app/src/screens.ts`, package files | `npm run typecheck` pass; `rg "AuditWidget"` one mount | `e24e685` |
| 23:25 | 11 | bridge-escalation.md | A Jitsi external room is safer than fake native call UI for audio/video/share. | success | `app/app/bridge.tsx`, `app/src/bridge/bridgeConfig.ts`, `app/src/components/BridgePanel.tsx` | `npm run typecheck` pass | `e24e685` |
| 23:31 | 12 | audit-continuity.md | New evidence and docs can deepen the audit loop without touching repo root or other submissions. | success | `README.md`, `DECISIONS.md`, `BRIDGE.md`, `VERIFY.md`, `audit-reports/*`, `demo/demo-60s.mp4` | `npm run typecheck` pass; `npx expo install --check` pass; demo duration 60.0s | `838ecf7` |
| 23:35 | 13 | release-apk | Native mic/GL changes require a rebuilt APK, but the workspace path may break Android CMake. | rollback then success | `app-release.apk` | first prebuild failed on Turkish path; ASCII temp path + SDK junction build passed; APK zip check passed | `838ecf7` |
| 00:16 | 14 | voice-avatar-lipsync.md | The live path should expose recorder, avatar and bridge failures instead of reading as false silence. | success | `app/src/audio/useMicrophoneLevel.ts`, `app/src/components/AvatarStage.tsx`, `app/src/components/BridgePanel.tsx`, docs | `npm run typecheck` pass; `npx expo install --check` pass; `npx expo export --platform android` pass with Three export warnings; guard grep pass | `cc5ce91` |
| 00:47 | 15 | release-apk | JS-only hardening should be reflected in the APK without pretending the blocked Gradle rebuild succeeded. | rollback then success | `app-release.apk`, docs | full Gradle rebuild blocked by local Prefab/toolchain cache; `expo export:embed --bytecode` bundle injected into existing native shell; `apksigner verify` v2/v3 pass; `zipalign -c -p 4` pass | `f913d68` |

Notes:

- Cycle 8 is the real stuck case for this week. The first clone path was abandoned because it pulled too much repository history/content.
- Cycle 10 keeps the prior single mount guard: only `_layout.tsx` contains `MobileAudit.AuditWidget`.
- Cycle 11 deliberately uses an external bridge so the app does not fake audio/video/screen share.
- Cycle 13 repeats the baseline workaround: Android build tooling needs an ASCII path for NDK/CMake on this machine.
- Cycle 14 is a hardening pass after resume: it keeps the same product surface, but makes the live mic, avatar asset and bridge launch failure states explicit.
- Cycle 15 is honest about the APK path: native rebuild was attempted and blocked locally, so only the changed JS bundle was refreshed inside the already-built native shell and then re-signed.

## Previous Baseline Ledger

| cycle | report | hypothesis | result | changed files | test result | commit hash | kg | human touch points |
|---|---|---|---|---|---|---|---:|---:|
| 1 | capture-cta.md | Root layout tek audit mount ile kurulursa Capture ekrani host boundary'yi bozmadan rapor alir. | success | `app/app/_layout.tsx`, `app/app/index.tsx`, `app/src/NoktaScreen.tsx`, `app/src/screens.ts`, package files | `npm run typecheck` pass | `042023c` | 5 | 1 |
| 2 | reports-export.md | Burn-in PNG ve rapor Markdown'lari agent input kalitesini kod degistirmeden artirir. | success | `audit-reports/*.md`, `audit-reports/assets/*.png`, `app/assets/icon.png` | report checklist pass | `17b0c78` | 6 | 0 |
| 3 | forge-ratchet.md | Decision log ve EVAL altin senaryolari Track A sadeligini denetlenebilir yapar. | success | `README.md`, `IDEA.md`, `EVAL.md` | README first line + length check pass | `83636ee` | 5 | 0 |
| 4 | reports-export.md | Link route alanini yeniden adlandirmak typed route okunurlugunu artirabilir. | rollback | `app/src/NoktaScreen.tsx` (reverted) | `npm run typecheck` fail: `routee` property yok; revert sonrasi pass | n/a | 0 | 0 |
| 5 | reports-export.md | Expo SDK uyumlu paketler release APK icin daha guvenli ratchet kapisidir. | success | `app/package.json`, `app/package-lock.json` | `npm run typecheck` pass, `npx expo install --check` pass | `54f7b70` | 4 | 0 |
| 6 | forge-ratchet.md | APK release artifact sadece placeholder degil, zip icinde AndroidManifest, dex ve imza metadata'si tasimali. | success | `app-release.apk` | APK zip check pass: `AndroidManifest.xml`, `classes.dex`, `META-INF/*` var | `4504e9d` | 8 | 0 |
| 7 | capture-cta.md, reports-export.md, forge-ratchet.md | Burn-in gorseller visual ground truth tasimali ve demo linki gercek 60 sn MP4 artifact'a gitmeli. | success | `audit-reports/assets/*.png`, `demo/demo-60s.mp4`, `README.md`, `EVAL.md` | `npm run typecheck` pass, `npx expo install --check` pass, MP4 duration 60.0s, local score 103 | `3624c0a` | 6 | 0 |

## Ratchet Notes

- Cycle 4'teki basarisiz hipotez tekrarlanmayacak: route veri modeli `route` alanini korur.
- Basarili cycle'larin ortak kapisi TypeScript strict check ve scope kontroludur.
- APK release build, ASCII temp path ve Android SDK junction'iyle uretildi; teslimde yalnizca `app-release.apk` commitlenir.
- Son kanit cycle'i, score script'in goremedigi manuel kalite riskini kapatir: burn-in gorseller bos skeleton degil, metinli route state'i ve sari secim kutusu tasir.
