# Nokta - Away Mission (Track A)

### Öğrenci Bilgileri
- **Proje Adı:** Nokta - Idea Capture & Spec Builder
- **Öğrenci :** Begüm Handan DEMİR
- **Seçilen Parkur:** Track A: Dot Capture & Enrich (Fikir Yakalama ve Zenginleştirme)

---

## 🎥 Demo ve Bağlantılar
- **60 Saniyelik Demo Videosu:** [https://www.youtube.com/shorts/lfSymWMwgLc]
- **Expo QR / Yayın Bağlantısı:** [https://expo.dev/accounts/begummmm/projects/nokta/builds/c3c50282-b883-43bb-9926-9e9c7cc11973]

---

## 📒 Karar Defteri (Decision Log)

Bu bölümde, projenin geliştirme sürecinde alınan temel teknik kararlar ve mimari tercihler yer almaktadır.

### 1. Navigasyon ve Rota Yönetimi
Uygulama, modern bir dosya tabanlı yönlendirme sistemi sunan **expo-router** üzerine inşa edilmiştir. Native Stack yapısı kullanılarak sayfalar arası geçişler (Giriş -> Sohbet -> Spesifikasyon) pürüzsüz hale getirilmiş, kullanıcı deneyimini korumak adına spesifikasyon aşamasında geri dönüşler kısıtlanmıştır.

### 2. Etkileşimli Sohbet (Wizard) Mimarisi
Kullanıcının fikrini zenginleştirmek için adım adım ilerleyen bir **State-driven Conversational UI** tasarımı benimsenmiştir. Yapay zeka ile etkileşimi daha doğal hissettirmek için:
- Mesajlar arası simüle edilmiş yazma gecikmeleri (`typing delay`).
- Soruların hiyerarşik bir sıra ile (Problem -> Hedef Kitle -> Kapsam) sorulması.
- Yanıtların gerçek zamanlı hafızaya alınarak final belgesine aktarılması sağlanmıştır.

### 3. Tek Sayfa Spesifikasyon (Single Page Spec) Requirement
Görev gereksinimlerini karşılamak amacıyla, sohbet sonunda toplanan tüm teknik verileri formal bir formatta sunan **"Generated Spec"** ekranı oluşturulmuştur. Bu ekran, ham bir sohbet geçmişini profesyonel bir mühendislik dokümanına dönüştürerek projenin nihai çıktısını oluşturur.

### 4. Geliştirme Süreci ve AI Entegrasyonu
Projenin görsel iskeleti (Scaffolding) ve sayfa tasarımları **Antigravity AI Agent** aracılığıyla oluşturulmuştur. Mantıksal akışlar ve kullanıcı arayüzündeki hassas düzenlemeler (renk paleti, klavye uyumu, navigasyon kilitleri) **Prompt Engineering** teknikleriyle optimize edilmiştir. Tasarımda "Soft Minimalism" yaklaşımı benimsenerek, kullanıcıyı ana odak olan "fikir"den uzaklaştırmayan ferah bir tema kullanılmıştır.

---

## 🛠️ Teknik Kurulum
Uygulamayı yerelde çalıştırmak için:
1. Gerekli bağımlılıkları yükleyin: `npm install`
2. Expo sunucusunu başlatın: `npx expo start`
3. Expo Go uygulaması ile QR kodu okutun.
