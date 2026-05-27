# Track: A — Sadelik

## 231118098-tohum: NOKTA Audit Forge

> Müşteri yakalar, agent onarır, sen review edersin.

---

## Proje Özeti

NOKTA, dağınık fikirleri yapılandırılmış spesifikasyonlara dönüştüren AI destekli bir mobil fikir yönetim uygulamasıdır. Bu submission, `@xtatistix/mobile-audit` widget'ını drop-in olarak entegre eder ve Forge döngüsünü uygular.

## Expo Link & Demo

- **Expo Build:** https://expo.dev/accounts/aleyna1955/projects/nokta-audit-forge/builds/b3d94ea0-bd7e-4cb7-afcf-f7b28b79f593
- **APK İndir:** https://expo.dev/artifacts/eas/od6pwLLjbupmQYciKL7aiD.apk
- **Demo Video:** [60sn video linki eklenecek]
- **APK:** `app-release.apk` (63MB)

## Tech Stack

- React Native + Expo SDK 54
- TypeScript
- @react-navigation/native (Stack + Bottom Tabs)
- @xtatistix/mobile-audit (Audit Widget)
- @react-native-async-storage/async-storage

## Ekranlar (4 Ekran)

1. **Home Screen** - Fikir listesi, FAB ile yeni fikir ekleme
2. **Add Idea Screen** - Başlık, açıklama, durum, etiket girişi
3. **Idea Detail Screen** - Fikir detayı, durum güncelleme, silme
4. **Profile Screen** - İstatistikler, uygulama bilgisi

## AuditWidget Entegrasyonu

Widget, `App.tsx` içinde dependency injection ile mount edilmiştir:

```typescript
<AuditWidget
  appName="NOKTA"
  deps={{
    captureScreen,
    writeFile,
    writeFileBinary,
    shareFile,
    storage: auditStorage,
    currentScreen: routeName,
    reporterId: '231118098',
  }}
  initialPosition={{ bottom: 180, right: 16 }}
/>
```

**Drop-in garantisi:** Widget kaldırıldığında uygulama sorunsuz çalışır. Native kod widget'a bağımlı değil.

## Decision Log

| Karar | Gerekçe |
|-------|---------|
| Track A seçimi | Önceki PR'da Track A kullandım, tutarlılık + sadelik bonusu |
| 4 ekran tasarımı | Minimum 3 gerekli, 4 ekran yeterli kapsam sağlıyor |
| Dark theme | Modern görünüm, NOKTA konseptine uygun |
| AsyncStorage | Basit, expo uyumlu, widget bağımlılığı yok |
| Bottom tabs | UX standartı, kolay navigasyon |

## AI Tool Kullanımı

- **Claude Code CLI** - Proje oluşturma, kod yazımı, debug
- Tüm kodlar Claude Code ile üretildi ve review edildi

## Audit Reports

`audit-reports/` klasöründe en az 3 burn-in'li `.md` raporu:

1. `report-home-screen.md`
2. `report-add-idea-screen.md`
3. `report-profile-screen.md`

## Forge Döngüsü

Detaylar `FORGE.md` dosyasında. Minimum 3 başarılı + 1 rollback cycle loglanmıştır.

## Kurulum

```bash
cd app
npm install
npx expo start
```

## Dosya Yapısı

```
submissions/231118098-tohum/
├── README.md           # Bu dosya
├── FORGE.md            # Cycle ledger
├── audit-reports/      # ≥3 .md rapor
│   ├── report-home-screen.md
│   ├── report-add-idea-screen.md
│   └── report-profile-screen.md
├── app/                # Expo projesi
│   ├── App.tsx
│   ├── src/
│   │   ├── screens/
│   │   ├── utils/
│   │   └── types/
│   └── ...
└── app-release.apk
```

---

**231118098** | Track A — Sadelik | NOKTA Audit Forge Challenge
