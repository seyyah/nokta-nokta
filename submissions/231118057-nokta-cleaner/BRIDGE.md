# BRIDGE — Expert Call Sessions

**Submission:** 231118057-nokta-cleaner
**Track:** A (Sadakat — Voice viz akıcılığı + lipsync senkronu)
**Phase:** C — manual button-triggered Jitsi Meet room

> Phase C requirement (brief): bir cycle ≥2 cycle üst üste FAIL/ROLLBACK çekerse
> uygulama içindeki "Uzmana Bağlan" butonu görüntülü çağrı açacak; demo videoda
> ≥60 sn ekran-paylaşımlı görüşme gösterilecek.
>
> Track A minimum-impl: stuck **manuel** tetiklenir (kullanıcı butona basar).
> Auto-stuck heuristic (Track C) bilinçli olarak yapılmadı.

## Stack

- **Bridge service:** Jitsi Meet (meet.jit.si) — free, anonymous, no API key,
  WebRTC üzerinde audio + video + screen-share native destekli.
- **Room naming:** `nokta-stuck-<base36-timestamp>-<6-char-random>` — common-name
  lobby/queue çakışmasını önlemek için yeterince uzun + unique.
- **Opener:** web → `window.open(url, '_blank')`, native → `Linking.openURL`.

## Sessions

> Her stuck call sonrası uygulamadaki **Uzmana Bağlan** modal'ında
> "Copy BRIDGE.md block" butonuna bas, çıktıyı buraya yapıştır.

_(no sessions yet — fill after first stuck cycle triggers an actual call)_

---

## Demo video kontrol listesi (Phase C)

- [ ] Uygulamadan EXPERT butonuna basışın görülmeli
- [ ] Modal açılıp room URL üretmeli
- [ ] "Open call" butonu yeni tab'da Jitsi'yi açmalı
- [ ] Karşı tarafta sınıf arkadaşın da katılmalı (uzman rolü)
- [ ] Ekran paylaşımı aktif (kodu / VS Code / browser göstermeli)
- [ ] Görüşme ≥60 sn sürmeli
- [ ] Görüşmeden sonra modal'daki post-call notes alanı doldurulup
      "Copy BRIDGE.md block" ile bu dosyaya yapıştırılmalı
