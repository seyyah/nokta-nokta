# FORGE.md - Cycle Ledger

## Cycle 1 — mic-visualizer-refinement — 2026-05-28T22:20
STATUS: COMMIT
INPUT: submissions/231118026-ceren-diyet/reports/audit-1.md
HYPOTHESIS: Web Audio API mikrofon analizinde RMS genliği gürültü eşiğini (noise floor) kesmezse ses dalgası sönmelidir.
CHANGES: submissions/231118026-ceren-diyet/app/src/components/VoiceVisualizer.tsx
TEST: Tarayıcıda sessiz durulduğunda dalgaların 0.5px yüksekliğe kadar söndüğü, konuşulduğunda 100px yüksekliğe sıçradığı manuel olarak gözlemlendi.
DURATION_MIN: 15
NOTES: Mikrofondan gelen arka plan tıslama gürültüsü RMS filtresiyle (rms < 0.01) başarıyla engellendi.

---

## Cycle 2 — speech-synthesis-language-fix — 2026-05-28T22:38
STATUS: ROLLBACK
INPUT: submissions/231118026-ceren-diyet/reports/audit-2.md
HYPOTHESIS: Web Speech API TTS sentezinde sistem sesini zorla İngilizce (en-US) yaparak Türkçe kelimeleri İngilizce aksanıyla konuşturmak.
CHANGES: submissions/231118026-ceren-diyet/app/src/components/Avatar2D.tsx
TEST: Türkçe metinlerin telaffuzu anlaşılmaz bir hal aldı, robotik ses kalitesi bozuldu.
DURATION_MIN: 12
NOTES: Diyet danışanının motivasyonunu kırmamak için sistem yerel Türkçe sesleri (`tr-TR`) kullanacak şekilde geri alındı (ROLLBACK).

---

## Cycle 3 — autonomous-bridge-trigger — 2026-05-28T22:55
STATUS: COMMIT
INPUT: submissions/231118026-ceren-diyet/reports/audit-3.md
HYPOTHESIS: Üst üste 2 kez olumsuz/diyet bozucu kelime algılandığında Jitsi video bridge çağrısı otonom olarak tetiklenmeli.
CHANGES: submissions/231118026-ceren-diyet/app/src/App.tsx, submissions/231118026-ceren-diyet/app/src/components/VideoBridge.tsx
TEST: Kullanıcı "Hamburger yiyeceğim" dedikten hemen sonra "Çok mutsuzum, diyeti bozuyorum" dediğinde otomatik olarak Jitsi çağrısının ekranı kapladığı test edildi.
DURATION_MIN: 18
NOTES: Otonom tetikleyici kusursuz çalışıyor. Görüşme transkripsiyonu BRIDGE.md'ye aktarıldı.
