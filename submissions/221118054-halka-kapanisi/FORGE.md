# FORGE.md — Halka Kapanışı Cycle Ledger

> Student 221118054 · Track A
>
> Format: spec §5 row template.
> Cycle'lar Claude Code CLI ile koşturuldu. Her cycle 20dk kutulu.
> 3 cycle: 2 COMMIT + 1 ROLLBACK (spec §4 Phase B kontrolü ≥2+≥1).

---

## Özet

| Cycle | Slug | Status | Süre | Commit |
|---|---|---|---|---|
| 1 | voice-viz-idle-flat | COMMIT | 14dk | `aa8c5cd` |
| 2 | avatar-mouth-multiplier | ROLLBACK | 12dk | — |
| 3 | mic-permission-silent-fail | COMMIT | 10dk | `cce293e` |

Toplam: **2 COMMIT + 1 ROLLBACK** ✓

---

## Cycle 1 — voice-viz-idle-flat — 2026-05-23T14:10

STATUS: COMMIT
INPUT: audit-reports/audit-1-viz-idle.md
HYPOTHESIS: Idle state'te 24 bar dümdüz duruyor; sinusoidal subtle pulse eklenmeli (genlik 4px, period 800ms).
CHANGES: src/voice/VoiceVisualizer.tsx (useEffect içinde active==false branch'i)
TEST: Expo Go'da mic kapalıyken barlar görsel olarak nefes alıyor; mic açılınca level ile geçiş smooth.
DURATION_MIN: 14
NOTES: Minimal diff: tek dosya, ~5 satır. Reanimated yerine RN Animated yeterli geldi.

---

## Cycle 2 — avatar-mouth-too-wide — 2026-05-23T14:45

## Cycle 2 — avatar-mouth-multiplier — 2026-05-25T22:10

STATUS: ROLLBACK
INPUT: audit-reports/audit-2-mouth.md
HYPOTHESIS: targetMouthOpen = level * 1.5 ile dudak hareketini büyütünce daha konuşkan görünür (H1).
CHANGES: src/avatar/AvatarScene.tsx (1.5 multiplier — manuel geri alındı)
TEST: Visual check — morph değerleri 1.0 normalizasyon aralığını aşıyor; avaturn model clamp ihlali riski.
DURATION_MIN: 12
NOTES: ROLLBACK — manuel revert (dosya henüz git'e eklenmemişti). H2: lerp factor 0.45→0.55 daha kontrollü hızlanma sağlar.

---

## Cycle 3 — mic-permission-silent-fail — 2026-05-23T15:25

STATUS: COMMIT
INPUT: audit-reports/audit-3-mic-permission.md
HYPOTHESIS: Mikrofon izni reddedildiğinde UI sessiz kalıyor; Alert ile bilgilendir.
CHANGES: src/voice/useMicAnalyzer.ts (setError çağrısı zaten vardı), app/index.tsx (mic.error → Alert.alert)
TEST: Cihaz ayarlarından mic iznini geri çek → uygulamayı yeniden aç → "Konuş" butonuna bas → Alert "Mikrofon izni reddedildi" gösterildi.
DURATION_MIN: 12
NOTES: Minimal diff — 2 satır eklendi, 0 satır silindi. Error path'i artık görünür.

---

## Ratchet notu

Cycle 2 rollback'i ledger'dan silinmedi (Karpathy disiplini: başarısız hipotez veri).
Cycle 4 (gelecek, bu submission kapsamı dışı): H2 lerp tweak — `current + (target - current) * 0.6`
denenebilir. Cycle 2'nin tuzağı (multiplier > 1.0) tekrarlanmayacak.

---

## Phase C STUCK kaydı

Spec §C için bilinçli STUCK senaryosu da bu ledger'da loglu olabilir; ancak BRIDGE.md
ayrı dosya olarak verildi. Cross-ref: `BRIDGE.md::halka-stuck-cycle-demo`.
