# STATUS.md — 231118068-FIKIR-SPEC
> Oluşturulma: 2026-05-28 | Güncelleme: 2026-05-28 (Phase A: AuditWidget mount) | Yöntem: dosya okuma, tahmin yok

---

## PHASE A — AuditWidget Drop-in (2026-05-28)

### Yapılanlar
1. **npm install** → 726 paket kuruldu, derleme ortamı hazır
2. **seyyah/nokta-audit** reposu `/tmp/nokta-audit`'e klonlandı, README incelendi
   - Kurulum yöntemi: **npm paketi** → `npm install @xtatistix/mobile-audit`
   - Peer deps: `expo-file-system`, `expo-sharing`, `react-native-view-shot`
   - Storage adaptörü: host `AsyncStorage` ile `AuditStorage` interface'i implement eder
3. **Peer dependency kurulumu** (Expo SDK 54 uyumlu sürümler):
   ```
   @react-native-async-storage/async-storage  2.2.0
   @xtatistix/mobile-audit                    0.1.0
   expo-file-system                           ~19.0.22
   expo-sharing                               ~14.0.8
   react-native-view-shot                     4.0.3
   ```
4. **App.tsx güncellendi** — `<AuditWidget />` `GestureHandlerRootView` içinde, `NavigationContainer`'ın kardeşi olarak mount edildi (README "self-contained mod" örneğine birebir uygun)

