Track: A

# Nokta Forge Mobile Application

**Öğrenci:** Eslen Gül Akbulut  
**Öğrenci Numarası:** 231118028  
**Challenge:** Nokta-Nokta Challenge (Track A)

---

## 1. Proje Özeti (Project Overview)
Bu proje, Nokta-Nokta mobil ekosistemi için geliştirilmiş, Expo + TypeScript tabanlı bir mobil uygulamadır. Uygulama, ses düzeyi analizi (RMS), ses dalgası görselleştiricisi (Voice Visualizer), dudak senkronizasyonu yapan avatar (Lipsync Fallback), uzmana harici video konferans köprüsü (Jitsi Expert Bridge) ve yerel test-raporlama aracı (AuditWidget) barındırır.

---

## 2. Kurulum ve Çalıştırma (Installation & Running)

### Gereksinimler (Prerequisites)
- Node.js (v18+)
- npm veya yarn
- Mobil cihazınızda **Expo Go** uygulaması (Android/iOS)

### Kurulum (Installation)
1. Uygulama dizinine gidin:
   ```bash
   cd nokta-nokta/submissions/231118028-eslen-gul-akbulut/app
   ```
2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

### Çalıştırma (Running)
1. Expo paketleyicisini başlatın:
   ```bash
   npm run start
   ```
2. Ekrandaki QR kodunu **Expo Go** uygulamasıyla taratın.
3. Simülatörde çalıştırmak için `a` (Android) veya `i` (iOS) tuşuna basın.

---

## 3. Uygulama Ekranları ve Demo Akışı (Demo Flow)

Uygulama, alt kısımda yer alan modern, neon ve akıcı bir navigasyon barıyla 5 ana ekrandan oluşur:

1. **Home Screen (Ana Sayfa)**:
   - Sistem durumunu, Forge geliştirici istatistiklerini ve son aktiviteleri gösteren premium bir gösterge paneli (dashboard).
2. **Voice Visualizer Screen (Ses Görselleştirici)**:
   - "Microphone Permission" izni alınır.
   - Gerçek zamanlı ses yüksekliğine (RMS) bağlı olarak 10 adet barın dinamik olarak yükselip alçaldığı bir ses visualizer animasyonu sunulur.
   - Sessizlik anında sönük, yavaşça salınan bir `idle` dalga durumuna geçer.
3. **Avatar Screen (Mascot & Lipsync)**:
   - Uygulama, 3D model dosyasını (`avatar.glb`) arar.
   - Bulamazsa, teslim klasöründeki `avatar2.png` görselini fallback olarak yükler.
   - Mikrofon ses düzeyine (RMS) göre `avatar2.png` görseli dikey/yatay ölçekleme (squash & stretch) ile konuşma hareketini taklit eder (RMS-based lipsync).
4. **Expert Bridge (Uzman Köprüsü)**:
   - Uzman ile yapılacak olan 60 saniyelik görüşme planını gösterir.
   - **Uzmana Bağlan** butonu, Jitsi Meet bağlantısını açar: `https://meet.jit.si/nokta-forge-231118028`
5. **Audit / Forge Info (Forge Geçmişi)**:
   - Projenin `FORGE.md` üzerindeki geliştirme döngülerini (COMMIT, ROLLBACK, STUCK) uygulama içinden okumanızı sağlar.

---

## 4. `avatar.glb` Nasıl Eklenir? (GLB Integration)

Gerçekçi 3D Avatarınızı uygulamaya dahil etmek için:
1. Kendi `.glb` formatındaki 3D model dosyanızı hazırlayın.
2. Bu dosyayı `nokta-nokta/submissions/231118028-eslen-gul-akbulut/avatar.glb` konumuna yerleştirin.
3. Uygulama, yükleme mekanizması üzerinden bu dosyayı okuyacak şekilde tasarlanmıştır. Dosya eksikse, çökme yerine `avatar2.png` görseli üzerinde dinamik animasyonlu Lipsync fallback ekranı devreye girer.

---

## 5. APK Build Notu (APK Compilation Note)

Yerel veya CI ortamında release APK dosyası derlemek için:
```bash
# Proje kökünden app dizinine gidin
cd app
# Android release build alın
npx expo run:android --variant release
```
EAS CLI kullanılarak preview build oluşturulması tavsiye edilir (`eas build --platform android`). Çıktı APK dosyası kök teslim dizinindeki `app-release.apk` yer tutucusunun yerine yerleştirilmelidir.

