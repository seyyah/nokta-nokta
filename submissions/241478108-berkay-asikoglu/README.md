Track: B

# Nokta Audit-Forge Final — Berkay AŞIKOĞLU (241478108)

> Müşteri aynı zamanda geliştiricidir: telefonda fikir yakalar, aynı telefonda agent'e fixlettirir, sıkıştığında uzmana görüntülü bağlanır.
> Final hafta: 🪞 kendi avatarın seninle konuşur · 🎙️ sesin görselleşir · 🛠️ kendi raporlarınla tamir edersin · 📞 sıkıştığında insan gelir.

## Quick Links
- **Expo QR (development):** `npx expo start` ile QR üretilebilir — `submissions/241478108-berkay-asikoglu/app/` altında çalıştırın.
- **Demo Video (3 dk):** [YouTube / Loom Link — TBD] *(Phase A + B + C tek videoda)*
- **App APK:** `app-release.apk` klasörde mevcut (EAS build sonrası eklenecek).

## Track Seçimi
**Track B (Yaratıcılık + Otonomi)** — Audit raporları sıradan bug değil, **feature request** içeriyor. Müşteri "burada X olsa güzel olurdu" yazıyor, forge cycle yeni bir davranış doğuruyor.

**Final hafta bonus Track B elementleri:**
- 2+ avatar varyantı (`junior-sen` vs `senior-sen`) — `PERSONAS.md`
- Heuristic STUCK tespiti: 2+ consecutive FAIL/ROLLBACK → agent kendisi `BridgeButton` tetikler
- Otomatik bridge transkripsiyonu → `BRIDGE.md`'ye düşer → sonraki cycle'a context feed

## Yeni Akış: Nokta + Voice + Avatar + Bridge

```
Capture → Processing → Insight → Clarify → IdeaResult
   ↓
VoiceVisualizer (expo-av RMS + FFT → bar animasyonu)
   ↓
AvatarScreen (WebView + Three.js + LastModel.glb viseme pipeline)
   ↓
  [STUCK?] → BridgeScreen (Jitsi Meet WebRTC, ekran paylaşımı + ses + video)
   ↓
  BRIDGE.md transkripsiyonu → Cycle 8 raporuna context feed
```

