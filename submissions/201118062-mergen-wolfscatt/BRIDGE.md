# BRIDGE.md

## Bridge Kurulumu

* **Sağlayıcı:** Jitsi
* **Toplantı URL'si:** https://meet.jit.si/nokta-nokta-201118062-mergen-wolfscatt
* **Tetikleyici:** Uygulama içindeki manuel **"Uzmana Bağlan"** butonu
* **Beklenen yetenekler:** video görüşme, sesli görüşme, ekran paylaşımı
* **Demo kayıt yöntemi:** Android ekran kaydı, avatar ekranında mikrofon ve 3D render yükü nedeniyle otomatik kapandığı için demo videosu başka bir telefonla dışarıdan kaydedildi.

## Bridge Görüşmesi - Manuel Demo Doğrulaması

**TRIGGER:** manuel
**STUCK_CYCLE:** Avatar + ses görselleştirme demosu sırasında ekran kaydı / performans sorunu
**EXPERT:** ikinci cihaz / manuel gözlemci
**DURATION_SEC:** 60+

## Görüşme Özeti

* Uygulama, fiziksel Android cihaz üzerinde APK olarak açıldı.
* **Ayna: Ses + Avatar** ekranında Avatar SDK tabanlı `avatar.glb` modeli test edildi.
* Telefonda yerleşik ekran kaydı, avatar ve mikrofon demosu sırasında otomatik kapandığı için son demo başka bir telefonla dışarıdan kaydedildi.
* Uygulamadaki **"Uzmana Bağlan"** butonu üzerinden Jitsi toplantı bağlantısına geçiş akışı manuel olarak doğrulandı.
* Jitsi bağlantısının video, ses ve ekran paylaşımı desteği sunduğu kontrol edildi.
* Bu bridge akışının amacı, kullanıcı veya agent geliştirme sürecinde takıldığında bir uzmana hızlıca bağlanabilmesini sağlamaktır.
* Demo sürecinde bridge bağlantısının uygulama içinden erişilebilir olduğu ve insan destekli çözüm yolu olarak kullanılabileceği gösterildi.

## Sonraki Cycle İçin Girdi

* **Uzmana Bağlan** butonuna basılmadan önce kısa bir onay ekranı eklenebilir.
* Bridge açıldığında otomatik olarak küçük bir audit notu üretilebilir.
* Bridge çağrısı için tarih, tetiklenme nedeni ve ilişkili stuck cycle bilgileri ayrı bir bridge log dosyasına yazılabilir.
* İleride Jitsi bağlantısı yerine uygulama içine gömülü WebView, LiveKit veya Daily tabanlı daha entegre bir görüşme sistemi eklenebilir.
