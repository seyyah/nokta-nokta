# Karar Günlüğü (Decisions)

Bu dosya proje geliştirilirken alınan teknik ve tasarımsal kararları içerir.

## Alınan Teknik Kararlar

### 1. 3D WebGL ve Native Render Seçimi
* **Karar:** `react-three-fiber` ve `@react-three/drei` kullanılarak `avatar.glb` modelinin ekrana çizilmesi kararlaştırıldı.
* **Detay:** Expo SDK 56 altyapısında native WebGL render desteği için eksik olan `expo-gl` ve 3D asset yüklemesi için `expo-asset` kütüphaneleri projeye kuruldu.

### 2. WebRTC Video Bridge Stratejisi (Phase C)
* **Karar:** Uzman çağrısı modülünde **Jitsi Meet** altyapısı tercih edildi ve `expo-web-browser` ile entegre edildi.
* **Gerekçe:** Native WebRTC kütüphanelerini derleme (build) sırasında yaşanabilecek native uyumsuzlukları önlemek ve Android/iOS işletim sistemlerinde sorunsuz video+ses+ekran paylaşımı (screen share) sunmak amacıyla sistem tarayıcısı üzerinden güvenli bir Jitsi oda bağlantısı kuruldu.

### 3. Avatar Dudak Senkronizasyonu (Lipsync) Modları
* **Karar:** Avatar'ın ağız hareketlerinin (`morphTargetInfluences`) çift modlu olarak tetiklenmesi sağlandı:
  1. **Kullanıcı Konuşurken:** Mikrofon girişindeki gerçek zamanlı RMS/metering ses seviyesine göre ağız hareket eder.
  2. **Yapay Zeka Cevap Verirken:** TTS (Text-to-Speech) ses çıktısı esnasında simüle edilmiş (dalgalanan) ses seviyelerine göre ağız hareket eder.

### 4. Ses Görselleştirici (Voice Viz) Tasarımı
* **Karar:** Basit bir büyüyen daire yerine, 7 dikey sütundan oluşan dinamik bir **Ses Ekolayzır Görselleştiricisi (Voice Viz)** tasarlandı. 
* **Detay:** Sütunların yükseklikleri ses şiddetine göre rastgele çarpanlarla animasyonlu (`Animated.timing`) olarak ölçeklenir. Sessizlik anında otomatik olarak sıfıra (idle) çekilir.

