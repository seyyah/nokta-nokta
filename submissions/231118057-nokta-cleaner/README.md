Track: A

# Nokta Cleaner — Audit-Forge Submission

**Öğrenci No:** 231118057
**Slug:** `nokta-cleaner`
**Misyon:** Audit-Forge — müşterinin geliştirici olduğu kapalı döngü
**Hafta 2 Track:** B (Yaratıcılık — müşteri-geliştirici use case'i)
**Hafta 3 Track:** A (Sadakat — Voice viz akıcılığı + lipsync senkronu)

> **Hafta 3 ne ekledi:** Phase A (mic → spectrum + avatar lipsync), Phase B
> (voice → Gemini STT → markdown audit raporu), Phase C (stuck cycle → Jitsi
> görüntülü uzman çağrısı). Hafta 2'nin tek yönlü audit akışı, Hafta 3'te
> sese + 3D avatara + uzmana köprüye genişledi.

---

## Demo

- **APK (Hafta 2):** [`app-release.apk`](./app-release.apk) (~67 MB) — Android, bilinmeyen kaynaklara izin ver
- **APK (Hafta 3):** _TBD — EAS rebuild beklemede (expo-audio, expo-gl, expo-asset, expo-file-system, three, r3f, three-stdlib native deps eklendi)_
- **Web (Hafta 3):** `npx expo start --web` → http://localhost:8081 (Phase A + B + C web'de tam çalışır)
- **Demo video (Hafta 2, ≤60 sn):** [YouTube Shorts — Nokta Cleaner demo](https://www.youtube.com/shorts/u0BDMiCYDMk)
- **Demo video (Hafta 3):** [YouTube Shorts — Hafta 3 demo](https://youtube.com/shorts/0V2jjWwwYuA)

---

## Nedir?

Dağınık notları (WhatsApp dışa aktarma, toplantı notları, bullet karışıklığı) yapıştır → Gemini AI temizler, mükerrer fikirleri birleştirir, kategorize eder → uzman onaylar/reddeder/düzenler → onaylı kartlar panoya / `.md` rapora gider.

Bu submission'da uygulamanın **kendisi** değil, **uygulama + AuditWidget + Voice/Avatar + Expert-Bridge kompozisyonu** ön planda. Müşteri (uygulamayı kullanan) ile geliştirici (kodu yazan) **aynı kişi** oluyor: aksaklığı görüyor, audit ile yakalıyor, **sesli dikte ediyor**, Gemini transcript çıkarıyor, `.md` raporu agent'a yediriyor, fix merge ediliyor; takılırsa **görüntülü çağrı** ile uzmana açılıyor. Detay: [`IDEA.md`](./IDEA.md).

---

## Hafta 3 — Üç Yeni Katman

### Phase A — Voice + Avatar
| Dosya | Rol |
|---|---|
| [`app/src/lib/audioAnalyzer.js`](./app/src/lib/audioAnalyzer.js) | Mic stream → uniform frame `{amplitude, bands[16], ts}`. Web'de gerçek `AnalyserNode` FFT, native'de `expo-audio` metering + sentetik spectrum. |
| [`app/src/components/VoiceVisualizer.js`](./app/src/components/VoiceVisualizer.js) | 16-band aynalı bar viz. Reanimated `withTiming` cubic 70ms. Sessizlikte 260ms'de söner. |
| [`app/src/components/AvatarScene.js`](./app/src/components/AvatarScene.js) | `@react-three/fiber/native` + `expo-gl` + `three`. `.glb` morph target lipsync (jawOpen + viseme blend) ya da proxy stylized head fallback. |
| [`app/src/lib/avatarSource.js`](./app/src/lib/avatarSource.js) | Opsiyonel `.glb` source — placeholder. `avatar.glb` `assets/`'a eklenip uncomment edilince live olur. |
| [`app/src/components/VoiceAvatarScreen.js`](./app/src/components/VoiceAvatarScreen.js) | Avatar + viz + record toggle composite. Header'daki **VOICE** butonundan açılır. |

**Latency hedefi (< 200ms):** Web FFT path ~16ms (60 fps), native metering ~50ms tick. Toplam reaction time ~70ms.

### Phase B — Voice Dictation + Forge Cycles
| Dosya | Rol |
|---|---|
| [`app/src/lib/audioRecorder.js`](./app/src/lib/audioRecorder.js) | One-shot recorder (analyzer'dan ayrı). Web `MediaRecorder` (webm/opus), native `expo-audio` recorder → base64. |
| [`app/src/services/GeminiService.js`](./app/src/services/GeminiService.js) | Mevcut `processNotes`'a ek olarak `transcribeAudio(base64, mime)`. Model fallback: `gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-flash-lite-latest`. |
| [`app/src/components/AuditWidget.js`](./app/src/components/AuditWidget.js) | FAB (sağ-alt ◉) → modal: mic record → transcript → form (title, screen, severity, type) → markdown preview → **Copy markdown** veya **Download .md**. İkili take (sees / wants) desteği. |

**Burn-in screenshot ayrı bir adım:** Brief Hafta 2'deki gibi sarı-kutulu `.png` istiyor; AuditWidget içinde paint tool yok, kullanıcı dışarıdan ekleyip markdown'ı update ediyor.

### Phase C — Expert Bridge
| Dosya | Rol |
|---|---|
| [`app/src/components/ExpertBridge.js`](./app/src/components/ExpertBridge.js) | Header'daki **EXPERT** butonu → modal: room URL üretici (`nokta-stuck-<base36-ts>-<6char-rand>`) + **Open call** (`window.open` web, `Linking.openURL` native) + post-call notes → BRIDGE.md block clipboard. |
| [`BRIDGE.md`](./BRIDGE.md) | Sessions ledger. Her gerçek call sonrası AuditWidget'taki "Copy BRIDGE.md block" çıktısı yapıştırılır. |

**Track A minimum-impl:** stuck **manuel** tetiklenir. Auto-stuck detection heuristic (Track C) bilinçli olarak yapılmadı.

---

## Audit-Forge Akışı (Hafta 3 sürümü)

```
Müşteri ekranda aksaklık görür
        ↓
FAB ◉  →  AuditWidget modal
        ↓
🎙️ "Record" → konuş → Stop
        ↓
Gemini multimodal → transcript
        ↓
Form (title, screen, severity) + ikinci take (wants)
        ↓
audit-reports/0X-*.md   (burn-in PNG ayrı, manuel)
        ↓
Coding agent (Claude Code / Codex CLI) ← rapor input
        ↓
READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT / ROLLBACK
        ↓
FORGE.md ledger güncellenir (cycle no, hash, kg)
        ↓
[stuck mu? 2 cycle FAIL/ROLLBACK?]
        ↓  yes
EXPERT butonu → Jitsi room → ekran paylaşımlı görüşme
        ↓
BRIDGE.md session block yapıştırılır → sonraki cycle'a context
```

---

## Track A Gerekçesi

Hafta 2'de Track B (yaratıcılık) seçildi: müşteri ↔ geliştirici aynı kişi kompozisyonu. Hafta 3'te Track A (Sadakat — sade ama kusursuz) tercih edildi çünkü:

- Phase A'da gerçekten hissedilir fark: 70ms total reaction time + amplitude-driven lipsync, jüri görsel kalite/akıcılık üzerinden puanlıyor.
- Track B (Çoklu Persona) iki tane "junior-sen / senior-sen" varyantı için ek `.glb` ve UX yükü getiriyor — kapsama oranı yüksek ama gösterim değeri Track A'nın altında.
- Track C (Otonom Köprü — auto-stuck heuristic + auto-call) güzel ama "yapay zekanın canının sıkılıp insanı çağırması" gibi bir bar gerektirir; submission scope'unda bilinçli kısıtlama.

---

## Decision Log

| # | Tarih | Karar | Gerekçe |
|---|---|---|---|
| 1 | 2026-05-18 | Mevcut Nokta Cleaner (Track C teslimi) iskeleti baz alındı | Sıfırdan minimal Expo kurmak yerine, gerçek state'i olan bir app'te audit kullanmak Track B'nin "kompozisyon" tezini güçlendiriyor |
| 2 | 2026-05-18 | TypeScript yerine JS bırakıldı | Mevcut kod JS; refactor süresi audit-forge döngüsünden çalardı |
| 3 | 2026-05-20 | 3 audit raporu yazıldı (Phase A, Hafta 2) | HomeEmpty / IdeaCardList / SessionReport — 3 farklı state, 3 farklı şikayet tipi |
| 4 | 2026-05-20 | Rapor #3'e ikinci "rollback adayı" hipotez gömüldü | Challenge zorunlu rollback şartı için bilinçli yüksek riskli hipotez işaretlendi |
| 5 | 2026-05-24 | **Hafta 3 Track A** seçildi | Phase A'nın görsel/lipsync kalitesi puanlamayı dominate ediyor; sade ama kusursuz çizgisi |
| 6 | 2026-05-24 | Avatar `.glb` için **graceful proxy fallback** yazıldı | Dev iteration .glb gelmeden bloklanmasın diye `avatarSource.js` `null` döndürür, `AvatarScene` stylized head render eder |
| 7 | 2026-05-24 | STT için **sadece Gemini multimodal** path (browser Web Speech API'yi reddettim) | Web + native tek code path; mevcut `@google/generative-ai` SDK + key zaten var; webm/opus pratikte kabul ediliyor |
| 8 | 2026-05-24 | Expert bridge için **Jitsi Meet** (Daily/LiveKit değil) | Free, anonymous, no API key, screen-share native; minimum impl için ideal; `meet.jit.si/<random>` URL'i tek satır |
| 9 | 2026-05-24 | `.env.example`'a gerçek API key konmuş, Google leak-detector revoke etti | `.env.example` placeholder'a çekildi, yeni key sadece `.env`'de (gitignored), README'ye uyarı eklendi |
| 10 | 2026-05-24 | AuditWidget'a **Download .md** butonu eklendi (web only) | Sequential dikte sırasında "Copy markdown" clipboard üstüne yazıyordu — kullanıcının kendi widget'ı kendi audit konusu oldu (meta-loop) |

---

## Human Touch Points

(Agent durduğu / yönlendirildiği anlar)

| # | Cycle | An | Niye müdahale |
|---|---|---|---|
| 1 | _Cycle koşma anında doldurulacak_ | — | — |

> Şu ana kadar sayaç: **0** (Hafta 3 forge cycle'ları henüz koşulmadı; aşağıdaki "Teslim Kontrol Listesi" gör).

---

## AI Tool Log

| Cycle | Tool | Model | Niye o tool |
|---|---|---|---|
| Hafta 2 — Phase A audit raporları | Claude Code (CLI) | Opus 4.7 (1M context) | Mevcut JS kodunu doğrudan okuyup satır numarası verebildiği için |
| Hafta 3 — Phase A/B/C tooling kodu | Claude Code (CLI) | Opus 4.7 (1M context) | Multi-file refactor + cross-platform branching (web/native) için 1M context işe yaradı |
| Hafta 3 — Forge cycles | _TBD — cycle koşulurken doldurulacak_ | _TBD_ | _Tercih: Claude Code; rollback için Codex CLI denenecek mi karar verilecek_ |

---

## Teslim Kontrol Listesi

### Hafta 2 (Track B)
- [x] `README.md` ilk satırı (artık `Track: A`, Hafta 3 üzerine yazıldı)
- [x] `app/` — Expo projesi
- [x] `audit-reports/01–03.md` — Hafta 2 burn-in'li raporlar
- [x] `IDEA.md` (Track B zorunlu)
- [x] `app-release.apk` (Hafta 2 versiyonu)
- [x] Demo video (Hafta 2, ≤60 sn)
- [x] Decision log
- [x] Burn-in PNG'leri (`audit-reports/assets/01–03.png`)

### Hafta 3 (Track A)
- [x] Phase A — voice analyzer + visualizer + avatar scene (kod hazır)
- [ ] **`app/assets/avatar.glb`** — avaturn.me'den kendi yüzünden export (kritik: "generic kabul edilmez")
- [x] Phase B — AuditWidget (FAB + voice → Gemini STT → markdown + Download)
- [ ] **3 dikte audit raporu** — `audit-reports/04, 05, 06-*.md` (burn-in PNG'leri ile)
- [ ] **FORGE.md güncellemesi** — Hafta 3 cycles ≥2 success + ≥1 rollback, her cycle 20 dk kutulu
- [x] Phase C — ExpertBridge (Jitsi room + post-call notes block)
- [x] `BRIDGE.md` template seed
- [ ] **BRIDGE.md ilk gerçek session** — sınıf arkadaşıyla 60+ sn ekran-paylaşımlı call
- [ ] **APK rebuild** — Hafta 3 native deps (expo-audio/gl/asset/file-system) ile EAS build
- [ ] **3 dk demo video** — Phase A + B + C tek video
- [x] PERSONAS.md (gereksiz — Track A seçildi)

---

## Yerel Kurulum

```bash
cd app
npm install
# .env oluştur: cp .env.example .env, sonra EXPO_PUBLIC_GEMINI_API_KEY'i kendi key'in ile değiştir
npx expo start --web        # Web — Phase A/B/C tümü çalışır
npx expo start --android    # EAS dev build cihazda (mic + GL için Expo Go yetmez)
```

**Gemini API key:** [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (ücretsiz). Gerçek key'i sadece `.env`'e koy, `.env.example` placeholder olarak kalsın — leak detector revoke ediyor.

---

## Teknoloji

**Core (Hafta 2'den)**
- React Native + Expo SDK 54
- NativeWind v4 (Tailwind RN)
- Google Gemini AI — model fallback zinciri: `gemini-flash-lite-latest` → `gemini-2.5-flash` → `gemini-2.0-flash`
- expo-clipboard
- localStorage (oturum geçmişi, son 5 oturum)

**Hafta 3 eklemeleri**
- **AuditWidget:** custom (bu repo'da, `app/src/components/AuditWidget.js`) — eski README'deki `@xtatistix/mobile-audit` referansı eski plandı, in-tree implementation tercih edildi
- **Voice/audio:** `expo-audio` (recording + metering), Web `AnalyserNode` (FFT), `MediaRecorder` (webm/opus)
- **3D avatar:** `three` + `@react-three/fiber` + `three-stdlib` + `expo-gl` + `expo-asset`
- **STT:** Gemini multimodal `audio/webm` (web), `audio/mp4` (native) → text
- **Expert bridge:** Jitsi Meet (`meet.jit.si/<random>`) via `Linking.openURL` / `window.open` — no API key
- **File save:** Web `Blob` + `URL.createObjectURL` download; native `expo-file-system` (henüz cycle koşulmadı)

**Tasarım kuralı:** Phase A/B/C kodu Hafta 2'nin akışına sıfır invasive — `mode` state, opsiyonel FAB'lar, `auditOpen`/`expertOpen` modal'ları. Mevcut input → analyze → cards → report akışı tek satır değişmedi.
