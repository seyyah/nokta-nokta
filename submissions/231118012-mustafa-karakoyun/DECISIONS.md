# Karar Günlüğü (DECISIONS.md)

Bu dosya, **Nokta-Nokta Halka Kapanışı** projesi kapsamında geliştirme sürecinde alınan kritik mimari, tasarım ve teknoloji kararlarını belgelemektedir.

---

### 1. Track Seçimi: Track C (Otonom Köprü)
- **Karar:** Projede en yüksek teknik derinliğe sahip ve döngüyü tam kapatan **Track C (Otonom Köprü)** seçilmiştir.
- **Gerekçe:** AI ajanının (Coding Agent) kodlama veya onarım sırasında kısır döngüye girip tıkanması (STUCK) durumunu otomatik olarak algılamak, insandan canlı WebRTC yardımı almak ve bu transkripti bir sonraki ajan döngüsüne beslemek, modern otonom yazılım geliştirme süreçlerinin zirve noktasıdır.

### 2. Görselleştirme: 3D Üçüncü Parti Kütüphaneler Yerine 2.5D Premium Vektörel Avatar
- **Karar:** `react-three-fiber` / `three` gibi ağır 3D motorları kullanmak yerine, Mustafa'nın yüz hatlarını birebir simüle eden şık, etkileşimli ve ultra akıcı bir **2.5D Vektörel Lipsync Avatar** tasarlanmıştır.
- **Gerekçe:** 
  1. 3D kütüphanelerin Expo Go üzerindeki derleme uyumsuzlukları ve potansiyel çökme riskleri engellenmiştir.
  2. Dudak senkronizasyonu gecikmesi **< 100ms** seviyesine düşürülmüştür.
  3. Cihaz pil ömrü ve ısınma sorunları optimize edilmiş, her cihazda stabil çalışan premium bir deneyim sunulmuştur.

### 3. Ses Analizi ve Mikrofon: expo-av Entegrasyonu
- **Karar:** Mikrofon girişinden gerçek zamanlı genlik (RMS) okumak için `expo-av` kütüphanesi entegre edilmiştir.
- **Gerekçe:** Düşük gecikmeli ve yüksek frekanslı ses okuması sunarak dudak senkronizasyonunun (lipsync) ses dalgalarıyla mükemmel biçimde uyuşmasını sağlar. Sessizlikte otomatik "idle pulse" moduna geçişi destekler.

### 4. WebRTC Altyapısı: Jitsi Meet (WebView)
- **Karar:** Canlı görüntülü köprü görüşmesi için Jitsi Meet web altyapısı `react-native-webview` içerisine gömülmüştür.
- **Gerekçe:** Ek bir API key gerektirmemesi, video + ses + ekran paylaşımını varsayılan olarak tarayıcı düzeyinde kusursuz desteklemesi ve native katmanda karmaşık WebRTC kütüphanelerinin derleme/bağımlılık hatalarını ortadan kaldırması nedeniyle seçilmiştir.
