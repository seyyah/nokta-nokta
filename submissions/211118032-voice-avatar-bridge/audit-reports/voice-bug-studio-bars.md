# Bug Raporu — Nokta Voice Avatar Bridge

**Tarih:** 28.05.2026 16:25
**Toplam:** 1 not · 🔴 1 açık
**Üretim:** Sesli dikte → STT → markdown (manuel review)

---

## Ekran: Studio

### 🔴 #1 — Voice viz barları sessizken sallanmıyor, mic açıkken latency hissi var

![Screenshot](./screenshots/studio-bars-2026-05-28.png)

**Konuştuğum (transcript):**

> "Tamam, Stüdyo sekmesine girdim. Mikrofonu açtım. Konuşmaya başladığımda barlar çok yavaş tepki veriyor, bir saniye gibi gecikme var sanki. Ayrıca sessizlikte barlar tamamen kayboluyor, OpenAI voice-mode'da olduğu gibi soluk bir nefes alma animasyonu istiyorum. Bir de mikrofonu kapattığımda son durum donup kalıyor, sıfıra dönmüyor hemen."

**Etki:** Phase A ACCEPTANCE: "Mic input voice viz'i tetikliyor (silent state idle)" → idle state şu an yok. Latency hedefi <200ms; subjective olarak ~500ms gibi hissediyor.

- **Durum:** Açık
- **Zaman:** 28.05.2026 16:25:14
- **Raporlayan:** 211118032

---

## Aksiyon önerisi

1. `voiceMeter` update interval 60ms'e indir (default 200ms ise)
2. Exponential smoothing katsayısı 0.55/0.45 → low-pass time constant ~80ms
3. `VoiceVisualizer` idle state'inde `requestAnimationFrame` ile breathing pulse (5% amplitude)
4. `stop()` çağrıldığında tüm subscriber'lara 0 push'la — bars hızla sönsün

→ Forge cycle: `voice-meter-bootstrap` (FORGE.md Cycle 1)
