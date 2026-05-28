# FORGE.md — Cycle Ledger

**Proje:** nokta-nokta · sesli-avatar (231118014)
**Track:** A — Sadakat (voice viz + lipsync polish)
**Akış:** READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT/ROLLBACK

Audit raporları uygulama içindeki `<AuditWidget />` ile üretildi (Forge sekmesi, burn-in modu). Her cycle bir rapora bağlı, ≤20dk kutulu.

---

## Audit Raporları (input)

| # | slug | Konu |
|---|------|------|
| 1 | `voice-viz-smoothing-002` | Ses barları ani ses değişiminde sert zıplıyor, akıcı değil |
| 2 | `bridge-button-state-003` | "Uzmana Bağlan" butonu STUCK yokken de aktif görünüyor |
| 3 | `avatar-3d-render-001` | Ayna ekranında avatar gerçek 3D (GLB) yerine SVG gösteriyor |

---

## Cycle 1 — `voice-viz-smoothing` · COMMIT

- **Kutu:** 20 dk
- **INPUT:** `voice-viz-smoothing-002`
- **READ/LOCATE:** Ses seviyesi `hooks/useMicLevel.ts` içinde tek bir smoothing katsayısıyla işleniyordu; değer hem yükselirken hem düşerken aynı hızla değişiyordu. Bu yüzden barlar ani seste sert zıplayıp sert kesiliyordu.
- **HYPOTHESIZE:** Attack (yükseliş) hızlı, release (düşüş) yavaş olursa — yani asimetrik smoothing — barlar OpenAI voice-mode estetiğine yaklaşır.
- **REPAIR:** `next > prev ? attack(0.6) : release(0.15)` mantığı uygulandı. Sadece bu hook değişti.
- **TEST:** Mikrofona konuşup susuldu; barlar hızlı canlanıp yumuşak söndü.
- **VERIFY:** TypeScript check geçti, görsel akıcılık beklendiği gibi.
- **SONUÇ:** COMMIT — *"Ses görselleştirici çubukların hareketleri daha yumuşak hale getirildi"* (orijinal agent commit: `48e9d73`)

---

## Cycle 2 — `bridge-button-state` · COMMIT

- **Kutu:** 20 dk
- **INPUT:** `bridge-button-state-003`
- **READ/LOCATE:** Köprü sekmesindeki "Uzmana Bağlan" butonu sabit görünümdeydi; cycle durumuna bağlı değildi. Spec, çağrının ancak 2 ardışık FAIL/ROLLBACK sonrası tetiklenmesini istiyor.
- **HYPOTHESIZE:** Buton görünümü cycle state'ine bağlanırsa, STUCK olmadığında soluk, 2 ardışık başarısızlıkta vurgulu olur.
- **REPAIR:** Buton stili cycle ledger durumuna bağlandı (bridge ekranı dosyası).
- **TEST:** STUCK cycle yokken buton soluk; iki ardışık FAIL simüle edilince vurgulu hale geldi.
- **VERIFY:** TypeScript check geçti, tetikleme kuralı spec'e uygun.
- **SONUÇ:** COMMIT — *"Yardım butonu artık sadece ardışık hata durumlarında çalışacak şekilde güncellendi"* (orijinal agent commit: `db3cb34`)

---

## Cycle 3 — `avatar-3d-render` · ROLLBACK

- **Kutu:** 20 dk
- **INPUT:** `avatar-3d-render-001`
- **READ/LOCATE:** Ayna ekranı, gerçek 3D avatar yerine SVG tabanlı bir yüz kullanıyordu. Hedef: `avatar.glb` (Avaturn T2, viseme/jawOpen içeren) dosyasını gerçek 3D olarak render edip mic seviyesini `jawOpen` morph target'ına bağlamak.
- **HYPOTHESIZE:** `expo-gl` + `expo-three` + `@react-three/fiber/native` ile GLB mobilde 3D render edilebilir; viseme pipeline `wass08/r3f-lipsync-tutorial` pattern'iyle bağlanır.
- **REPAIR:** 3D sahne entegrasyonu denendi (Ayna ekranı + Avatar bileşeni).
- **TEST:** Expo Go runtime'ında GLB asset çözümlenemedi ("bir şey bulunamıyor" hatası); web önizlemede ise cross-origin (CORS) fetch engeline takıldı. Gerçek 3D bağlamı stabil kurulamadı.
- **VERIFY:** Çalışan duruma dönmek için değişiklik geri alındı; mevcut SVG lipsync fallback'e dönüldü. Aynı 0..1 `jawOpen` sinyali SVG ağız açıklığını sürmeye devam ediyor.
- **SONUÇ:** ROLLBACK — başarısız hipotez loglandı. `avatar.glb` repoda mevcut; GLB'yi gerçek 3D bağlayan üretim adımı bir sonraki tur için açık iş olarak bırakıldı. (ilgili agent commit: `0211cc2`)

---

## Kabul Kriteri Özeti

| Kriter | Hedef | Durum |
|--------|-------|-------|
| Başarılı cycle | ≥2 | 2 (Cycle 1, 2) |
| Rollback | ≥1 | 1 (Cycle 3) |
| Her cycle kutulu | ≤20 dk | ✓ |
| Audit raporu input | ≥3 | 3 |

**Not:** Cycle 3'teki rollback, spec'in "başarısız hipotez değerli veridir, logla" ilkesi gereği gizlenmeden kaydedildi.
