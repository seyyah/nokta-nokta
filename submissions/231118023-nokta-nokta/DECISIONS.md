# DECISIONS.md - Karar Günlüğü

Bu doküman, Nokta-Nokta final ödevinde uygulanan mimari ve teknik kararları içerir.

---

## 1. Mimaride Düşük Gecikmeli Dudak Senkronu (<200ms)
- **Karar:** 3D modelin dudak senkronunu (lipsync) React state'i üzerinden değil, doğrudan `@react-three/fiber`'ın `useFrame` kancasından Three.js nesnelerine (`morphTargetInfluences`) doğrudan yazarak (Direct GPU Update) gerçekleştirdik.
- **Gerekçe:** React state güncellemeleri saniyede 20-30 kez tetiklendiğinde tüm Canvas bileşen ağacının yeniden çizilmesine (re-render) neden oluyor, bu da mobilde kasılmalara ve >300ms gecikmelere sebep oluyordu. Referansı (`audioLevelRef`) direkt GPU döngüsünde okumak sıfır gecikme sağladı.

## 2. Paralel Ses Analizi ve Ses Tanıma (Double Thread Audio)
- **Karar:** Kullanıcı mikrofona bastığında hem `expo-av` üzerinden ses kaydı (metering/RMS) başlattık hem de `expo-speech-recognition` motorunu çalıştırdık.
- **Gerekçe:** Ses tanıma kütüphanesi anlık RMS (desibel) değerlerini vermemektedir. Avatarın ve dalga visualizer'ın ses seviyesine duyarlı zıplayabilmesi için `expo-av` metering'ine ihtiyaç duyulmuştur. İkisini paralel koşturarak konuşma esnasında hem STT metnini aldık hem de lipsync/viz barlarını zıplattık.

## 3. WebRTC Köprüsü için Jitsi WebView Tercihi
- **Karar:** Uzmana görüntülü çağrı açan "Uzmana Bağlan" köprüsünü sıfırdan WebRTC yazmak yerine, ücretsiz, API anahtarı istemeyen ve güvenilir Jitsi Meet web arayüzünü `<WebView>` içinde çalıştırarak kurduk.
- **Gerekçe:** Expo native kütüphanelerinde WebRTC modülleri EAS build'lerde ve Android native tarafta sürüm uyuşmazlığına yol açmaktadır. WebView, camera, microphone ve inline media oynatımına izin vererek görüntülü çağrının uygulama dışına çıkmadan kararlı çalışmasını sağlamıştır.

## 4. Persona Bazlı TTS ve Lipsync Entegrasyonu
- **Karar:** `expo-speech` kullanarak text-to-speech tetiklerken, `pitch` ve `rate` katsayılarını seçilen personaya (Junior vs Senior) göre dinamik ayarladık. TTS esnasında mikrofondan ses gelmeyeceği için, konuşma anında random volume üreten bir interval ile dudak morph'larını canlandırdık.
- **Gerekçe:** Cihaz TTS motoru konuşurken ses dalgasını uygulamaya sunmaz. Karakterlerin kendi ürettikleri yorumları okurken dudaklarının oynaması için bu asenkron simülasyon tekniği uygulanmıştır.

## 5. nokta-audit Bileşeninin Lokal Kopyalanması
- **Karar:** `@xtatistix/mobile-audit` kütüphanesini npm üzerinden çekmek yerine, repodaki `nokta-audit-main` kodlarını doğrudan projemizin `src/nokta-audit/` dizinine taşıdık.
- **Gerekçe:** EAS build'lerde lokal monorepo bağımlılıkları relative path uyuşmazlığı nedeniyle CI hataları vermektedir. Kodu lokalize etmek tüm bağımlılıkların (view-shot, docx vs) uygulama içinde derlenmesini garanti etmiştir.
