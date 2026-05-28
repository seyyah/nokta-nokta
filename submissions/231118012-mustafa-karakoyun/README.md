Track: C

## 🚀 Nokta-Nokta Halka Kapanışı — Mustafa Karakoyun (231118012)

Bu proje, **seyyah/nokta** mimarisi üzerinde **Phase A (Ayna - Ses ve 3D WebGL Lipsync Avatar)**, **Phase B (Forge Döngüsü ve Sesli Dikte)** ve **Phase C (Otonom Köprü - WebRTC Video Bridge)** gereksinimlerini eksiksiz karşılayarak tüm döngü halkasını kapatan ileri düzey mobil uygulamadır.

Maksimum teknik derinlik, otonom tıkanıklık tespiti ve entegre WebRTC çözümü sunan **Track C (Otonom Köprü)** başarıyla tamamlanmıştır.

---

## 📱 Proje Kurulumu, QR Kod & Demo Videosu

Uygulamanın çalışır halini görmek, cihazınıza kurmak veya incelemek için aşağıdaki kaynakları kullanabilirsiniz:

### 🎥 Demo Videosu (YouTube Shorts)
Uygulamanın mikrofon genlik barlarını, 3D avatarın konuşmaya duyarlı dinamik kafa jestlerini, sesli dikte (STT) modalını ve otonom stuck durumunda açılan görüntülü uzman köprüsünü (WebRTC HUD) gösteren demo videosunu izleyebilirsiniz:
👉 **[Nokta-Nokta Demo Videosunu İzle (YouTube Shorts)](https://youtube.com/shorts/iOTRY9W4uWA?feature=share)**

### 💎 Expo Build (Android APK) Proje Sayfası
EAS Build ile Android için üretilmiş olan çalışan `.apk` paketine, build loglarına ve proje detaylarına erişebilirsiniz:
👉 **[Expo Build Proje Detayları Sayfası](https://expo.dev/accounts/mustafa1299/projects/PhaseA/builds/bce66c10-d854-455f-84da-969490cce284)**

### 🤳 Uygulamayı Yüklemek İçin QR Kod
Cihazınızın kamerasını kullanarak aşağıdaki QR kodu taratıp uygulamayı anında indirebilir ve test edebilirsiniz:

![EAS Android Build QR Code](https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https://expo.dev/accounts/mustafa1299/projects/PhaseA/builds/bce66c10-d854-455f-84da-969490cce284)

*(Kameranızla tarattığınızda sizi doğrudan indirme ve kurulum sayfasına yönlendirecektir)*

---

## 📸 Çözüm Aşamaları (Phases)

### 🎙️ Phase A — Ayna (Voice & 3D WebGL Lipsync Avatar)
- **Mikrofon & Çift Katmanlı Ses Kaydı:** `expo-av` metering RMS verilerini en yüksek kararlılıkla okumak için native `setOnRecordingStatusUpdate` olay yöneticisi ve zamanlayıcı polling (interval) içeren çift katmanlı (dual-layer) bir yapı kuruldu. Ses seviyesi **40ms** gibi ultra düşük gecikmeli periyotlarla algılanır.
- **3D WebGL Canvas Entegrasyonu:** React Native'in native 3D katmanlarındaki Expo Go çakışmalarını aşmak amacıyla, kullanıcının gerçek HD yüz taranmış avatarını (`model (2).glb` -> `avatar.glb`) bellekteki Base64 TS modülü [avatarData.ts](file:///c:/Users/karak/Desktop/nokta-nokta/submissions/231118012-mustafa-karakoyun/app/src/utils/avatarData.ts) üzerinden WebView içerisindeki donanım ivmeli Three.js WebGL motoruna enjekte eden hibrit bir mimari kuruldu.
- **Dinamik Jest & Beden Dili (Arm & Bone Sway Fix):** HD modelin doğal inik kol duruşu (relaxed A-pose) korunarak, konuşma RMS genliğiyle tam senkronize biçimde çalışan kafa sallama (nodding), boyun dönmesi (swaying) ve omurga sarsıntısı animasyonları kodlandı. Konuşma bittiğinde avatar yumuşak bir sinüs rölanti nefes ve göz kırpma moduna geçer.
- **Erkek Konuşma Sesi (TTS):** Cihazdaki Türkçe erkek seslerini (`cem`, `tolga`, `male`, `erkek` vb.) dinamik olarak tarayan ses arayıcı entegre edilmiştir. TTS asistan konuşmaları tok, derin ve maskulen `pitch: 0.82` ve `rate: 0.92` manipülasyonu ile karizmatik bir erkek sesiyle çalışmaktadır.
- **Neon Görselleştirici:** Ses dalgalarını yansıtan neon efektli ve HSL gradyanlı 15 barlı akıcı bir ekolayzır tasarımı yer almaktadır. Sessizlik durumunda ekolayzır yumuşak bir sinüzoidal "idle" dalgasına dönüşür.

### 🛠️ Phase B — Kendi Müşterin (Self-as-User Forge)
- **Sesli Dikte (STT):** Kullanıcı önerilerinin toplandığı `<ProposalFAB />` drop-in widget'ına **sesli dikte (STT) özelliği** kazandırılmıştır. Kullanıcı butona tıklayıp konuştuğunda ses dalgaları izlenir ve konuşma bittiğinde yapay zeka transkripsiyon motoru ses kaydını ekran bağlamına (Home veya Projects konumuna) göre akıllıca çözerek metin alanına dikte eder.
- **Forge Ledger (`FORGE.md`):** Gerçek 4 onarım döngüsü (`READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT/ROLLBACK`) kaydedilmiştir. Bu döngülerde **3 Başarılı Commit** ve **1 Rollback** yer almaktadır.

### 📞 Phase C — Köprü (HITL/HOTL Video Bridge)
- **Otonom STUCK Tespiti:** Yapay zeka ajanı ardışık başarısızlıklar aldığında veya kendini rollback ettiğinde tıkanıklık (STUCK) durumu otomatik algılanır. Ana sayfada kullanıcıya otonom tıkanıklık uyarısı gösterilerek İnsan Uzman Köprüsü aktifleşir.
- **WebRTC Görüntülü Görüşme:** Jitsi Meet'in native yönlendirme hatalarını önlemek amacıyla **Video + Audio + Screen Share** (üçü birden) destekleyen native WebRTC Call HUD'ı başarıyla geliştirildi.
- **Bridge Raporlama (`BRIDGE.md`):** Görüşme sonrasında uzmanın çözüm notları kaydedilir ve `BRIDGE.md` transkript raporu olarak otonom döngünün sonraki girdisi (`NEXT_CYCLE_INPUT`) olarak beslenir.

---

## 🛠️ Kurulum & Çalıştırma

### Bağımlılıkların Yüklenmesi
Uygulama klasörüne giderek aşağıdaki komutla paketleri yükleyin:
```bash
cd submissions/231118012-mustafa-karakoyun/app
npm install
```

### Uygulamayı Başlatma
```bash
# Geliştirme sunucusunu başlatmak için
npm run dev

# Android Emulator / Cihazda çalıştırmak için
npm run android

# iOS Simulator'da çalıştırmak için
npm run ios
```

---

## 📂 Dosya Yapısı & Belgeler

| Dosya Yolu | Açıklama | Durum |
| --- | --- | --- |
| `submissions/231118012-mustafa-karakoyun/app/` | Geliştirilen Expo mobil projesi | Başarılı (0 Hata) |
| `submissions/231118012-mustafa-karakoyun/app/avatar.glb` | Avaturn export - Geliştiricinin HD 3D yüz modeli | Başarılı |
| `submissions/231118012-mustafa-karakoyun/FORGE.md` | AI onarım döngülerinin zaman damgalı tablosu | Başarılı |
| `submissions/231118012-mustafa-karakoyun/BRIDGE.md` | HITL transkript ve otonom stuck notları | Başarılı |
| `submissions/231118012-mustafa-karakoyun/DECISIONS.md` | Mimari kararlar günlüğü | Başarılı |
| **Bağlantı / Link** | **Açıklama** | **Erişim Durumu** |
| [EAS Build APK Sayfası](https://expo.dev/accounts/mustafa1299/projects/PhaseA/builds/bce66c10-d854-455f-84da-969490cce284) | EAS Android APK indirme ve QR kod sayfası | Aktif / Taranabilir |
| [YouTube Demo Videosu](https://youtube.com/shorts/iOTRY9W4uWA?feature=share) | Phase A+B+C içeren ekran paylaşımı videosu | Yayında |

---

## 👥 İnsan Dokunuşları & AI İş Birliği
- **Toplam İnsan Müdahale Sayısı (Human Touch Points):** 1 (Döngü derleme hatasında rollback komutu için).
- AI agent ve insan uzman hibrit iş birliği ile halka kusursuz şekilde kapatılmıştır!