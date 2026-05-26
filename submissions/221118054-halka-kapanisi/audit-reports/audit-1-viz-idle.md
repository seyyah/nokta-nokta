# Bug Raporu — Halka Kapanışı

**Tarih:** 2026-05-23 14:05
**Toplam:** 1 not · 🔴 1 açık
**Raporlayan:** qa-221118054

---

## Ekran: MirrorScreen

### 🔴 #1 — Voice visualizer idle'da dümdüz duruyor

> Burn-in seçim: ekranın orta-alt kısmında 24 çubuk dümdüz, ölü gibi duruyor.
> Sarı kutu çubuk satırını işaretliyor.

- **Durum:** Açık
- **Bileşen ipucu:** `app/src/voice/VoiceVisualizer.tsx`
- **Zaman:** 2026-05-23T14:05

**Not (insan dili):**
Mikrofon kapalıyken voice visualizer 24 çubuk olarak duruyor ama hepsi
aynı yükseklikte. Yaşıyormuş hissi vermiyor — OpenAI voice-mode tarzı
hafif bir "nefes" pulse'ı olmalı.

**Beklenen:** Idle state'te de uçtan uca sinüsoidal hafif (4-6px) bir
yükselme-alçalma; aktif olunca level ile dolu animasyon.
