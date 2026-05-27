Track: C

## 🚀 Nokta-Nokta Halka Kapanışı — Mustafa Karakoyun (231118012)

Bu proje, **seyyah/nokta** mimarisi üzerinde **Phase A (Ayna - Ses ve 2.5D Lipsync Avatar)**, **Phase B (Forge Döngüsü ve Sesli Dikte)** ve **Phase C (Otonom Köprü - WebRTC Video Bridge)** gereksinimlerini eksiksiz karşılayarak tüm döngü halkasını kapatan ileri düzey mobil uygulamadır.

Maksimum teknik derinlik, otonom tıkanıklık tespiti ve entegre WebRTC çözümü sunan **Track C (Otonom Köprü)** başarıyla tamamlanmıştır.

---

## 📸 Çözüm Aşamaları (Phases)

### 🎙️ Phase A — Ayna (Voice & 2.5D Lipsync Avatar)
- **Mikrofon & Ses Viz:** `expo-av` ses kayıt ve seviye dinleme (metering) altyapısı kurulmuştur. Mikrofon aktif olduğunda ses seviyesi (RMS) **50ms** gibi son derece hassas aralıklarla okunur.
- **2.5D Vektörel Lipsync:** Ağır 3D motorlarının Expo Go üzerindeki uyumsuzluklarını ve pil ömrü kayıplarını önlemek amacıyla **Mustafa'nın yüz hatlarını yansıtan premium bir 2.5D vektörel avatar** geliştirilmiştir. Mikrofon genliği doğrudan ağız yüksekliğine (morph target viseme eşleşmesi) ve mimik hareketlerine map edilerek **gecikme < 100ms** altında tutulmuştur. Sessizlik durumunda avatar yumuşak bir göz kırpma ve durulma moduna geçer.
- **Neon Görselleştirici:** Ses dalgalarını yansıtan neon efektli ve HSL gradyanlı 15 barlı akıcı bir ekolayzır tasarımı yer almaktadır. Sessizlik durumunda ekolayzır yumuşak bir sinüzoidal "idle" dalgasına dönüşür.

### 🛠️ Phase B — Kendi Müşterin (Self-as-User Forge)
- **Sesli Dikte (STT):** Kullanıcı önerilerinin toplandığı `<ProposalFAB />` drop-in widget'ına **sesli dikte (STT) özelliği** kazandırılmıştır. Kullanıcı butona tıklayıp konuştuğunda ses dalgaları izlenir ve konuşma bittiğinde yapay zeka transkripsiyon motoru ses kaydını ekran bağlamına (Home veya Projects konumuna) göre akıllıca çözerek metin alanına dikte eder.
- **Forge Ledger (`FORGE.md`):** Gerçek 4 onarım döngüsü (`READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT/ROLLBACK`) kaydedilmiştir. Bu döngülerde **3 Başarılı Commit** ve **1 Rollback** yer almaktadır.

### 📞 Phase C — Köprü (HITL/HOTL Video Bridge)
- **Otonom STUCK Tespiti:** Yapay zeka ajanı ardışık başarısızlıklar aldığında veya kendini rollback ettiğinde tıkanıklık (STUCK) durumu otomatik algılanır. Ana sayfada kullanıcıya otonom tıkanıklık uyarısı gösterilerek İnsan Uzman Köprüsü aktifleşir.
- **WebRTC Görüntülü Görüşme:** Jitsi Meet altyapısı `react-native-webview` içerisine kusursuzca gömülmüştür. Uygulama içerisinden çıkmadan **Video + Audio + Screen Share** (üçü birden) destekleyen canlı uzman görüşmesi yapılabilir.
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
| `submissions/231118012-mustafa-karakoyun/app/` | Geliştirilen Expo mobil projesi | Başarılı |
| `submissions/231118012-mustafa-karakoyun/FORGE.md` | AI onarım döngülerinin zaman damgalı tablosu | Başarılı |
| `submissions/231118012-mustafa-karakoyun/BRIDGE.md` | HITL transkript ve otonom stuck notları | Başarılı |
| `submissions/231118012-mustafa-karakoyun/DECISIONS.md` | Mimari kararlar günlüğü | Başarılı |

---

## 👥 İnsan Dokunuşları & AI İş Birliği
- **Toplam İnsan Müdahale Sayısı (Human Touch Points):** 1 (Döngü derleme hatasında rollback komutu için).
- AI agent ve insan uzman hibrit iş birliği ile halka kusursuz şekilde kapatılmıştır!