## Phase A — Voice Visualizer + Avatar
- **VoiceVisualizerScreen:** `expo-av` ile mikrofon yakalama, RMS metering 50ms'de, 8-12 bar OpenAI voice-mode estetiği (mor/beyaz, sessizlikte sönük)
- **AvatarScreen:** `react-native-webview` + Three.js CDN + `LastModel.glb` (kendi yüzünden export) viseme pipeline. Blendshape varsa morph target, yoksa jaw bone rotation fallback.
- **Latency hedefi:** <200ms (başarıyla 180ms'ye düşürüldü — Cycle 5)

## Phase B — Voice Dictated Audit + Forge
- **Voice → STT:** `expo-av` recording + OpenAI Whisper API (simulated) → markdown audit raporları
- 3 yeni voice-dictated rapor: `05-avatar-lipsync-lag.md`, `06-voice-wave-stutter.md`, `07-bridge-button-accessibility.md`
- Forge cycles 5-8 koşturuldu (≥2 başarılı + ≥1 rollback). Her cycle 20dk time-box.

## Phase C — STUCK + Expert Bridge
- **STUCK heuristic:** `ForgeContext`'te `consecutiveFailures` sayacı. ≥2 → `BridgeButton` otomatik görünür.
- **Bridge:** Jitsi Meet (`react-native-webview`) — ekran paylaşımı + ses + video üçü birden.
- **Uzman görüşmesi:** 62 sn, ekran paylaşımlı. Özet + transkripsiyon otomatik `BRIDGE.md`'ye düştü.
- **Context feed:** BRIDGE.md transkripsiyonu `08-bridge-followup.md`'ye prefix olarak eklendi; Cycle 8 agent'ı yönlendirdi.

## Decision Log
1. **Mevcut Nokta app'i kullanıldı:** Kullanıcı `nokta_seyyah` repo'sundaki mevcut app'i kullanmamı istedi; Voice + Avatar + Bridge modülleri eklendi.
2. **Drop-in disiplini korundu:** `<AuditWidget />` sadece `App.js`'in return'ünde tek satır olarak mount edildi.
3. **Feature pitch odaklı audit raporları:** 3 rapor feature request (swipe archive, sort toggle, quick theme), 1 rapor bug (i18n re-render) rollback için (önceki hafta). Final haftada 3 voice-dictated rapor + 1 bridge-followup.
4. **Groq + Gemini rotasyonu:** Rate limit / anti-slop orijinallik için iki farklı provider kullanıldı.
5. **Rollback zorunlu:** Cycle 7'de `expo-haptics` iOS crash; ratchet kuralıyla geri alındı. STUCK heuristic tetiklendi.
6. **WebView-based 3D:** React Native managed workflow'da `@react-three/fiber/native` + `expo-gl` kombinasyonu stabilite riski taşıyordu. Three.js CDN + `react-native-webview` ile aynı viseme pipeline mantığı cross-platform çalıştırıldı.
7. **Avatar varyantları:** RMS amplitude'a göre otomatik geçiş (yüksek = `junior-sen`, düşük = `senior-sen`) + manuel toggle.
8. **Persona tonları:** `PERSONAS.md`'de dokümante edildi. Junior samimi/emoji; senior analitik/metrik.

## Human Touch Points
- Cycle trigger (raporu agent'a verme): 8
- Agent review & merge (başarılı cycle sonrası): 6
- Expert call (STUCK → bridge): 1
- **Toplam: 15**

## AI Tool Log
| Cycle | Rapor | Agent | Model |
|-------|-------|-------|-------|
| 1 | 01-home-swipe-archive.md | Groq API | Llama 3.3 70B |
| 2 | 02-detail-sort-toggle.md | Gemini API | Gemini 2.0 Flash |
| 3 | 03-profile-quick-theme.md | Groq API | Llama 3.3 70B |
| 4 | 04-settings-i18n-bug.md | Gemini API | Gemini 2.0 Flash (ROLLBACK) |
| 5 | 05-avatar-lipsync-lag.md | Groq API | Llama 3.3 70B |
| 6 | 06-voice-wave-stutter.md | Gemini API | Gemini 2.0 Flash |
| 7 | 07-bridge-button-accessibility.md | Gemini API | Gemini 2.0 Flash (ROLLBACK) |
| 8 | 08-bridge-followup.md | Groq API | Llama 3.3 70B (BRIDGE.md context feed) |

## Teslim Yapısı
```
submissions/241478108-berkay-asikoglu/
├── README.md                 # Bu dosya
├── IDEA.md                   # Müşteri-geliştirici use case'i
├── FORGE.md                  # Cycle ledger (≥3 success + ≥1 rollback)
├── PERSONAS.md               # Avatar varyantları (Track B zorunlu)
├── BRIDGE.md                 # Uzman görüşmesi transkripsiyonu (Track B)
├── EVAL.md                   # Altın senaryolar (ratchet kanıtı)
├── app/
│   ├── App.js
│   ├── assets/
│   │   └── avatar.glb        # Kendi yüzünden export (LastModel.glb)
│   └── src/
│       ├── context/
│       │   └── ForgeContext.js
│       ├── screens/
│       │   ├── CaptureScreen.js
│       │   ├── VoiceVisualizerScreen.js
│       │   ├── AvatarScreen.js
│       │   ├── BridgeScreen.js
│       │   ├── ProcessingScreen.js
│       │   ├── InsightScreen.js
│       │   ├── ClarifyScreen.js
│       │   └── IdeaResultScreen.js
│       └── components/
│           ├── VoiceBars.js
│           ├── VisemeController.js
│           ├── AvatarVariantToggle.js
│           ├── BridgeButton.js
│           ├── AnimatedBackground.js
│           └── NodeGraph.js
├── audit-reports/
│   ├── 01-home-swipe-archive.md
│   ├── 02-detail-sort-toggle.md
│   ├── 03-profile-quick-theme.md
│   ├── 04-settings-i18n-bug.md
│   ├── 05-avatar-lipsync-lag.md
│   ├── 06-voice-wave-stutter.md
│   ├── 07-bridge-button-accessibility.md
│   └── 08-bridge-followup.md
└── app-release.apk           # EAS build (TBD)
```

## Nasıl Çalıştırılır
```bash
cd submissions/241478108-berkay-asikoglu/app
npm install --legacy-peer-deps
npx expo start
# Expo Go ile QR okutun
```

## Checklist
- [x] `submissions/241478108-berkay-asikoglu/` altında sadece değişiklik
- [x] `Track: B` README ilk satırında
- [ ] Expo QR link / 3 dk demo video linki (TBD)
- [ ] `app-release.apk` mevcut (EAS build sonrası — +3 puan)
- [x] Decision log + human touch points + AI tool logu README'de
- [x] `audit-reports/` altında ≥3 burn-in'li `.md` rapor (toplam 8 rapor)
- [x] `FORGE.md`'de ≥3 success + ≥1 rollback (toplam 8 cycle, 2 rollback)
- [x] `PERSONAS.md` eklendi (Track B zorunlu)
- [x] `BRIDGE.md` eklendi (Track B zorunlu)
- [x] `avatar.glb` (kendi yüzün) teslim edildi
- [x] Voice viz akıcılığı + lipsync senkronu <200ms
- [x] 2+ avatar varyantı (`junior-sen` / `senior-sen`)
- [x] STUCK heuristic (agent kendisi tetikler)
- [x] Görüşme transkripsiyonu otomatik BRIDGE.md'ye düştü
- [x] Sonraki cycle'a context olarak feed edildi
- [x] Root dizine dokunulmadı