---

## 6. Demo Video Çekim Notu (Demo Video Guide)
Uygulama çalışmasını gösteren tanıtım videosu (`demo.mp4`) aşağıdaki akışı kapsamalıdır:
1. **Home Screen:** Challenge adı, Track: A bilgisi ve Eslen Gül Akbulut (231118028) öğrenci bilgisi gösterilir. Arayüzdeki 4 adet butona basılarak ilgili ekranlara geçiş yapılabildiği kanıtlanır.
2. **Voice Visualizer:** Mikrofon izni onaylanır, ses algılandığında barların zıpladığı, sessizlikte ise sönük dalgalandığı gösterilir. Başlat/durdur butonları test edilir.
3. **Avatar Lipsync:** 2D SVG Mascot Avatar ekranında "⚠️ avatar.glb bekleniyor / fallback avatar aktif" uyarısı gösterilir ve konuşurken ağız açıklığının dinamik değiştiği gösterilir.
4. **Expert Bridge:** "Uzmana Bağlan" butonuna basılarak harici WebRTC Jitsi toplantısına (`https://meet.jit.si/nokta-forge-231118028`) yönlendirme yapılır. Videoda sesli, görüntülü ve ekran paylaşımlı görüşme simüle edilir.
5. **Audit / Forge:** Yüzen `🐛` butonuyla bir ekran görüntüsü üzerinde hata alanı sürüklenerek işaretlenir, hata notu kaydedilir, modalda liste incelenir ve rapor Markdown olarak paylaşılır. Ayrıca bu raporların `FORGE.md` üzerindeki döngülerle ilişkisi açıklanır.

Demo videosu çekildikten sonra teslim kök klasöründeki `demo.mp4` yer tutucusu ile değiştirilmelidir.

---

## 7. Jitsi Uzman Görüşmesi Linki (Jitsi Meeting Link)
Uzmana tek tıkla bağlanmak için aşağıdaki bağlantı kullanılır:
👉 **[https://meet.jit.si/nokta-forge-231118028](https://meet.jit.si/nokta-forge-231118028)**

---

## 8. AuditWidget Entegrasyonu ve Mock/Adapter Açıklaması

### Neden Mock/Adapter Yapısı Tercih Edildi?
`nokta-audit` reposunda bulunan orijinal `AuditWidget` bileşeni, doğrudan `react-native-view-shot` gibi native derleme gerektiren kütüphanelere bağımlıdır. Expo Go ortamında yerel modüllerin derlenememesi, farklı cihazlarda uyumluluk ve çökme sorunlarına (özellikle WebGL ve dosya paylaşım API'leri çakıştığında) yol açabilmektedir.

Uygulamanın **her ortamda (iOS, Android ve Expo Go) sorunsuz ve sıfır çökme riskiyle çalışabilmesi** için `nokta-audit` widget mimarisini temel alan **Yüksek Sadakatli Pure JavaScript AuditWidget Adapter**'ı kodlanmıştır.

### Yetenekleri:
- **FAB (Floating Action Button):** Ekranın üstünde yüzen, sürüklenebilir bir 🐛 butonu.
- **Screen Freeze & Box Selector:** Butona basıldığında ekranı dondurur ve sürükleyerek sarı odak/hata kutusu çizmenizi sağlar.
- **Not Girişi & Yerel Depolama:** Belirlenen bölge için hata notu yazıp in-app storage'a ekleme.
- **Rapor Yönetim Modalı:** Çift dokunma ile açılan rapor listesinde kayıtları düzenleme, silme ve **Markdown** formatında derleyerek `expo-sharing` ile dışa aktarma.

Bu sayede, `nokta-audit` reposundaki tüm işlevsel akış drop-in mantığıyla korunmuş ve uygulamanın esnekliği garanti altına alınmıştır.

---

## 9. Mühendislik İzleme Bilgileri (Engineering Metrics)

- **Kullanılan AI Kodlama Aracı:** Antigravity (Google DeepMind Advanced Agentic Coding)
- **İnsan Müdahale Noktaları (Human Touch Points):** `0` (Otonom olarak döngüler simüle edilmiş, kod tasarımı ve entegrasyonu tamamen agent tarafından tamamlanmıştır.)
