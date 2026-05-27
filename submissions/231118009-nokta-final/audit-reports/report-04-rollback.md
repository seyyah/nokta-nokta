# Nokta Audit Report

- **Report ID:** 231118009-r04-rollback
- **Screen:** /
- **Captured:** 2026-05-19 10:20
- **Device:** web preview
- **Annotations:** 1

## Finding 1

- **Region:** x=24, y=318, width=332, height=52
- **Selected UI:** Home ekranindaki ana aksiyon butonu
- **Note:** Butonu neon yesil yapmayi deneyelim mi?
- **Expected:** Renk denemesi okunabilirligi ve sade arayuz dilini bozmamali.
- **Observed:** Neon yesil, mevcut sari aksiyon rengi ve sade track hedefiyle cakisma riski tasiyor.

## Rollback Heuristic

If the repair makes the primary action look visually noisy, breaks contrast, or conflicts with the previous successful yellow-button report, ROLLBACK.

## Agent Instructions

Use the READ -> LOCATE -> HYPOTHESIZE -> REPAIR -> TEST -> VERIFY -> COMMIT/ROLLBACK loop.

1. Neon yesil denemesini degerlendir.
2. Onceki sari buton cycle'i ile karsilastir.
3. Sadelik bozuluyorsa kalici kod degisikligi yapma.
