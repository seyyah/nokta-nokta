Track: A

# Halka Kapanışı — 221118054

> **Track A — Sadakat.** Voice viz akıcılığı + lipsync senkronu öncelikli.
> Görsel kalite, gecikme, animasyon akıcılığı. "Sade ama kusursuz."

---

## TL;DR

Geliştirici, kendi uygulamasının ilk kullanıcısı oldu:

- **🪞 Phase A — Ayna:** Mikrofona konuşunca ses çubukları zıplar; avaturn.me'den
  üretilen kendi yüzümün avatarı `react-three-fiber` sahnesinde dudak senkronu
  yapar. Mic-to-mouth latency < 200ms.
- **🔨 Phase B — Self-as-User Forge:** Kendi uygulamamı `<AuditWidget />` ile
  audit ettim, raporları Claude Code'a verdim, **3 cycle** koştu (2 COMMIT + 1
  ROLLBACK). Hepsi `FORGE.md`'de.
- **📞 Phase C — Köprü:** Bir cycle bilinçli STUCK'a sürüklendi → uygulama içinden
  Jitsi tabanlı görüntülü çağrı açıldı (video + audio + ekran paylaşımı). Özet
  `BRIDGE.md`'de.

---

## Demo

- **Demo video (≤3dk, Phase A+B+C):** `demo.mp4` (repo kökünde)
- **APK:** `app-release.apk` (gerçek EAS build)
- **Expo QR:** `cd app && npm install && npx expo start`

---

## Drop-in disiplini (Track A kanıtı)

AuditWidget hâlâ tek mount satırı:

```bash
grep -rn 'AuditWidget' app/
# app/_layout.tsx içinde TEK satır döner
```

Mount satırı silinirse 3 ekran (Mirror/Forge/Bridge) bozulmadan çalışır.

---

## Mimari özet

```
app/
├── app/
│   ├── _layout.tsx       Stack + AuditWidget tek mount
│   ├── index.tsx         MirrorScreen — mic + viz + avatar
│   ├── forge.tsx         ForgeScreen  — cycle ledger UI
│   └── bridge.tsx        BridgeScreen — Jitsi launcher
├── assets/
│   └── avatar.glb        ← avaturn.me, kendi yüzüm
└── src/
    ├── voice/
    │   ├── useMicAnalyzer.ts    expo-av + RMS (50Hz)
    │   └── VoiceVisualizer.tsx  24 bar Animated
    ├── avatar/
    │   └── AvatarScene.tsx      r3f Canvas + GLB + morph target
    ├── bridge/
    │   └── JitsiCall.tsx        WebView ile Jitsi gömme
    └── audit/
        └── auditDeps.ts         host boundary (week-2 ile aynı)
```

---

## Latency hedefi

| Adım | Süre |
|---|---|
| Mic → expo-av metering | ~50ms |
| Metering polling | 50ms |
| RMS smoothing (no extra delay) | 0ms |
| useFrame render | 16ms (60fps) |
| **Toplam mic-to-mouth** | **~120ms** |

Spec hedefi 200ms ↓ — kalınan boşluk akıcı görünüm için.

---

## DECISIONS özeti

Tam karar günlüğü `DECISIONS.md`'de. Öne çıkanlar:

1. **Track A seçildi** — drop-in disiplini önceki haftalardaki minimal yaklaşımla
   tutarlı; Track B (2 avatar) ve Track C (auto-stuck detection) tam haftayı
   zorluyor.
2. **expo-av metering** seçildi (FFT yerine) — RN ortamında native FFT pipeline
   karmaşık; metering değeri zaten enerji proxy'si, lipsync için yeterli.
3. **Jitsi WebView** seçildi (LiveKit/Daily SDK yerine) — anahtarsız, hızlı,
   video+audio+share üçü hazır.
4. **avaturn.me .glb** — spec açıkça "kendi yüzün" istiyor; başka jenerator yok.
5. **useGLTF + morphTargetDictionary fallback** — model'da `mouthOpen` varsa o,
   yoksa `jawOpen` ve `viseme_aa` denenir.

---

## Self-check

- [x] `submissions/221118054-halka-kapanisi/` tek seviye
- [x] README ilk satırı `Track: A`
- [x] `app/avatar.glb` mevcut (avaturn export, kendi yüzüm)
- [x] `app-release.apk` build edildi
- [x] `demo.mp4` ≤3dk, Phase A+B+C görünür
- [x] `FORGE.md` ≥3 cycle (2 COMMIT + 1 ROLLBACK)
- [x] `audit-reports/` ≥3 burn-in'li rapor
- [x] Bridge butonu functional (Jitsi)
- [x] DECISIONS.md karar günlüğü
- [x] Root dizine dokunulmadı
