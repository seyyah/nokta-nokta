# Audit Reports — Voice · Avatar · Bridge

Phase B ACCEPTANCE: "≥3 burn-in audit raporu üret — raporları **sesli dikte** et."

Bu klasördeki üç rapor sesli dikte ile üretildi (Türkçe konuşma → manuel transkripsiyon → markdown — Whisper / cihaz STT). Transcript'ler raporun başında **"Konuştuğum"** bloğunda bire bir verildi.

| Rapor | Cycle | Status |
|-------|-------|--------|
| `voice-bug-studio-bars.md` | Cycle 1 — voice-meter-bootstrap | COMMIT |
| `voice-bug-avatar-load.md` | Cycle 2 — avatar-native-r3f / Cycle 3 — avatar-webview-pipeline | ROLLBACK → COMMIT |
| `voice-bug-bridge-permission.md` | Cycle 4 — bridge-jitsi-mount | COMMIT |

Detaylı eylem zinciri: [`../FORGE.md`](../FORGE.md).

## Screenshots

Burn-in ekran görüntüleri demo videodaki Phase B segmentinde görünür. `screenshots/` klasörü demo gününde APK'dan AuditWidget ile üretilecek (placeholder `screenshots/.gitkeep`).

## Önceki halka

Hafta 2'nin baseline'ı: bu submission'un parent'ı olan [`seyyah/nokta`](https://github.com/seyyah/nokta) içindeki `submissions/211118032-audit-forge/audit-reports/bug-report-2026-05-20-17-06.md`. O halkada Home/Chat/Mentor düzeltildi; bu halkada Studio/Avatar/Bridge eklendi.
