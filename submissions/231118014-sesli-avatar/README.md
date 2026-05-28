Track: A — Sadakat (voice viz + lipsync polish)

# nokta-nokta · sesli-avatar

Final halka: kendi yüzünden avatar + sesin görselleşmesi + kendi audit raporlarınla tetiklenen forge döngüsü + sıkışınca uzmana köprü. Önceki halkalar (`nokta`, `nokta-audit`) bu projede birleşiyor.

## Üç Sekme

- **Ayna (Phase A):** `expo-audio` ile mikrofon seviyesi ~50ms aralıkla okunur, asimetrik smoothing (hızlı attack / yavaş release) ile 0..1 sinyale dönüşür. Bu sinyal hem 28 barlı dalga visualizer'ı hem de avatarın ağız açıklığını (`jawOpen`) sürer. Sessizlikte söner, konuşunca canlanır. `avatar.glb` (Avaturn T2, viseme + jawOpen morph target içeren kendi yüzüm) repoda mevcuttur; web önizlemede 3D render edilir, Expo Go runtime'ında ise aynı 0..1 sinyali SVG lipsync ayna üzerinden tüketilir.
- **Forge (Phase B):** `<AuditWidget />` dikte (mic → STT → markdown) + manuel modlu; raporlar kalıcı saklanır. Cycle ledger COMMIT / ROLLBACK / STUCK durumlarını, 20dk kutuyu ve canlı kabul-kriteri sayaçlarını (≥2 COMMIT, ≥1 ROLLBACK) tutar.
- **Köprü (Phase C):** "Uzmana Bağlan" butonu Jitsi (meet.jit.si) görüntülü görüşmeyi açar; video + ses + ekran paylaşımı tarayıcı/native tarafında çalışır. Buton, ardışık FAIL/ROLLBACK durumuna göre vurgulanır.

## QR Linki

Aynı ağda Expo Go uygulamasıyla okutun:
`exp://192.168.1.105:8081`

## Çalıştırma

```bash
cd app
npm install
npx expo start
```

Expo Go ile QR okutularak telefonda açılır.

## Audit + Forge

3 burn-in'li audit raporu uygulama içindeki AuditWidget ile üretildi; forge döngüsü 2 COMMIT + 1 ROLLBACK olarak koşturuldu. Detay: [`FORGE.md`](./FORGE.md).

## Track Seçimi

Track A seçildi: voice visualizer akıcılığı ve lipsync senkronu önceliklendirildi. "Sade ama kusursuz" çizgisi; tek avatar, tek odak. Karar gerekçesi: [`DECISIONS.md`](./DECISIONS.md).

## AI Tool Log

| Aşama                          | Tool                         |
| ------------------------------ | ---------------------------- |
| Uygulama iskeleti + 3 sekme    | Rork                         |
| Avatar (Avaturn T2 export)     | Avaturn (kullanıcı aksiyonu) |
| Forge cycle kod değişiklikleri | Rork agent                   |
| Doküman + cycle ledger yapısı  | Claude (sohbet)              |

## Avatar Notu

`app/assets/avatar.glb` Avaturn T2 tipiyle kendi yüzümden üretildi (ARKit blendshape + viseme + `jawOpen` içerir, ~15 MB). T1 tipi daha yüksek benzerlik sunsa da yüz animasyonu (blendshape) içermediği için lipsync'e uygun T2 tipi tercih edildi.

## Decision Log

| #   | Karar                                              | Gerekçe                                                                                          |
| --- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1   | Track A seçildi                                    | Tek avatar, tek odak; "sade ama kusursuz" çizgisi lipsync kalitesini maksimize eder              |
| 2   | Avaturn T2 tipi kullanıldı                         | T1 blendshape içermiyor; lipsync için ARKit morph target zorunlu                                 |
| 3   | `expo-audio` ile ~50ms polling                     | `expo-av` mic capture yerine daha düşük latency ve stabil RMS okuma sağlıyor                     |
| 4   | Asimetrik smoothing (hızlı attack / yavaş release) | Ani ses patlamalarında doğal görünüm; release'i uzatmak avatar ağzının "asılı kalmasını" önlüyor |
| 5   | Expo Go runtime'ında SVG lipsync aynası            | WebGL/r3f Expo Go'da güvenilir çalışmıyor; SVG fallback latency hedefini (<200ms) karşılıyor     |
| 6   | Jitsi (meet.jit.si) WebRTC köprüsü                 | API key gerektirmiyor, video + ses + ekran paylaşımı kutudan çıkıyor                             |
| 7   | Forge cycle başına 20dk kutu                       | Spec zorunluluğu; aşım ROLLBACK tetikliyor, disiplin sağlıyor                                    |
| 8   | Dikte modu varsayılan audit girişi                 | Spec bonus puanı + voice-first UX tutarlılığı                                                    |
