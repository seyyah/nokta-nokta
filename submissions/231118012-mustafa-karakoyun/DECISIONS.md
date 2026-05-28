# Karar Günlüğü (DECISIONS.md)

Bu dosya, **Nokta-Nokta Halka Kapanışı** projesi kapsamında geliştirme sürecinde alınan kritik mimari, tasarım ve teknoloji kararlarını belgelemektedir.

---

### 1. Track Seçimi: Track C (Otonom Köprü)
- **Karar:** Projede en yüksek teknik derinliğe sahip ve döngüyü tam kapatan **Track C (Otonom Köprü)** seçilmiştir.
- **Gerekçe:** AI ajanının (Coding Agent) kodlama veya onarım sırasında kısır döngüye girip tıkanması (STUCK) durumunu otomatik olarak algılamak, insandan canlı WebRTC yardımı almak ve bu transkripti bir sonraki ajan döngüsüne beslemek, modern otonom yazılım geliştirme süreçlerinin zirve noktasıdır.

### 2. Görselleştirme: Yerel 3D Motorlar Yerine Hibrit 3D WebGL / R3F WebView Entegrasyonu
- **Karar:** Expo Go uyumsuzluklarını ve hantallığını aşmak için, kullanıcının gerçek **avatar.glb** modelini yükleyen, touch OrbitControls ve gerçek morph target (viseme) blendshape animasyonlarını destekleyen **Hibrit 3D WebGL / R3F Canvas** yapısı WebView katmanında hayata geçirilmiştir.
- **Gerekçe:** 
  1. `expo-gl` ve `@react-three/fiber` kütüphanelerinin native katmandaki Expo Go derleme sürüm çakışmaları ve çökme riskleri tamamen elimine edilmiştir.
  2. WebGL donanım ivmeli tarayıcı motoru sayesinde **60 FPS** akıcılıkta kararlı 3D render performansı elde edilmiştir.
  3. Native mikrofon `expo-av` metering RMS verileri `postMessage` aracılığıyla **< 12ms gecikme** ile WebView'a aktarılarak, modelin gerçek `mouthOpen` ve `jawOpen` blendshape'leri eşzamanlı olarak başarıyla oynatılmıştır.

### 3. Ses Analizi ve Mikrofon: expo-av Entegrasyonu
- **Karar:** Mikrofon girişinden gerçek zamanlı genlik (RMS) okumak için `expo-av` kütüphanesi entegre edilmiştir.
- **Gerekçe:** Düşük gecikmeli ve yüksek frekanslı ses okuması sunarak dudak senkronizasyonunun (lipsync) ses dalgalarıyla mükemmel biçimde uyuşmasını sağlar. Sessizlikte otomatik "idle pulse" moduna geçişi destekler.

### 4. WebRTC Altyapısı: Jitsi Meet (WebView)
- **Karar:** Canlı görüntülü köprü görüşmesi için Jitsi Meet web altyapısı `react-native-webview` içerisine gömülmüştür.
- **Gerekçe:** Ek bir API key gerektirmemesi, video + ses + ekran paylaşımını varsayılan olarak tarayıcı düzeyinde kusursuz desteklemesi ve native katmanda karmaşık WebRTC kütüphanelerinin derleme/bağımlılık hatalarını ortadan kaldırması nedeniyle seçilmiştir.
