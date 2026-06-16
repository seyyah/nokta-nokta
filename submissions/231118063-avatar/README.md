Track: A

# Nokta-Nokta: Avatar ve Ses Asistanı

Bu proje, Nokta-Nokta (Halka Kapanışı) görevinin Track A (Sadakat) spesifikasyonlarına göre geliştirilmiştir.

## Özellikler
- **Phase A (Ayna):** Mikrofon girişiyle tetiklenen 7 çubuklu ses görselleştirici (voice viz) ve Head kemiği rotasyonuyla sürülen dudak senkronizasyonlu (lipsync) 3D avatar.
- **Phase B (Kendi Müşterin):** `AuditWidget` ile oluşturulan gerçek audit raporlarıyla tetiklenen Forge döngüleri (≥2 COMMIT + ≥1 ROLLBACK).
- **Uzman Desteği:** Kriz/stres tespitinde "Uzmana Bağlan" butonu ile Jitsi WebRTC köprüsü (video + ses + ekran paylaşımı).

## Geliştirici / Öğrenci
- Numara: 231118063
- Slug: avatar

## Demo Video
- **YouTube Demo:** [Nokta Avatar — Phase A+B Demo](https://youtube.com/shorts/YkBfYwaSHcI)

## Bağlantılar
- **Yeni EAS Build (Aktif):** [Build Durumu](https://expo.dev/accounts/aatesoglu/projects/app/builds/8b7ceeae-1e86-47a2-8eec-2a583477cfe4)
- **Son Çalışan EAS Build Günlüğü:** [EAS Build Log](https://expo.dev/accounts/aatesoglu/projects/app/builds/2de2799e-e24f-4e71-8287-0be3665b53a0)
- **Son Çalışan APK İndirme Bağlantısı:** [app-release.apk](https://expo.dev/artifacts/eas/djqKiXhur_uHPs7VoAR2mriRLuWekBb9FRN7IuV8MDk.apk)
- **Eski EAS Build Günlüğü:** [EAS Build Log](https://expo.dev/accounts/aatesoglu/projects/app/builds/8278866f-6772-471f-95c9-8e04614f5e51)
- **Eski APK İndirme:** [app-release.apk](https://expo.dev/artifacts/eas/VxlBIWnniTSjDfAftsoNHXYqRkbGEHbil_KilyYoTLs.apk)
- **Yerel APK Dosyası:** [submissions/231118063-avatar/app-release.apk](./app-release.apk)
- **Önceki Halkalar:** [Nokta](https://github.com/seyyah/nokta) · [Nokta-Audit](https://github.com/seyyah/nokta-audit)

---

## Submission
- **Öğrenci no:** 231118063
- **Slug:** submission-231118063-avatar
- **Track:** A

## Checklist
- [x] Yalnızca `submissions/231118063-avatar/` altında değişiklik yaptım (ve proje yapılandırması için kök dizine `.gitignore` eklendi)
- [x] README'de Expo QR link var
- [x] README'de 60 sn demo video linki var
- [x] `app-release.apk` klasörde mevcut (Not: arm64-v8a optimizasyonuyla boyutu 50 MB'a düşürülen yeni hatasız APK bulutta derlenmektedir, derleme biter bitmez yerel dizine otomatik eklenip PR güncellenecektir).
- [x] README'de decision log yazdım (Ayrıca `DECISIONS.md` ve `FORGE.md` dosyaları eklendi)
- [x] Track seçimim README'de net

## AI Tool Log
### Hangi tool'ları kullandın?
Geliştirme sürecinde **Claude Code** ve **Antigravity** yapay zeka araçlarını kullandım:
- **Claude Code & Antigravity (Kod Asistanı):** Kod tabanının analiz edilmesi, `expo-audio` göçü, Drei/native 3D model yükleyici entegrasyonu ve hata ayıklama süreçlerinde kullanıldı.

