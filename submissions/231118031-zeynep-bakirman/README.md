Track: A

# 🎙️ Nokta-Nokta Final Submission

**Öğrenci:** Zeynep Bakırman  
**Öğrenci No:** 231118031  
**Slug:** `zeynep-bakirman`  
**Seçilen Track:** **Track A - Voice viz + lipsync fidelity**

Bu teslimat Track A odaklıdır: mikrofon girdisi gerçek zamanlı görselleştirilir, avatar sahnede `.glb` olarak mount edilir, ağız/lipsync tepkisi düşük gecikmeyle mikrofon seviyesine bağlanır ve STUCK durumunda Jitsi WebRTC köprüsü açılır.

## 🔗 Teslim Linkleri

| Kalem | Link / Dosya |
|---|---|
| Expo Build / QR | https://expo.dev/accounts/zeynepbakirman/projects/app/builds/f3f7c3bc-f144-4ec6-82fd-ecb03456538a |
| Demo Video Linki | https://youtu.be/oAl6NrlqfjM?si=VKcCTmsGQgbL0LVS |
| Demo Video Dosyası | `demo.mp4` |
| Android APK | `app-release.apk` |
| App Kaynak Kodu | `app/` |
| Avatar | `app/avatar.glb` |

## ✅ Hızlı Kanıt Checklist

- [x] Yalnızca `submissions/231118031-zeynep-bakirman/` altında değişiklik yapıldı
- [x] README ilk satırda `Track: A` içeriyor
- [x] Expo build linki README'de var
- [x] 3 dakikadan kısa Phase A+B+C demo video linki var
- [x] `demo.mp4` submission klasöründe mevcut
- [x] `app-release.apk` submission klasöründe mevcut
- [x] `app/avatar.glb` Avaturn export olarak eklendi
- [x] `.easignore` EAS limitleri için `node_modules`, `.expo`, `android`, `ios` ignore ediyor
- [x] `DECISIONS.md` Track A, lipsync ve Jitsi kararlarını açıklıyor
- [x] `FORGE.md` gerçek cycle ledger içeriyor
- [x] `BRIDGE.md` Jitsi bridge notlarını içeriyor

## 🪞 Phase A - Voice + Avatar

Track A için uygulamada şu akış kuruldu:

- `expo-av` ile canlı mikrofon izni ve metering/RMS takibi
- 50 ms update interval ile hedef gecikme: **< 200 ms**
- Sessizlik algılanınca `idle` state'e dönüş
- Hareketli bar voice visualizer
- `@react-three/fiber/native` ile 3D sahne
- `@react-three/drei/native` + `useGLTF` ile `avatar.glb` mount
- Morph target varsa viseme/ARKit ağız şekillerini sürme
- Morph target yoksa avatar yüzünde procedural mouth fallback

## 🛠️ Phase B - Audit + FORGE

`<AuditWidget />` uygulamaya entegre edildi. Kullanıcı testleri sırasında gelen gerçek geri bildirimler FORGE döngüsüne işlendi.

FORGE özeti:

| Cycle | Status | Girdi | Sonuç |
|---|---|---|---|
| Cycle 1 | ROLLBACK | Commit yapısı tek parça kaldı | Tek final commit geri alınıp anlamlı commitlere bölündü |
| Cycle 2 | COMMIT | Avatar yüzü görünmüyor | Kamera/yüz kadrajı düzeltildi |
| Cycle 3 | COMMIT | Kadraj hâlâ fazla yakın | Üst gövde/yüz kadrajı genişletildi |

Detaylar:

- `FORGE.md`
- `audit-reports/cycle-1-commit-structure.md`
- `audit-reports/cycle-2-avatar-face-crop.md`
- `audit-reports/cycle-3-avatar-upper-body-frame.md`

## 📞 Phase C - Uzmana Bağlan

Uygulamadaki **Uzmana Baglan** butonu Jitsi Meet WebRTC odasını açar:

```text
https://meet.jit.si/nokta-nokta-231118031-zeynep-bakirman
```

Desteklenenler:

- [x] Video görüşme
- [x] Mikrofon/ses
- [x] Jitsi toolbar üzerinden ekran paylaşımı
- [x] App içi WebView bridge

Not: `meet.jit.si` oda başlatan kullanıcıdan tarayıcı login isteyebilir. Bu nedenle uzman kişi odayı tarayıcıdan başlatabilir; uygulamadaki buton aynı WebRTC odasına katılmak için kullanılır.

## 🧭 Decision Log Özeti

Kararlar `DECISIONS.md` içinde detaylandırıldı:

- **Track A seçimi:** Voice visualizer, lipsync fidelity, düşük gecikme ve akıcılık önceliklendirildi.
- **Lipsync yaklaşımı:** GLB morph target içerirse viseme sürülür; içermezse procedural mouth fallback kullanılır.
- **Jitsi seçimi:** API key gerektirmediği, hızlı WebRTC bridge sunduğu ve video/audio/screen share desteklediği için seçildi.
- **EAS yapılandırması:** `.easignore` ile büyük local/generated klasörler dışarıda bırakıldı.

## 📦 Dosya Yapısı

```text
submissions/231118031-zeynep-bakirman/
  app/
    App.tsx
    avatar.glb
    .easignore
    app.json
    metro.config.js
    package.json
  audit-reports/
    cycle-1-commit-structure.md
    cycle-2-avatar-face-crop.md
    cycle-3-avatar-upper-body-frame.md
  app-release.apk
  demo.mp4
  BRIDGE.md
  DECISIONS.md
  FORGE.md
  README.md
```

## ▶️ Çalıştırma

```bash
cd submissions/231118031-zeynep-bakirman/app
npm install
npx expo start
```

## 🏗️ Build

```bash
cd submissions/231118031-zeynep-bakirman/app
eas build -p android --profile preview
```

## 🤖 AI Tool Log

Bu teslimatta **OpenAI Codex coding agent** kullanıldı.

Kullanılan araçlar:

- PowerShell terminal komutları
- Git branch/commit/push akışı
- npm ve Expo CLI
- TypeScript kontrolü: `npx tsc --noEmit`
- Expo sağlık kontrolü: `npx expo-doctor`
- GitHub connector denemesi; yetki hatası nedeniyle PR manuel GitHub compare ekranından açıldı

## 🧪 Doğrulama

- [x] `npx tsc --noEmit` geçti
- [x] `npx expo-doctor` 17/17 geçti
- [x] APK build alındı
- [x] Demo video dosyası eklendi
- [x] PR branch'i GitHub'a pushlandı
