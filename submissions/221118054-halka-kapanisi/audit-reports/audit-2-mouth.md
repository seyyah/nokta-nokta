# Bug Raporu — Halka Kapanışı

**Tarih:** 2026-05-23 14:40
**Toplam:** 1 not · 🔴 1 açık
**Raporlayan:** qa-221118054

---

## Ekran: MirrorScreen

### 🔴 #1 — Avatar dudak hareketi zayıf, sönük kalıyor

> Burn-in seçim: avatarın ağız bölgesi sarı kutuyla işaretli.

- **Durum:** Açık
- **Bileşen ipucu:** `app/src/avatar/AvatarScene.tsx` → `targetMouthOpen`
- **Zaman:** 2026-05-23T14:40

**Not (insan dili):**
Yüksek sesle konuşunca bile avatarın dudakları az açılıyor. Daha
"konuşkan" bir his vermesi için multiplier artırılabilir mi?

**Beklenen:** Konuşma volüm zirvesinde dudak belirgin açılsın; sessizlikte
kapalı kalsın. Doğal ölçüde, abartısız.
