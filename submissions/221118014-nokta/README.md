# Nokta-Nokta Final Hafta Ödev Teslimi

Bu klasör, final haftası ödev teslimi kapsamında hazırlanan mobil uygulama dosyalarını, otonom döngü loglarını ve WebRTC köprü raporlarını barındırır.

## 🎥 Ödev Demo Videosu (YouTube Shorts)

Uygulamanın ses görselleştirme, 3D avatar baş sallama hareketi, otonom hata tamir (Forge) döngüsü ve sesli asistan destekli WebRTC uzman köprüsü akışını izlemek için:

👉 **[Ödev Demo Videosunu İzle (YouTube)](https://youtube.com/shorts/OJD59LRfRFc)**

## 📦 EAS Standalone Build (Bulut Derleme)

Uygulamanın derleme adımlarını takip etmek ve APK dosyasını doğrudan indirmek için:

👉 **[EAS Build Ayrıntılarını Görüntüle (Expo)](https://expo.dev/accounts/yurthann/projects/app/builds/72416a9d-8cd1-49dd-be07-2b82677ae5c9)**

---

## 🛠️ Tamamlanan Katmanlar ve Özellikler

1. **Ses Dalga Görselleştirici (FFT/RMS):**
   - OpenAI Voice Mode arayüzünden esinlenilmiş, mikrofondan gelen gerçek desibel (dB) seviyesine göre zıplayan 15 neon yeşili bar animasyonu.
   
2. **3D Avatar & Ses/Jest Senkronizasyonu (react-three-fiber):**
   - Yüklenen `avatar.glb` modeli için otomatik yüz kadrajı ve `OrbitControls` dokunmatik kamera döndürme/yakınlaştırma kontrolü.
   - **Skeletal Fallback & Head Bobbing:** Modelde blendshape mimikleri olmasa bile çene kemiğinin (`Jaw`) ses seviyesine göre dönmesi ve konuşma ritmine uygun kafa sallama/beden salınım jestleri.

3. **Otonom Forge Döngüsü:**
   - `<AuditWidget />` aracılığıyla girilen 3 markdown audit raporu sonrası otonom tamir döngüsünün başlaması.
   - Üst üste 2. FAIL sonrası sistemin kilitlenerek (`STUCK`) otomatik olarak görüntülü uzman aramasını tetiklemesi.

4. **Akıllı WebRTC Uzman Köprüsü (Jitsi):**
   - Sistem kilitlendiğinde gerçek zamanlı video/ses paylaşımı sunan `meet.jit.si` odasının uygulama içinde açılması.
   - Görüşme başladığında, asistanın köşedeki PIP (Resim içinde resim) penceresinden uzmanı **Türkçe sesli (TTS) olarak brifing etmesi** ve canlı altyazı akışı.
   - **Gemini Yapay Zeka Uzmanı Modu:** WebRTC'nin yanı sıra, asistanla doğrudan yazılı/sesli soru-cevap yapabilmeyi sağlayan gerçek Gemini API entegrasyonu.

---

## 📂 Teslimat Dosyaları
* [FORGE.md](file:///C:/Users/yurth/nokta-nokta/submissions/221118014-nokta/FORGE.md) - Forge otonom tamir döngüsü hata logları.
* [BRIDGE.md](file:///C:/Users/yurth/nokta-nokta/submissions/221118014-nokta/BRIDGE.md) - Görüntülü uzman köprüsü görüşme transkripti.
* [app/](file:///C:/Users/yurth/nokta-nokta/submissions/221118014-nokta/app) - React Native Expo kaynak kodları.
