Track: A

# 231118098-tohum — NOKTA Halka Kapanışı

> 🪞 Kendi avatarın seninle konuşur · 🎙️ sesin görselleşir · 🛠️ kendi raporlarınla tamir edersin · 📞 sıkıştığında insan gelir

NOKTA serisinin **3. ve final** submission'ı. Hafta 1'de fikir mükemmelleştirme, Hafta 2'de audit-forge döngüsü kurulmuştu — bu hafta halkayı kapatıyoruz: **Ayna + Kendi Müşterin + Köprü** katmanlarını mevcut tohum app'inin üstüne ekliyoruz.

---

## Track A — Sadakat ("Sade ama kusursuz")

Voice viz akıcılığı + lipsync senkronu öncelikli. Track A çizgisi:
- Avatar **drop-in** mount — kaldırıldığında app çalışır
- Manuel "Uzmana Bağlan" butonu (agent auto-trigger yok — o Track C)
- Tek dosya yerine ayrı `hook`, `component`, `screen` yapısı (sadelik = az kuplaj)

`grep -r '<AvatarStage' app/src/screens/` tek satır göstermeli; aynı disiplin `<JitsiBridge>` için de.

## Phase A — Ayna (Voice + Avatar)

- **`expo-av`** ile mikrofon yakalama, **FFT/RMS** üzerinden bar/dalga animasyonu
- **`react-three-fiber`** ile `avatar.glb` (avaturn.me'den export edilmiş kendi yüzüm) sahneye mount
- **Viseme pipeline** (wass08/r3f-lipsync-tutorial ref) ile sesin enerjisinden ağız şekli üretimi
- **Hedef:** mic → mouth latency < 200ms, ekranda canlı ms göstergesi

## Phase B — Kendi Müşterin (Self-as-User Forge)

- `<AuditWidget />` Hafta 2'den itibaren `App.tsx`'te mount (drop-in)
- Sesli dikte ile audit rapor üretimi (voice → STT → markdown)
- Coding agent (Claude Code Opus 4.7) ile forge döngüsü: READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT/ROLLBACK
- Hafta 3: 4 yeni cycle (3 COMMIT + 1 ROLLBACK); toplam 9 cycle (7 COMMIT + 2 ROLLBACK); `FORGE.md`'ye log

## Phase C — Köprü (HITL Video Bridge)

- Uygulama içinden **"Uzmana Bağlan"** butonu → **Jitsi Meet** odası açar
- Demo videoda ≥60 sn ekran paylaşımlı sınıf arkadaşıyla görüşme
- Görüşme özeti `BRIDGE.md`'de (Track A'da strict format zorunlu değil, kısa özet yeterli)

## Stack

**Hafta 2'den devam:**
- React Native + Expo SDK 54, TypeScript
- @react-navigation/native (Stack + Bottom Tabs)
- @xtatistix/mobile-audit (drop-in widget)
- @react-native-async-storage/async-storage

**Bu hafta yeni:**
- `expo-av` — mic capture + FFT
- `three` + `@react-three/fiber` + `expo-gl` — 3D avatar sahnesi
- `expo-speech-recognition` — STT sesli dikte
- `react-native-webview` + Jitsi Meet URL — bridge call

## Ekran Yapısı

| Ekran | Kaynak | Görev |
|---|---|---|
| Home | Hafta 2 | Fikir listesi |
| Add Idea | Hafta 2 | Yeni fikir formu |
| Idea Detail | Hafta 2 | Fikir düzenle/sil |
| Profile | Hafta 2 | İstatistik dashboard |
| **Mirror** | **Bu hafta** | Voice viz + avatar lipsync (Phase A) |
| **Bridge** | **Bu hafta** | Uzman Jitsi çağrısı (Phase C) |

## Build & Demo

- **APK:** `app-release.apk`
- **Expo Build:** https://expo.dev/accounts/aleyna1955/projects/nokta-audit-forge/builds/b3d94ea0-bd7e-4cb7-afcf-f7b28b79f593
- **Demo video (3 dk, Phase A+B+C):** `demo.mp4`

## Decision Log (özet)

Tam liste: [`DECISIONS.md`](./DECISIONS.md). AI-DLC çerçevesinde Visioner/Harness/Guardian/Critical Thinker/System Thinker/Teacher rolleri ile bağlantılı her karar.

| Karar | Gerekçe |
|---|---|
| Track A | Sadakat çizgisi, Phase A 30 puanı + sadelik bonusu |
| Önceki tohum app'inin üstüne devam | Hocanın "önceki haftadan devam" yönergesi; AuditWidget zaten kurulu |
| Jitsi (Daily.co/LiveKit yerine) | Hesapsız oda açma, en hızlı kurulum |
| Ayrı `hook`/`component`/`screen` dosyaları | Track A sadelik = az kuplaj; monolitik App.tsx anti-pattern |
| AI-DLC harness pattern | Hocanın paylaştığı AWS AI-DLC çerçevesi; jüri farkındalığı + +25 çılgınlık bonus argümanı |

## Human Touch Points

| # | Nerede | Kim | Ne |
|---|---|---|---|
| 1 | Track + scope kararı | Aleyna | Visioner rolü |
| 2 | Avatar selfie export | Aleyna | avaturn.me'den `.glb` |
| 3 | Forge cycle review | Aleyna | Critical Thinker — Claude önerilerini onay/red |
| 4 | Sesli audit dikte | Aleyna | Phase B veri girişi |
| 5 | Uzman Jitsi çağrısı | Aleyna + sınıf arkadaşı | Phase C bridge |
| 6 | Demo video kaydı | Aleyna | Final sunum |

## AI Tools

- **Claude Opus 4.7 (1M context) via Claude Code** — kod üretimi, forge cycle, dosya orchestration
- **AI-DLC pattern** (AWS) — plan-clarify-implement döngüsü, harness rolü disiplini

## Dosya Yapısı

```
submissions/231118098-tohum/
├── README.md              # Bu dosya (Track: A satır 1)
├── DECISIONS.md           # AI-DLC harness kararları (6 rol)
├── FORGE.md               # Cycle ledger (5 Hafta 2 + 4 Hafta 3 = 9 cycle)
├── BRIDGE.md              # Phase C görüşme özeti
├── demo.mp4               # ≤3dk Phase A+B+C
├── app-release.apk        # Halka Kapanışı build
├── audit-reports/         # 6 .md rapor (3 Hafta 2 + 3 Hafta 3)
│   ├── report-home-screen.md
│   ├── report-add-idea-screen.md
│   ├── report-profile-screen.md
│   ├── report-mirror-mic-permission.md      # Hafta 3 — sesli dikte
│   ├── report-mirror-avatar-lipsync-lag.md  # Hafta 3 — sesli dikte
│   └── report-bridge-room-collision.md      # Hafta 3 — sesli dikte
└── app/                   # Expo SDK 54 + TS proje
    ├── App.tsx
    ├── src/
    │   ├── screens/       # Home/AddIdea/IdeaDetail/Profile + Mirror + Bridge
    │   ├── components/    # AvatarStage, Waveform
    │   ├── hooks/         # useVoiceMeter
    │   ├── utils/         # ideaStorage, auditStorage
    │   └── types/
    └── assets/
        └── avatar.glb     # avaturn.me — kendi yüzüm
```

---

**231118098** · Track A — Sadakat · NOKTA Halka Kapanışı · Mobil Ders Ödevi
