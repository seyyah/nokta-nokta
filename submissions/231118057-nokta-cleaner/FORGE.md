# FORGE — Cycle Ledger

**Submission:** 231118057-nokta-cleaner
**Hafta 2 Track:** B  ·  **Hafta 3 Track:** A (Sadakat)
**Loop pattern:** `READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT / ROLLBACK`
**Cycle box:** Hafta 2 planlandı 15 dk · Hafta 3 brief'i 20 dk
**Şart (Hafta 3):** ≥2 COMMIT cycle + ≥1 ROLLBACK loglu, dikte edilmiş raporlardan tetiklenmiş

> **Kayıt politikası:** Asla başarısız hipotez silinmeyecek — ROLLBACK satırı COMMIT ile aynı görünürlükte kalacak. Fake-backfill yok; bir satır gerçek koşulduktan sonra doldurulur.

---

## Hafta 2 Ledger (planlandı, koşulmadı → superseded)

> **Status:** Hafta 2'de bu 4 cycle planlandı ama hiçbiri koşulmadı (her satır `<TBD>` ile teslim edildi). Hafta 3'te akış değişti: dikte edilmiş yeni raporlar (`04, 05, 06`) Hafta 3 cycle'larını besliyor. Aşağıdaki Hafta 2 hipotezleri **deprecated** statüsünde — ya Hafta 3 raporları aynı issue'yu yeniden hedefliyor (re-fed via dictation), ya da hipotez güncel kod state'iyle relevant değil. Honest history için satırları sileceğime not düşüyorum.

| # | Rapor (Hafta 2) | Hipotez | Sonuç | Notu |
|---|---|---|---|---|
| H2-1 | [`03-sessionreport-export-clipboard-only.md`](./audit-reports/03-sessionreport-export-clipboard-only.md) | Label rename: "Export Full Report" → "Copy Report to Clipboard" | **deferred** | Hafta 3 dikte raporu varsa burayı tetikleyecek |
| H2-2 | [`01-home-empty-placeholder.md`](./audit-reports/01-home-empty-placeholder.md) | `sampleData` prop + "Try sample" chip | **deferred** | — |
| H2-3 | [`02-ideacard-actionrow-overflow.md`](./audit-reports/02-ideacard-actionrow-overflow.md) | Action row primary/secondary ayır + 44pt touch target | **deferred** | — |
| H2-4 | [`03-...`](./audit-reports/03-sessionreport-export-clipboard-only.md) (extended) | `expo-sharing` + `expo-file-system` ile gerçek `.md` export | **rollback adayı (deferred)** | Hafta 3'te benzer rollback fırsatı oluşursa burayı superseded olarak işaretle |

---

## Hafta 3 Ledger (live)

> Cycle koşulduktan sonra aşağıdaki bloklar gerçek değerlerle doldurulacak.

## Cycle 1 — TBD — TBD
STATUS: TBD
INPUT: TBD
HYPOTHESIS: TBD
CHANGES: TBD
TEST: TBD
DURATION_MIN: TBD
NOTES: TBD

## Cycle 2 — TBD — TBD
STATUS: TBD
INPUT: TBD
HYPOTHESIS: TBD
CHANGES: TBD
TEST: TBD
DURATION_MIN: TBD
NOTES: TBD

## Cycle 3 — TBD — TBD
STATUS: TBD
INPUT: TBD
HYPOTHESIS: TBD
CHANGES: TBD
TEST: TBD
DURATION_MIN: TBD
NOTES: TBD

---

**Hedef dağılım:** ≥2 COMMIT, ≥1 ROLLBACK. Rollback bilinçli ve zekice olmalı (cheap shot ≠ rollback).

---

## Cycle koşma talimatı (kendin için checklist)

- [ ] Cycle başlamadan önce: `git status` temiz mi?
- [ ] Raporu agent'a tek dosya olarak yedir (`audit-reports/04-... veya 05/06`)
- [ ] Agent `LOCATE` adımında doğru dosyayı buldu mu? Bulamadıysa → ipucu ver, **human touch sayacını +1**
- [ ] `REPAIR` sonrası diff'i göz at — "fırsattan istifade refactor" var mı? Varsa reject, sadece skopu yap
- [ ] `VERIFY`: ilgili ekranı tekrar aç, sorun gerçekten gitmiş mi?
- [ ] `COMMIT` mesajı `[FORGE: EkranAdı] Açıklama — Xkg` formatında mı?
- [ ] Cycle 20 dk'yı geçti mi? Geçtiyse → mevcut durumu bu dosyaya yaz, sonraki cycle'a bırak (partial writeback)
- [ ] **ROLLBACK durumunda:** kodu geri al ama satırı **silme** — `STATUS: ROLLBACK` olarak işaretle, niye rollback olduğunu NOTES'a yaz
- [ ] **Stuck durumunda:** 2 cycle üst üste fail/rollback olursa → uygulamadaki EXPERT butonuna bas (Phase C), call sonrası BRIDGE.md'ye block ekle, sonraki cycle'a context olarak feed et
