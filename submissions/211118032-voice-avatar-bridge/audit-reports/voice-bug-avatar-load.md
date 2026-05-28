# Bug Raporu — Nokta Voice Avatar Bridge

**Tarih:** 28.05.2026 17:00
**Toplam:** 1 not · 🔴 1 açık
**Üretim:** Sesli dikte → STT → markdown (manuel review)

---

## Ekran: Studio (Avatar sahnesi)

### 🔴 #1 — Avatar siyah kalıyor, dudak hareketi yok

![Screenshot](./screenshots/avatar-blank-2026-05-28.png)

**Konuştuğum (transcript):**

> "Stüdyo'da avatar alanı tamamen siyah. avaturn'dan glb'mi assets klasörüne koydum ama görünmüyor. Konuşunca da bir şey olmuyor, viseme'ler çalışmıyor. Native R3F mi denemeliyiz, yoksa WebView mi? Şu an üçüncü deneme, hâlâ avatarı sahneye sokamadım. Eğer GLTFLoader morph target'ları yüklemiyorsa, blendshape isimlerini kontrol etmek lazım — avaturn ARKit standardı kullanıyor olmalı."

**Etki:** Phase A ACCEPTANCE: "Avatar .glb sahnede mount + lipsync oynuyor" → ❌. Track A puanının kalbi bu — voice viz ayakta ama avatar yoksa demo eksik.

- **Durum:** Açık
- **Zaman:** 28.05.2026 17:00:42
- **Raporlayan:** 211118032

---

## Hipotezler (sıralı)

1. **Native R3F yolu:** `@react-three/fiber/native` + `expo-gl` + `expo-three` + GLTFLoader. SDK 54 + new arch beta'da `morphTargetInfluences` undefined geliyor mu? — TEST: deneme cycle'da.
2. **WebView yolu:** HTML + Three.js CDN + GLTFLoader. RN ↔ WebView postMessage ile amplitude geçişi. Daha az platform riski.
3. **Morph target isimleri:** avaturn export'unda `jawOpen`, `mouthFunnel`, `viseme_aa`, `eyeBlinkLeft/Right` muhtemelen var. Sabit lookup listesi yeterli mi?

→ Forge cycle 2 (ROLLBACK — native R3F) → Forge cycle 3 (COMMIT — WebView)
