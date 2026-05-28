# DECISIONS.md — Karar Günlüğü

- **Student:** 231118033
- **Project:** Nokta Nokta Voice Forge
- **Track:** A

---

## Decision 01 — Web Audio API vs expo-av

**Tarih:** 2026-05-25
**Karar:** Mikrofon yakalama için `navigator.mediaDevices.getUserMedia` + Web Audio API kullanıldı.
**Neden:** Expo web ortamında `expo-av` Recording API'si FFT/frequency bin erişimi sağlamıyor. Web Audio API `AnalyserNode` ile doğrudan `getByteFrequencyData()` çağrılabiliyor, bu da 24-bar visualizer için gereken bin-level veriyi veriyor. expo-av metering sadece tek bir dB değeri döndürüyor (fftSize kontrolü yok).
**Risk:** Native Android/iOS'ta `navigator.mediaDevices` olmayabilir. Web build'de sorunsuz çalışıyor.
**Alternatif:** expo-av ile sadece RMS seviyesi alınıp barlara dağıtılabilirdi ama frequency-domain animasyon kaybedilirdi.

---

## Decision 02 — RMS-based Avatar Motion vs Viseme Pipeline

**Tarih:** 2026-05-25
**Karar:** Viseme pipeline yerine RMS-based kafa/gövde hareketi kullanıldı.
**Neden:** Avaturn'den export edilen GLB dosyası güvenilir mouth/jaw/viseme morph target'ları içermiyor. `morphTargetDictionary` traverse edildi, `jawOpen`, `mouthOpen`, `viseme_aa`, `viseme_O` gibi isimler arandı — bulunamadı. GLB sadece skeletal bone'lar (head, neck) içeriyor.
**Denenen:** Cycle 03'te agresif kamera zoom + sahte siyah ağız overlay denendi. Doğal durmadı, ROLLBACK yapıldı.
**Sonuç:** RMS seviyesine bağlı scale, position.y ve head bone rotation ile doğal bir "konuşma hareketi" sağlandı. Tam lipsync future cycle'a bırakıldı.

---

## Decision 03 — Jitsi Meet vs Daily.co vs LiveKit

**Tarih:** 2026-05-26
**Karar:** Expert bridge için Jitsi Meet seçildi.
**Neden:** API key gerektirmiyor, ücretsiz, tarayıcıda hemen açılıyor. Daily.co ve LiveKit API key + backend setup gerektiriyor. Proje scope'u için Jitsi yeterli.
**Uygulama:** `Linking.openURL()` ile Jitsi room açılıyor. In-app WebView embed daha iyi olurdu ama Jitsi iframe API'si mobile WebView'da stabil değil.

---

## Decision 04 — Persona Switch Tasarımı

**Tarih:** 2026-05-26
**Karar:** Junior-Sen ve Senior-Sen olmak üzere iki persona modu eklendi.
**Neden:** Track A seçildi ama persona switch ile audit/forge review sürecine tonal çeşitlilik katmak istendi. Junior-Sen basit ve destekleyici, Senior-Sen kritik ve teknik.
**Uygulama:** State-based text swap. Avatar görselinde fark yok çünkü tek GLB dosyası var. İleride farklı lighting/camera açısı ile görsel ayrım eklenebilir.

---

## Decision 05 — STT/Dikte Yöntemi

**Tarih:** 2026-05-26
**Karar:** Web Speech API (`webkitSpeechRecognition`) kullanıldı.
**Neden:** Browser'da çalışan, kurulum gerektirmeyen, ücretsiz bir STT çözümü. Chrome/Edge'de destekleniyor.
**Risk:** Native Expo runtime'da çalışmıyor. Sadece web build'de aktif. Manuel metin girişi her durumda mümkün.
**Alternatif:** Whisper API veya expo-speech-recognition kullanılabilirdi ama API key / ek dependency gerektiriyordu.

---

## Decision 06 — Forge Cycle Sayısı ve Yapısı

**Tarih:** 2026-05-26
**Karar:** 4 cycle planlandı: 2 COMMIT + 1 ROLLBACK + 1 STUCK.
**Neden:** Spec minimum ≥2 COMMIT + ≥1 ROLLBACK istiyor. STUCK cycle'ı Phase C (expert bridge) için gerekli. 4 cycle ile tüm durumlar kapsanıyor.

---

## Decision 07 — STUCK Heuristic Tasarımı

**Tarih:** 2026-05-26
**Karar:** `bridgeRequired = failCount >= 2 || cycleStatus === "STUCK"` kuralı uygulandı.
**Neden:** Spec "2 cycle üst üste FAIL veya ROLLBACK çekerse" diyor. failCount her FAIL/ROLLBACK'te artıyor, OK'de sıfırlanıyor. STUCK doğrudan bridge'i tetikliyor. Bu basit ama etkili bir heuristic.

---

## Decision 08 — Sahte Ağız Overlay Reddi

**Tarih:** 2026-05-25
**Karar:** Cycle 03'te denenen siyah ağız overlay'i geri alındı (ROLLBACK).
**Neden:** CSS/Canvas ile ağız bölgesine siyah elips çizildi ve RMS'e göre scale edildi. Sonuç doğal durmadı, uncanny valley etkisi yarattı. Demo kalitesini düşürdü.
**Sonuç:** Temiz avatar görünümü korundu, RMS-based motion yeterli bulundu.
---

## Decision 09 — Native APK Fallback Screen

**Tarih:** 2026-05-28  
**Karar:** Android APK build için `App.native.tsx` dosyası eklendi.  
**Neden:** Web demo tarafında kullanılan `window`, `navigator.mediaDevices`, `AudioContext`, `SpeechRecognition` ve `speechSynthesis` gibi API’ler native Android ortamında güvenilir değildir. Bu nedenle native build için sade ve güvenli bir fallback ekranı kullanıldı.  
**Uygulama:** Web demo `App.tsx` üzerinden çalışmaya devam ederken, Android/iOS native build sırasında React Native resolver `App.native.tsx` dosyasını kullanır.  
**Risk:** APK içindeki ekran tam interaktif web demosunu içermez.  
**Azaltma:** Tam etkileşimli demo 3 dakikalık video içinde web üzerinden gösterilir. APK ise kurulabilir teslim paketi olarak sunulur.

---

## Decision 10 — Demo Fallback for Voice/STT Reliability

**Tarih:** 2026-05-28  
**Karar:** Gerçek mikrofon veya STT tarayıcı/cihaz kaynaklı çalışmadığında demo akışını korumak için manuel demo fallback butonları eklendi.  
**Neden:** Tarayıcı mikrofon girişi, Windows izinleri, Chrome mikrofon cihazı seçimi ve Web Speech API desteği cihazdan cihaza değişebilir. Bu durum demo sırasında akışın bozulmasına neden olabilir.  
**Uygulama:** `Demo Ses Görselleştiriciyi Başlat`, `Visualizer Manuel Test` ve `Demo STT Metni Ekle` gibi fallback kontrolleri eklendi.  
**Risk:** Bu fallback’ler gerçek mikrofon/STT yerine simüle edilmiş demo davranışı gösterebilir.  
**Azaltma:** Gerçek mikrofon denemesi korunur; fallback sadece demo güvenliği için kullanılır. README/FORGE/BRIDGE içinde sınırlamalar açıkça belgelenir.