### App.tsx değişikliği özeti
- Eklenen importlar: `captureScreen`, `captureRef` (react-native-view-shot), `File`, `Paths` (expo-file-system), `Sharing` (expo-sharing), `AsyncStorage`, `AuditWidget`, `AuditStorage`, `AuditNote`
- `auditStorage` adaptörü: AsyncStorage üzerinde `loadNotes` / `saveNotes`
- `deps`: `captureScreen`, `captureRef`, `writeFile` (yeni `File` API), `writeFileBinary` (base64), `shareFile`, `storage`, `currentScreen: 'App'`, `reporterId: 'qa-team'`, `BugIcon: 🐛`
- `initialPosition`: `{ bottom: 110, right: 16 }` (var olan 3 ekranın FAB'ına çarpmaz)
- 3 mevcut ekran (Home / Questions / Spec) **dokunulmadı**

### TypeScript durumu
- **App.tsx hataları:** 0 (temiz)
- **Kalan 1 hata:** `node_modules/@xtatistix/mobile-audit/src/components/AuditSelector.tsx:160` — `...StyleSheet.absoluteFill` spread'i strict modda `TS2698` verir. Bu paketin kendi kaynak kodundaki bir sorun; `skipLibCheck` `.d.ts`'lere uygulanır, `.ts` kaynaklara uygulanmaz. **Metro/Babel runtime'da bunu sorunsuz derler** — `tsc --noEmit` uyarısı kalmaya devam eder, build'i engellemez.

### Test talimatı
```bash
cd app
npx expo start --android   # veya --ios
```
Uygulamada:
1. Sağ alt köşede kırmızı **🐛 FAB** görünmeli (bottom: 110, right: 16)
2. **Tek dokunuş** → ekran görüntüsü alınır → sarı kutu çiz → "Devam" → not yaz → kaydet
3. **Çift dokunuş** FAB'a → not listesi açılır → "Markdown" butonu → sistem paylaşımı
4. "Yakala →" ile soru akışına gir, 3 ekranın bozulmadığını doğrula

---

---

## 1. KLASÖR AĞACI

```
231118068-fikir-spec/
├── app-release.apk              ← derleme çıktısı (binary)
├── idea.md
├── README.md
├── .Rhistory                    ← boş / alakasız
└── app/
    ├── App.tsx
    ├── index.ts
    ├── app.json
    ├── eas.json
    ├── package.json
    ├── package-lock.json
    ├── tsconfig.json
    ├── .env.example
    ├── .gitignore
    ├── assets/
    │   ├── icon.png
    │   ├── adaptive-icon.png
    │   ├── splash-icon.png
    │   └── favicon.png
    └── src/
        ├── screens/
        │   ├── HomeScreen.tsx
        │   ├── QuestionFlowScreen.tsx
        │   └── SpecOutputScreen.tsx
        └── services/
            └── claude.ts
```

**Eksik / olmayan:** `src/components/` klasörü yok, `FORGE.md` yok, `src/hooks/` yok.

---

## 2. PACKAGE.JSON — BAĞIMLILIKLAR VE SCRİPTLER

### Scripts
| Komut | Ne yapar |
|---|---|
| `npm start` | `expo start` |
| `npm run android` | `expo start --android` |
| `npm run ios` | `expo start --ios` |
| `npm run web` | `expo start --web` |

### Bağımlılıklar (dependencies)
| Paket | Versiyon |
|---|---|
| expo | ~54.0.33 |
| react | 19.1.0 |
| react-native | 0.81.5 |
| @react-navigation/native | ^7.2.2 |
| @react-navigation/stack | ^7.8.10 |
| expo-status-bar | ~3.0.9 |
| react-native-gesture-handler | ~2.28.0 |
| react-native-safe-area-context | ~5.6.0 |
| react-native-screens | ~4.16.0 |

### devDependencies
| Paket | Versiyon |
|---|---|
| @types/react | ~19.1.0 |
| typescript | ~5.9.2 |

**Not:** `node_modules/` klasörü bu dizinde yok — `npm install` çalıştırılmamış veya paketlenmiş değil.

---

## 3. EKRANLAR VE BİLEŞENLER

### App.tsx — Navigation kökü
- `GestureHandlerRootView` → `NavigationContainer` → `Stack.Navigator`
- Koyu tema (`#0a0a0a` arka plan, `#fff` header)
- 3 ekran kayıtlı:

| Stack adı | Component | Route Params |
|---|---|---|
| `Home` | `HomeScreen` | — |
| `Questions` | `QuestionFlowScreen` | `{ idea: string }` |
| `Spec` | `SpecOutputScreen` | `{ idea: string; qas: QA[] }` |

### index.ts
`registerRootComponent(App)` — standart Expo giriş noktası.

### HomeScreen.tsx
Ham fikir giriş ekranı. Kullanıcı en az 10 karakter yazar, "Yakala →" butonu ile `Questions` ekranına geçer. Karakter sayacı gösterir.

### QuestionFlowScreen.tsx
Soru akış ekranı. `askNextQuestion()` ile sırayla 5 soru alır. İlerleme çubuğu (progress bar) gösterir. Her cevap bir `QA[]` dizisine eklenir. 5. cevaptan sonra `Spec` ekranına yönlendirir. Hata durumunda **"Tekrar Dene"** ve **"👤 Uzman Desteği Al"** (mailto: linki açar) düğmesi gösterir.

### SpecOutputScreen.tsx
`generateSpec()` ile tek sayfalık spec üretir. Basit markdown parser: `## Başlık`, `**kalın**`, boş satır desteği. "Paylaş" butonu (`Share.share`). Hata durumunda yine "Tekrar Dene" + "👤 Uzman Desteği Al" butonu var. Altbilgide "· Yeni Fikir" ile `popToTop()`.

### src/services/claude.ts
**ÖNEMLİ UYARSIZLIK:** Dosyanın adı `claude.ts`, ancak içerik **Gemini API** kullanıyor (`gemini-2.5-flash`, `generativelanguage.googleapis.com`). Çevresel değişken: `EXPO_PUBLIC_GEMINI_API_KEY`.

- `askNextQuestion(idea, previousQAs, questionIndex)` — 5 kategoriden birinde tek soru üretir
- `generateSpec(idea, qas)` — 6 bölümlü Türkçe spec üretir (~300 kelime)
- Her API çağrısı bağımsız (session yok, streaming yok)
- `maxOutputTokens: 512`, `temperature: 0.7`

### `<AuditWidget />` — MEVCUT DEĞİL
Hiçbir dosyada `AuditWidget` import'u veya tanımı bulunamadı. Montaj edilmemiş.

---

## 4. .MD DOSYALARI

### idea.md
"Track A — Dot Capture & Enrich" başlıklı ürün fikir belgesi.
- **Ne anlattığı:** Ham fikri 5 mühendislik sorusuyla zenginleştirip tek sayfalık spec'e dönüştüren bir araç.
- Beş soru kategorisi tanımlanmış: Problem, User, Scope, Constraint, Success Metric.
- Çıktı spec yapısı 6 bölüm.
- Teknik mimari diyagramı "Claude Haiku" kullanılacak olarak çizilmiş — **gerçek kodda Gemini kullanılıyor, tutarsızlık var.**
- `EXPO_PUBLIC_ANTHROPIC_API_KEY` belgelemiş — **gerçek `.env.example` `EXPO_PUBLIC_GEMINI_API_KEY` diyor, tutarsızlık var.**
- Gelecek özellikler: ses girişi, Notion export, fikir geçmişi, "slop check".

### README.md
Proje tanıtım belgesi. "NOKTA — NAIM's Orchestrated Knowledge-To-Artifact" başlıklı.
- İki ayrı demo video linki (YouTube Shorts).
- İki ayrı Expo QR build linki (ilki orijinal, ikincisi "İnsan Desteği Eklendikten Sonra" notu ile).
- `assets/nokta.jpeg` referansı var — **bu dosya `app/assets/` içinde yok** (belirsiz).
- NAIM ekosistemi bağlamı verilmiş.

### FORGE.md — YOK
Bu klasörde `FORGE.md` dosyası bulunmuyor.

---

## 5. EAS.JSON VE APK

### eas.json
```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "preview": {
      "android": { "buildType": "apk", "credentialsSource": "local" }
    },
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  }
}
```
- `preview` profili → `.apk` çıktısı, yerel credentials kullanır.
- `production` profili → `.aab` (Google Play app-bundle).
- iOS profili tanımlanmamış.

### app-release.apk
- **Mevcut:** Evet, kök dizinde (`231118068-fikir-spec/app-release.apk`).
- Hangi EAS profiliyle derlendiği dosya adından kesin belli değil, ancak `preview` profili APK ürettiğine göre bu profille oluşturulmuş olması kuvvetle muhtemel.

### app.json (özet)
- Expo app adı: `"Nokta Dot Capture"`, slug: `"nokta-dot-capture"`
- Bundle ID: `com.nokta.dotcapture` (hem iOS hem Android)
- EAS projectId: `dc91e780-3048-4cad-8c94-982070f57b66`
- Owner: `erenn.altay1`
- `newArchEnabled: true` (React Native yeni mimari aktif)

---

## ŞU AN ELİMDE NE VAR (KANITLI LİSTE)

| # | Varlık | Durum |
|---|---|---|
| 1 | `app-release.apk` | ✅ Kök dizinde mevcut |
| 2 | `eas.json` (preview → APK profili) | ✅ Yapılandırılmış |
| 3 | 3 ekran: Home, QuestionFlow, SpecOutput | ✅ Tam kaynak kodu mevcut |
| 4 | Gemini 2.5 Flash entegrasyonu (`claude.ts`) | ✅ Çalışır görünüyor |
| 5 | 5 soru kategorisi akışı | ✅ Kodda uygulanmış |
| 6 | Spec üretimi + paylaşım | ✅ `Share.share` entegre |
| 7 | Hata durumu: "Uzman Desteği Al" (mailto) | ✅ Her iki hata ekranında mevcut |
| 8 | İlerleme çubuğu (progress bar) | ✅ QuestionFlowScreen'de |
| 9 | `idea.md` (ürün fikir belgesi) | ✅ Detaylı ve kapsamlı |
| 10 | `README.md` (demo linkleri) | ✅ 2 build linki, 2 video linki |
| 11 | `app.json` (EAS proje ID, bundle ID) | ✅ Yapılandırılmış |
| 12 | `.env.example` | ✅ Mevcut (`EXPO_PUBLIC_GEMINI_API_KEY`) |
| 13 | Assets (icon, splash, favicon, adaptive-icon) | ✅ 4 görsel mevcut |

---

## BELİRSİZ / EKSİK GÖRÜNENLER

| # | Konu | Neden belirsiz / eksik |
|---|---|---|
| 1 | **`<AuditWidget />`** | Hiçbir dosyada tanım veya import yok. Bekleniyor muydu belirsiz. |
| 2 | **API: Claude mı Gemini mi?** | `idea.md` "Claude Haiku" ve `EXPO_PUBLIC_ANTHROPIC_API_KEY` diyor; kod ve `.env.example` Gemini kullanıyor. İkisi çelişiyor. |
| 3 | **`assets/nokta.jpeg`** | `README.md` referans veriyor ama dosya `app/assets/` içinde yok. |
| 4 | **`node_modules/`** | Klasörde yok — `npm install` çalıştırılmadan APK'nın nasıl derlendiği belirsiz (muhtemelen EAS cloud build yaptı). |
| 5 | **API anahtarı** | `.env.example` şablonu var, gerçek `.env` dosyası yok (beklenen). APK'da key embedded mi? EAS secrets kullanıldı mı? Belirsiz. |
| 6 | **iOS build** | `eas.json`'da iOS profili yok. iOS için build alınmış mı? Belirsiz. |
| 7 | **`app-release.apk` hangi build'e ait** | EAS `preview` profiliyle mi, manuel `gradlew assembleRelease` ile mi üretildi? İsim standart Android release adı, ama kaynak belirsiz. |
| 8 | **Test** | Hiç test dosyası yok (`__tests__/`, `*.test.tsx`, vs.). |
| 9 | **Gelecek özellikler** (`idea.md`) | Ses girişi, Notion export, fikir geçmişi, slop check — bunların hiçbiri kodda yok. |
| 10 | **`.Rhistory`** | Kök dizinde R dilinden kalma geçmiş dosyası. Alakasız görünüyor ama neden burada olduğu belirsiz. |
