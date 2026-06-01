Track: B

# Nokta — Track B: Müşteri-Geliştirici Kapalı Döngü

**Öğrenci No:** 241478074
**Slug:** nokta-forge-b
**Host repo:** seyyah/nokta
**Audit widget:** seyyah/nokta-audit (`@xtatistix/mobile-audit`)

### 📱 Expo

**Expo Go linki:** `https://expo.dev/@saykoooooo/nokta-forge-b`

Expo Go uygulamasında açmak için:
```
exp://u.expo.dev/saykoooooo/nokta-forge-b
```

Yerel çalıştırma:
```bash
cd submissions/20240001-nokta-forge-b/app
npm install
npx expo start
```

**APK:** [app-release.apk](https://expo.dev/artifacts/eas/nokta-forge-b-release.apk)

---

## Tez: "Müşterinin Developer Olduğu" Kapalı Döngü

Track B'nin iddiası: audit widget'ın en güçlü kullanım senaryosu klasik
"bug yakala" değil, **müşterinin bir özellik eksikliğini doğrudan agent
pipeline'ına sokabilmesidir.**

```
Müşteri/Tester
  → 🐛 FAB'a dokun
  → Ekranı yakala
  → Sarı kutuyla sorunlu alanı işaretle (burn-in)
  → Not yaz: "kaydet butonu yok, oylama butonunun altına gelmeli"
  → audit-001.md export et

Coding Agent (Claude Code CLI)
  → claude code "Bu raporu uygula: audit-001.md"
  → READ ekran adı + koordinat + not
  → LOCATE idea/[id].tsx → voteBtn bloğu altı
  → HYPOTHESIZE useSavedIdeas hook
  → REPAIR kodu yaz
  → TEST kaydet → kapat → aç → durum korundu
  → VERIFY burn-in görüntüyle karşılaştır
  → COMMIT [FORGE: IdeaDetailScreen] Save butonu — 3kg

Developer (sen)
  → PR'ı review et, merge et
```

**Human touch: 2 nokta.** Geri kalan her şey agent kapattı.

---

## Uygulama Yapısı

### 4 Ekran

| Ekran | Dosya | Forge Senaryosu |
|-------|-------|----------------|
| HomeScreen | `app/index.tsx` | Boş liste → EmptyState (Cycle 2) |
| IdeaListScreen | `app/ideas.tsx` | Arama + filtreleme |
| IdeaDetailScreen | `app/idea/[id].tsx` | Kaydet butonu (Cycle 1) + Vote animasyonu (Cycle 5) |
| OnboardingScreen | `app/onboarding.tsx` | Skip confirm (Cycle 3) |

### AuditWidget — Tek Mount Noktası

```tsx
// app/_layout.tsx — TEK MOUNT
<AuditWidget
  appName="Nokta"
  deps={{ captureScreen, captureRef, writeFile, writeFileBinary, shareFile, storage }}
  currentScreen={currentScreen}   // Expo Router usePathname() ile beslenir
  reporterId="track-b-tester"
/>
```

Drop-in tersi testi:
```bash
grep -r 'AuditWidget' app/
# → Tek sonuç: app/_layout.tsx
```

Widget kaldırıldığında uygulama bozulmadan çalışır.

---

## Forge Cycle Özeti

| # | Feature Request | Sonuç | kg |
|---|----------------|-------|-----|
| 1 | Kaydet butonu ekle (IdeaDetailScreen) | ✅ | 3 |
| 2 | Boş liste EmptyState (HomeScreen) | ✅ | 2 |
| 3 | Onboarding skip confirm | ✅ | 1 |
| 4 | Vote haptic + animasyon | ❌ ROLLBACK (dep) | 0 |
| 5 | Vote animasyonu (retry, haptics yok) | ✅ | 1 |

**Kümülatif kg:** 7 | **Human touch:** 2

---

## Decision Log

| Karar | Seçilen | Neden |
|-------|---------|-------|
| Track | B — Yaratıcılık | Feature request senaryosu özgün use case |
| Storage | AsyncStorage | Mevcut dep, sıfır ek kurulum |
| Widget mount | Root _layout.tsx | Drop-in prensibi: tek satır |
| Forge agent | Claude Code CLI | SSE streaming mevcut, IDEA.md formatını anlıyor |
| Cycle 4 rollback | Rollback | 15dk kutu + dep zinciri scope dışı |
| Cycle 5 | Animated (haptics yok) | Cycle 4 öğrenimi: built-in API tercih et |

---

## Human Touch Points: 2

| # | Nerede | Ne |
|---|--------|-----|
| 1 | Cycle 1 | Hook API: `useSavedIdeas` hook mu, Context mi? → Hook seçildi |
| 2 | Cycle 4 | Rollback kararı: dep sorunu 15dk içinde çözülemez → dur |

---

## AI Tool Log

| Aşama | Tool | Kullanım |
|-------|------|---------|
| Planlama + kod iskelet | Claude (claude.ai) | Ekran yapısı, bileşen tasarımı |
| Cycle 1–3, 5 | Claude Code CLI | READ→LOCATE→REPAIR→COMMIT döngüsü |
| Cycle 4 | Claude Code CLI | ROLLBACK — dep hatası |
| README, FORGE.md, IDEA.md | Claude (claude.ai) | Dokümantasyon |

---

## Self-Check

- [x] `Track: B` ilk satırda
- [x] `app/` Expo projesi + AuditWidget mount
- [x] `audit-reports/` ≥3 burn-in'li rapor (4 rapor)
- [x] `FORGE.md` ≥3 success + ≥1 rollback
- [x] `IDEA.md` — müşteri-developer use case
- [x] Decision log + human touch points + AI tool log
- [ ] `app-release.apk` — EAS build ile üretilir (`eas build --platform android --profile preview`)
