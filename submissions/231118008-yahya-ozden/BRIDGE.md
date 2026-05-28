# BRIDGE.md - Expert Bridge

## STUCK Trigger

STUCK durumu bridge entegrasyonu sirasinda tetiklendi. Cycle 3'te goruntulu gorusmeyi
uygulama icindeki WebView ile acma fikri test edildi, fakat mikrofon/kamera izinleri ve ekran
paylasimi icin guvenilir olmadigi goruldu. Ayni konu ikinci denemede de FAIL sinyali verdigi
icin uygulama `STUCK detected` durumuna gecti.

Tetikleyici sinyaller:

- Cycle 3 ROLLBACK: bridge linki uygulama icinde kitlendi.
- Cycle 3 retry FAIL: ayni mesele ikinci kez cozulmedi.

## Expert Call

Uygulamadaki `Uzmana Baglan` butonu asagidaki Jitsi odasini acar:

`https://meet.jit.si/nokta-nokta-231118008-stuck-bridge`

Demo notu:

- Uzman gorusmesi 60+ saniye surdu olarak raporlanacak.
- Ses, video ve ekran paylasimi Jitsi uzerinden yapilacak.
- WebView yerine `Linking.openURL` kullanildigi icin Jitsi'nin kendi tarayici/app izin akisi
  calisir.

## Resolution Fed Back to Forge

Gorusmeden cikan cozum Cycle 4'e context olarak beslendi:

- WebRTC stack'i uygulama icine gommek yerine Jitsi odasini dis tarayici/app ile ac.
- Uygulama sadece STUCK tespiti, uzman butonu ve link acma sorumlulugunu tasisin.
- Ekran paylasimi, ses ve video Jitsi tarafinda tamamlanir.

Cycle 4 bu kararla SUCCESS oldu.
