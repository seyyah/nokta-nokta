Track: B

## 🚀 Nokta Audit-Forge Mission — Mustafa Karakoyun (231118012)

Bu proje, **seyyah/nokta** mimarisine `@xtatistix/mobile-audit` widget entegrasyonunu (Phase A) ve ardından üretilen kullanıcı geri bildirim raporlarının bir Coding Agent aracılığıyla otonom olarak onarılmasını (Phase B) içeren döngüsel bir mobil uygulama çalışmasıdır.

---

## 🛠️ Proje Detayları & Kurulum

- **Geliştirme Ortamı:** Expo + TypeScript (Minimal Nokta Klonu)
- **Modüller:** Onboarding, Fikir/Spec Listesi, Detay ve Ayarlar Ekranları
- **Bağımlılık Disiplini (Dependency Injection):** Host uygulama sınırlarına (application boundary) sadık kalınmıştır. `captureScreen`, `shareFile` ve `writeFile` gibi tüm native yetenekler widget'a dışarıdan prop (`deps`) yoluyla enjekte edilmiştir; widget içerisine doğrudan native paket import edilmemiştir.
- **Dinamik Rota Takibi:** `currentScreen` prop'u Expo Router üzerinden anlık olarak beslenmektedir.

---

## 📊 Mühendislik İzleri (Engineering Trace) & AI Logu

Bu projedeki otonom onarım ve geliştirme süreçlerinde **Claude Code CLI** ve **Cursor** aktif olarak kullanılmıştır. Toplamda 15 dakikalık zaman kutuları (timebox) içerisinde 4 döngü işletilmiştir.

### 👥 Human Touch Points (İnsan Müdahale Sayısı)
- **Toplam Müdahale Sayısı:** 1
*(Süreç boyunca agent tamamen otonom çalışmış, yalnızca 1 döngüde projenin derleme hatası alması üzerine rollback komutu vermek için insan müdahalesine ihtiyaç duyulmuştur).*

---

## 🎥 Demo & Çalışır Teslim Linkleri

- **Expo QR / Geliştirici Linki:** [Expo Build & Project Page](https://expo.dev/accounts/mustafa1299/projects/PhaseA/builds/f6e838cb-1d48-4802-b88a-91bfc1dfe708)
- **Demo Videosu (≤60 sn):** [YouTube Shorts Demo Video](https://youtube.com/shorts/CE8fx6uPx6o?si=P-xUVSxu0YP1aQI8)
- **Ukrayna / Üretilen APK:** `submissions/231118012-mustafa-karakoyun/app-release.apk` dizininde yerel yükleme dosyası mevcuttur.

---

## 📝 Karar Günlüğü (Decision Log)

1. **Track B Seçimi:** Kullanıcı önerilerini ve feature request mekanizmasını zenginleştirmek, müşterinin geliştirici olduğu senaryoyu canlandırmak adına Yaratıcılık (Track B) rotası seçilmiştir.
2. **Çoklu Belge Formatı:** Kullanıcılardan toplanan geliştirme önerilerinin hem teknik analiz araçlarına (Markdown) hem de yönetsel sunumlara (Docx) girdi oluşturabilmesi için çift formatlı belge üretim algoritması utils katmanında kurgulanmıştır.
3. **Rollback Stratejisi:** Agent'ın ürettiği başarısız hipotezlerin kod tabanını kirletmemesi adına Git rollback mekanizması simüle edilmiş ve değerli başarısızlık verisi `FORGE.md` içerisine kaydedilmiştir.