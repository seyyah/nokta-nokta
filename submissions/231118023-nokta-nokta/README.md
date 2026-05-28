Track: B

# 231118023 - StoryForge: Nokta-Nokta Final Phase

Bu proje, Nokta-Nokta (Week 3) ödevi kapsamında geliştirilen, yazar asistanı uygulaması **StoryForge**'u içermektedir.

Uygulamada, yaratıcı yazarlara fikir geliştirme sürecinde yardımcı olan bir 3D Asistan (Avatar), ses görselleştirme, sesli dikte ile hata raporlama ve WebRTC üzerinden canlı uzman desteği entegre edilmiştir.

---

## 🚀 Proje Bileşenleri & Özellikler

### Phase A — Ayna (Voice & Avatar)
- **Mikrofon Girişi & Analiz:** `expo-av` kullanılarak mikrofon desibeli (metering/RMS) milisaniyeler bazında yakalanır.
- **OpenAI Voice-Mode Estetiği:** Sessizlikte sönen, konuşma başladığında ses genliğine göre zıplayan, yumuşak geçişli 5'li parlayan görsel dalga barları.
- **3D Avatar Lipsync:** Avaturn.me/ReadyPlayerMe uyumlu 3D model, `@react-three/fiber` sahnesinde render edilir. Mikrofon ses seviyesi, sıfır gecikmeyle (<100ms) doğrudan GPU üzerinden modelin ağız açıklığı morph target'larına (`viseme_AA`, `viseme_O`, `viseme_U` vb.) bind edilmiştir.
- **Track B (Çoklu Persona):**
  - **Junior Buse:** Heyecanlı, informal konuşur, hızlı kafa salınımları yapar. Arayüzü canlı turuncu renktedir.
  - **Senior Buse:** Analitik, sakin, formal konuşur, ağır ve kontrollü hareket eder. Arayüzü koyu mor tondadır.
  - Her persona kendi tonuna uygun `pitch` ve `rate` katsayılarıyla Türkçe `expo-speech` kullanarak raporları/yorumları sesli okur.

### Phase B — Kendi Müşterin (Forge Loops)
- **Dikte Uyumlu AuditWidget:** `<AuditWidget />` kök katmana eklenmiştir. Hata bildirim ekranında bulunan `🎙️` butonu ile `expo-speech-recognition` motoru tetiklenir ve sesli dikte edilerek hata raporu üretilir.
- **3 Audit Raporu:** Dikte ile üretilen raporlar markdown dosyası olarak eklenmiştir:
  - [audit-report-1.md](file:///c:/Users/Buse/Desktop/nokta/nokta-nokta/submissions/231118023-nokta-nokta/audit-report-1.md)
  - [audit-report-2.md](file:///c:/Users/Buse/Desktop/nokta/nokta-nokta/submissions/231118023-nokta-nokta/audit-report-2.md)
  - [audit-report-3.md](file:///c:/Users/Buse/Desktop/nokta/nokta-nokta/submissions/231118023-nokta-nokta/audit-report-3.md)
- **Forge Ledger:** `FORGE.md` içinde 2 COMMIT, 1 ROLLBACK ve 1 STUCK döngüsü belgelenmiştir.

### Phase C — Köprü (WebRTC Expert Bridge)
- **Uzmana Bağlan:** Uygulama içindeki "Uzmana Bağlan" butonu, tam ekran WebView içerisinde WebRTC tabanlı Jitsi görüntülü çağrı odasını açar. Kamera, ses ve ekran paylaşımı tam uyumlu çalışır.
- **Bridge Log:** Görüşme detayları ve transkript özeti `BRIDGE.md` içindedir.

---

## ⚙️ Kurulum ve Çalıştırma

Proje dizinine geçin ve bağımlılıkları yükleyin:

```bash
cd submissions/231118023-nokta-nokta/app
npm install
```

### Çevresel Değişkenler (.env)
`app/` klasörünün altında `.env` dosyası oluşturup Groq API key'inizi tanımlayın:

```env
EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key_here
```

### Metro Başlatma
```bash
npx expo start
```

---

## 📂 Dosya Yapısı

```text
submissions/231118023-nokta-nokta/
├── README.md              # Bu dosya
├── FORGE.md               # 4 adet Forge döngüsü ledger'ı
├── PERSONAS.md            # Çoklu Persona (Track B) detayları
├── BRIDGE.md              # WebRTC uzman çağrısı özeti
├── DECISIONS.md           # Karar günlüğü
├── avatar.glb             # Kendi yüz modeliniz (Avaturn export)
├── audit-report-1.md      # Dikte edilen 1. hata raporu
├── audit-report-2.md      # Dikte edilen 2. hata raporu
├── audit-report-3.md      # Dikte edilen 3. hata raporu
└── app/                   # Expo React Native + R3F uygulaması
    ├── App.js
    ├── app.json
    ├── package.json
    ├── metro.config.js
    ├── assets/
    │   └── avatar_fallback.glb # Default 3D model
    └── src/
        ├── components/
        │   └── Avatar3D.js
        └── nokta-audit/   # Week 2 Audit widget lokal kopyası
```
