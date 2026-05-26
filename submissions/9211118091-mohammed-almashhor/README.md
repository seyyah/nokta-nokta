Track Selected: Track C — Otonom Köprü (Orijinal)

# Nokta_ AI Assistant: Kampüs İçi İkinci El Pazar Yeri & Otonom Mimar

Sadece öğrencilerin `.edu.tr` e-postasıyla üye olabildiği, kampüs içi güvenli bir ikinci el eşya ve kitap pazar yeri mobil uygulaması vizyonunu alan ve bunu uçtan uca mühendislik standartlarında ("Golden Spec") kurgulayan yapay zeka asistanı.

## 🔗 Linkler
- **Demo Video (YouTube):** [Nokta_ AI Assistant - Halka Kapanışı Demo](https://youtu.be/a_TuSDbwx9E?si=ckH_eT9OuL0Ezy6z)

---

## 🎯 Week 15 — Halka Kapanışı (Track C — Otonom Köprü)

### Phase A: 3D Avatar + Voice Visualizer
* **Avatar Modülü (`NoktaMascot3D.tsx`)** — `react-three-fiber` kullanılarak oluşturulan kanvas üzerinde kullanıcının kendi yüzü (`avatar.glb` - Avaturn.me export) render edilir. `isSpeaking` statüsüne ve kullanıcının `volumeLevel` (RMS) değerlerine göre dudak senkronizasyonu yapar.
* **Ses Yakalama (`useVoiceRecording.ts`)** — `expo-av` kütüphanesi kullanılarak mikrofon ses şiddeti (metering) düzenli aralıklarla yakalanır ve doğrudan 3D avatarın ağız hareketlerine (lip-sync) yansıtılır. Gecikme süresi 200ms altındadır.

### Phase B: Voice-Dictated Forge Cycles
* Geliştirici-Kullanıcı simülasyonu kapsamında, uygulamanın mikrofon tuşuna basılı tutarak fikir ("Sadece öğrencilerin...") sisteme söylenir. 
* Fikir, "Slop-Check" metrik testinden geçerek yapay zeka (LLM) tarafından ayrıştırılır. Karşılıklı diyaloglar `FORGE.md` dosyasına §5 şablonuyla (READ → LOCATE → REPAIR → COMMIT/ROLLBACK) kaydedilir. Projede 3 adet döngü kanıtlanmıştır.

### Phase C: WebRTC Expert Bridge
* **Uzman Bağlantısı (Jitsi)** — Yapay zekanın tıkandığı veya mimari kararlarda insan teyidi aradığı durumlarda devreye girer.
* **NLP Tetikleyicisi** — Sohbet geçmişinde *"uzman"*, *"takıldım"*, *"yardım"* gibi ifadeler yakalandığı anda `expertCallActive` tetiklenir ve sistem otonom olarak Jitsi Meet WebView ekranını (görüntülü + sesli + ekran paylaşımı) tam ekran açar. Bu durum `BRIDGE.md` dosyasına kaydedilmiştir.
* **📞 FAB (Hızlı Çağrı)** — Beklenmedik durumlar için manuel tetikleme sağlayan yüzen buton.

---

## 🏗️ Human Loop Integration & Architecture

**Nokta Mascot State Management**
Avatar, sohbet kutusunun hemen üstünde yer alır ve kullanıcı etkileşimine göre anlık tepki verir:
- Dinliyor: Kullanıcı mikrofona basılı tuttuğunda avatarın ağzı mikrofon RMS değerine göre senkron hareket eder.
- Cevaplıyor: Yapay zeka metin üretirken (typing effect) avatar dudak okuma illüzyonu (randomized smoothing) yaratır.

**Mühendislik Sınırları (Engineering Probes)**
Girilen fikir doğrudan sonuca ulaşmaz, 3 aşamalı statik filtreden (HITL Gate) geçer:
1. **🔥 CORE PROBLEM**: Çözülen temel sorunun tespiti.
2. **⚙️ CORE MECHANIC**: Sistemin ana fonksiyonunun beyanı.
3. **✂️ SCOPE CUT**: İlk versiyonda nelerin KESİNLİKLE yapılmayacağının (kargo, ödeme vb.) sınırı.
Bu filtreleri aşan fikir "Golden Spec Artifact" dosyasına dönüşür.

---

## 📜 Karar Günlüğü (Decision Log)
| Decision | Rationale |
| :--- | :--- |
| **Track C Seçimi** | Yapay zekanın tıkandığı noktada otonom olarak uzmanı çağırması, gerçekçi "Fail-safe" mühendisliğinin temelidir. |
| **Fail-Safe STT Queue** | Google Cloud API kısıtlamaları ve Leaked Key blocklama ihtimaline karşı, demo videosunun sekteye uğramaması için deterministik/sıralı ses kuyruğu (Sequential Fake Script) tercih edildi. |
| **Jitsi WebRTC** | Api Key veya ek auth mekanizmasına ihtiyaç duymadan sıfır kurulumla P2P (Peer-to-Peer) görüntülü görüşme sağladığı için tercih edildi. |
| **react-three-fiber** | React state ile direkt entegre olduğu için ses RMS değerini doğrudan prop olarak 3D modele aktarmaya izin verir. |
| **Dark Theme (#0A0A0D)** | Uzun süreli metin/mimari rapor okumalarında göz yorgunluğunu azaltır ve premium "terminal" estetiği sağlar. |

---

## 🛠️ Kurulum (Getting Started)
```bash
# Projeyi kurun
npm install

# Expo yerel sunucusunu başlatın
npx expo start

# Terminalde 'a' tuşuna basarak Android Emulator üzerinde çalıştırın.
```

## 🧠 Kullanılan Araçlar (Tech Stack)
- **React Native (Expo)** — Temel mobil iskelet.
- **react-three-fiber / drei** — 3D Avatar render motoru.
- **expo-av** — Mikrofon erişimi ve RMS metering.
- **Jitsi Meet (WebRTC)** — HITL/STUCK görüntülü köprü bağlantısı.
