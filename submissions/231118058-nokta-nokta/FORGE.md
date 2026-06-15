# FORGE.md — Otonom Onarım Döngüleri

## Cycle 1 — ui-modernizasyon — 2026-05-21T17:30
STATUS: COMMIT
INPUT: audit-report-1779391690776.md
HYPOTHESIS: Login ekranı daha modern bir tasarıma kavuşturulmalı, buton kaymaları düzeltilmeli.
CHANGES: src/screens/LoginScreen.tsx — KeyboardAvoidingView eklendi, Lucide ikonları entegre edildi.
TEST: UI kayması giderildi; emülatörde ve fiziksel cihazda dokunma testleri geçti.
DURATION_MIN: 18
NOTES: Ajan tasarımı başarıyla yeniledi. Commit SHA: ui-modernize-v1.

## Cycle 2 — lipsync-ilk-deneme — 2026-05-21T18:10
STATUS: ROLLBACK
INPUT: audit-report-1779392269632.md
HYPOTHESIS: Avatarın ağız hareketleri RMS değerine bağlanacak.
CHANGES: app/assets/avatar.html — WebGL morph target binding eklendi.
TEST: WebGL performansı düştü, dudak senkronizasyonunda 500ms gecikme ölçüldü (hedef <200ms).
DURATION_MIN: 20
NOTES: Latency <200ms hedefine ulaşılamadı. git revert ile önceki çalışan sürüme dönüldü.

## Cycle 3 — lipsync-stuck — 2026-05-21T19:00
STATUS: STUCK
INPUT: audit-report-1779393960583.md
HYPOTHESIS: postMessage polling frekansı artırılarak latency 200ms altına düşürülecek.
CHANGES: app/assets/avatar.html — polling interval 100ms→50ms denendi.
TEST: Gecikme ölçüldü, hâlâ >200ms; ikinci ROLLBACK. Bridge call tetiklendi.
DURATION_MIN: 20
NOTES: Ajan kendi başına çözemedi. Human-in-the-loop köprüsü açıldı (bkz. BRIDGE.md).

## Cycle 4 — lipsync-optimizasyon-expert — 2026-05-21T20:30
STATUS: COMMIT
INPUT: BRIDGE.md — expert görüşme özeti (2026-05-21T19:30)
HYPOTHESIS: Expert tavsiyesi üzerine postMessage frekansı 50ms→16ms (requestAnimationFrame) yapılarak latency 200ms altına düşürülecek.
CHANGES: app/assets/avatar.html — setInterval(50) → requestAnimationFrame döngüsüne geçildi.
TEST: Ölçülen latency <100ms. Dudaklar akıcı biçimde ses amplitüdüne uyum sağlıyor.
DURATION_MIN: 19
NOTES: Uzman desteği sorunu çözdü. BRIDGE feedback doğrudan sonraki cycle input'u oldu.