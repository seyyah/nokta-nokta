# PERSONAS — Nokta Cleaner (Track A)

**Öğrenci No:** 231118057
**Slug:** `nokta-cleaner`
**Track:** 1 — Voice viz akıcılığı + lipsync senkronu

---

## Track A seçildi — persona varyantları kapsam dışı

Multi-persona avatar varyantları (Junior-sen / Senior-sen) **Track 2** kapsamındadır. Bu submission Track A (sade ama kusursuz) tercih ettiği için iki ayrı `.glb` ve persona switch UX'i yapılmadı.

Karar gerekçesi: Phase A'nın 70 ms toplam reaction time + amplitude-driven lipsync görsel kalitesi puanlamayı dominate ediyor. Track 2 ek `.glb` + persona switch UX yükü getiriyor; kapsama oranı yüksek ama gösterim değeri Track A'in altında kaldı.

## Mevcut tek avatar

| Avatar | Rol | Dosya |
|---|---|---|
| **Spec-agent (default)** | Tüm voice / dictation / expert-bridge akışında tek konuşan figür. avaturn.me'den export edilmiş gerçek 3D model (morph target lipsync destekli). | [`app/avatar.glb`](./app/avatar.glb) |

`.glb` yüklenemediği geliştirme anlarında `AvatarScene.js` graceful proxy fallback (stylized head) render eder; dev iteration bloklanmaz.

## Junior-sen / Senior-sen (yapılmayan — referans)

Track 2 seçilse şu varyantlar olurdu:

- **Junior-sen:** Daha yumuşak sesli, açıklayıcı/öğretici ton; soru-sorma frekansı yüksek; karar konfidansı düşük.
- **Senior-sen:** Hızlı, kısa cevaplı; rollback önerirken doğrudan; konfidans yüksek; düşük karar maliyetli adımlarda sorgusuz devam eder.

Her iki varyant için ayrı `.glb` (farklı yaş/stil) ve persona-aware system prompt eklenmesi gerekirdi. Track A scope'unda bilinçli olarak yapılmadı.

## Karar log referansı

Detay için [`README.md` Decision Log](./README.md) satır 116'daki "Hafta 3 Track A seçildi" maddesine bakınız.
