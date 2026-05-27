# DECISIONS — Karar Günlüğü

**Submission:** 231118057-nokta-cleaner
**Hafta 2 Track:** B (Yaratıcılık) · **Hafta 3 Track:** A (Sadakat — Voice viz akıcılığı + lipsync senkronu)

> Her satır geri dönülemez bir yol ayrımını, gerekçesiyle birlikte kaydeder.
> Kararlar kronolojik sıradadır; sonradan değişen kararlar üstü çizilmez, yeni satırla supersede edilir.

---

## Hafta 2 Kararları

| # | Tarih | Karar | Gerekçe | Alternatif (reddedilen) |
|---|---|---|---|---|
| 1 | 2026-05-18 | Mevcut Nokta Cleaner iskeleti baz alındı | Sıfırdan minimal Expo kurmak yerine, gerçek state'i olan bir app'te audit kullanmak Track B'nin "kompozisyon" tezini güçlendiriyor | Boş Expo template |
| 2 | 2026-05-18 | TypeScript yerine JavaScript bırakıldı | Mevcut kod JS; TS refactor süresi audit-forge döngüsünden çalardı — deadline > type-safety tradeoff'u | TS migration |
| 3 | 2026-05-20 | 3 audit raporu yazıldı (HomeEmpty, IdeaCardList, SessionReport) | 3 farklı state × 3 farklı şikayet tipi → forge cycle çeşitliliği için minimum yeterli set | 1 rapor (yetersiz) veya 5+ rapor (zaman riski) |
| 4 | 2026-05-20 | Rapor #3'e bilinçli rollback-adayı hipotez gömüldü | Challenge zorunlu rollback şartı: `expo-sharing` + `expo-file-system` ile gerçek export — native dep chain fail riski yüksek, rollback organik olur | Safe-only hipotezler (rollback şansı düşük) |

---

## Hafta 3 Kararları

| # | Tarih | Karar | Gerekçe | Alternatif (reddedilen) |
|---|---|---|---|---|
| 5 | 2026-05-24 | Track A (Sadakat — sade ama kusursuz) seçildi | Phase A'nın görsel/lipsync kalitesi puanlamayı dominate ediyor; jüri akıcılık üzerinden puanlıyor | Track B (Çoklu Persona: ek `.glb` + UX yükü), Track C (Otonom Köprü: auto-stuck heuristic scope riski) |
| 6 | 2026-05-24 | Avatar `.glb` için graceful proxy fallback | `avatarSource.js` null döndürür → `AvatarScene` stylized head render eder; dev iteration `.glb` gelmeden bloklanmasın | `.glb` hard-require (geliştirme bloke olur) |
| 7 | 2026-05-24 | STT için sadece Gemini multimodal path | Web + native tek code path; mevcut `@google/generative-ai` SDK + key zaten var; webm/opus kabul ediliyor | Web Speech API (sadece browser, native'de ayrı path gerekir) |
| 8 | 2026-05-24 | Expert bridge için Jitsi Meet | Free, anonymous, no API key, screen-share native; `meet.jit.si/<random>` URL'i tek satır — minimum impl için ideal | Daily.co (API key gerek), LiveKit (self-host gerek) |
| 9 | 2026-05-24 | `.env.example` placeholder'a çekildi | Google leak-detector gerçek API key'i revoke etti; yeni key sadece `.env`'de (gitignored) | API key'i `.env.example`'da bırakmak (güvenlik riski) |
| 10 | 2026-05-24 | AuditWidget'a Download .md butonu eklendi (web only) | Sequential dikte sırasında "Copy markdown" clipboard üstüne yazıyordu — kendi widget'ı kendi audit konusu oldu (meta-loop) | Sadece clipboard copy (veri kaybı riski) |

---

## Genel Mimari Kararları

| # | Karar | Gerekçe |
|---|---|---|
| A1 | Phase A/B/C kodu Hafta 2 akışına sıfır invasive | `mode` state, opsiyonel FAB'lar, `auditOpen`/`expertOpen` modal'ları — mevcut input → analyze → cards → report akışı tek satır değişmedi |
| A2 | audioAnalyzer web/native ayrımı tek dosyada | Platform detect (`typeof window`) ile branching; iki ayrı dosya yerine tek import noktası — consumer code `if (Platform.OS)` yazmak zorunda kalmıyor |
| A3 | Gemini model fallback zinciri: `gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-flash-lite-latest` | Ücretsiz tier rate-limit'e takılınca otomatik downgrade; kullanıcı farkında olmadan devam ediyor |
