# DECISIONS — Voice · Avatar · Bridge

Karar günlüğü. Bir sonraki cycle'a context.

## D1 — Avatar pipeline: WebView (HTML+Three.js) over native R3F

**Bağlam:** `wass08/r3f-lipsync-tutorial` paterni @react-three/fiber tabanlı; web-first. RN'de aynısını native koşturmak için `expo-gl` + `expo-three` + `three` + `@react-three/fiber/native` gerekir.

**Seçenekler:**

| Yol | Risk | Görsel kalite |
|-----|------|----------------|
| Native R3F | SDK 54 + RN 0.81 + new arch beta'da `morphTargetInfluences` undefined bug'ı (Cycle 2 ROLLBACK) | Yüksek (gerçek 3D RN içinde) |
| WebView HTML+Three.js | Düşük — yalnızca WebView dependency + CDN three.js | Aynı (WebGL = WebGL) |

**Karar:** WebView. Track A "Sadakat" kuralı: en az ek koda en geniş etki. Native R3F'i feda etmek görsel kalite kaybetmez; sadece bundling biraz büyür (CDN dışsallaştırma).

**Risk:** Offline build'de CDN three.js erişimi yok → APK preview'da CDN cache'lenir. Production için bundle'a katmak gerekir (gelecek cycle).

---

## D2 — `expo-av` over `expo-audio` (SDK 54)

**Bağlam:** SDK 54'te `expo-av` deprecated, `expo-audio` yeni. SDK 55'te `expo-av` kaldırılacak.

**Sorun:** [expo issue #33256](https://github.com/expo/expo/issues/33256) — `expo-audio` recording options'ta `isMeteringEnabled` JS layer'a expose edilmemiş. PR #33713 review'da. Türev: dBFS metering yok = visualizer + lipsync = ❌.

**Karar:** `expo-av@~16.0.7` kullan. Gelecek refactor: SDK 55'e geçişte `expo-audio` API'sı tamamlanırsa migrate et. Şimdi pragmatik.

**Trade-off:** Bir sonraki major Expo upgrade'de bu kod kırılacak. Risk kabul.

---

## D3 — Jitsi WebView over Daily / LiveKit / Whereby

**Bağlam:** WebRTC için 4 ana SaaS opsiyonu. Hepsi spec'te serbest.

| Sağlayıcı | Anahtar | RN entegrasyonu | Ekran paylaşımı |
|-----------|---------|-----------------|------------------|
| Jitsi (`meet.jit.si`) | ❌ yok | WebView | ✅ default |
| Daily.co | ✅ API key | `@daily-co/react-native-daily-js` | ✅ |
| LiveKit | ✅ + server | `@livekit/react-native` | ✅ |
| Whereby | ✅ + embed token | WebView | ✅ |

**Karar:** Jitsi. Submission day'de hesap açma + key konfigi + dev build sync kayıp 1-2 saat. Public room key'siz çalışıyor, oda adına student-id ekleyince çakışma yok.

**Trade-off:** Production grade değil (rate limit'siz public meet.jit.si). Demo+sınıf için yeterli; gerçek ürünleştirmede self-hosted Jitsi veya Daily.

---

## D4 — Avatar GLB placeholder bundle stratejisi

**Bağlam:** `require('../../assets/avatar.glb')` Metro bundle aşamasında dosyayı statik resolve etmek istiyor. Dosya yoksa Metro fail. Kullanıcı `.glb`'sini hazır etmeden de uygulama bundle olmalı.

**Seçenekler:**

1. Conditional require (`try/catch`) → Metro static analysis kırılır
2. `Asset.fromURI()` runtime URL → bundle'a katılmıyor, kullanıcı manuel kopyalamalı
3. Placeholder minimal valid GLB → bundle ✓, runtime'da GLTFLoader fail → fallback UI

**Karar:** Seçenek 3. 49 byte'lık minimal valid GLB header + JSON chunk. Metro mutlu, GLTFLoader parse hatası verir, HTML fallback "avatar.glb yok" mesajı gösterir.

---

## D5 — WebView postMessage 55ms throttle

**Bağlam:** `voiceMeter` 60ms update interval'da amplitude push'luyor. WebView postMessage senkron değil — flood olursa native main thread bloklanır.

**Karar:** AvatarStage'de `lastSentRef` ile 55ms coalesce. ~16fps mesaj akışı; avatar tarafı kendi requestAnimationFrame loop'unda smoothing yapıyor zaten. Algılanan kayıp yok.

---

## D6 — Track A seçimi (B / C yerine)

**Bağlam:** Spec 3 track sunuyor:
- A: Sadakat (voice viz + lipsync fidelity)
- B: Çoklu Persona (2+ avatar) → `PERSONAS.md` zorunlu
- C: Otonom Köprü (STUCK auto-detect → auto-call → transcript → next-cycle feed) → `BRIDGE.md` strict

**Karar:** A. Sebep:
- 1 günde teslim → minimum scope
- B → 2 avatar oluşturmak avaturn'da +30dk, ton farklılaştırma TTS work-stream gerekir
- C → otomatik transkripsiyon + feedback pipeline kayda değer agent yatırımı

A'da STUCK auto-detect + bridge button **opsiyonel ekstra** olarak yine yapıldı (StuckTracker var). C'nin `BRIDGE.md`'sini de opsiyonel olarak ekleyebiliriz; A track strict istemiyor.

---

## D7 — STUCK heuristik: ardışık 2 ROLLBACK/FAIL

**Bağlam:** Spec § Phase C: "Forge döngüsünde bir mesele 2 cycle üst üste FAIL veya ROLLBACK çekerse, uygulama içinden uzmana WebRTC görüntülü çağrı açılacak."

**Karar:** `stuckTracker.isStuck()` sliding window tail=2 üzerinde her record'un `ROLLBACK | FAIL | STUCK` olup olmadığını kontrol ediyor. Yine de Track A için tetiklenmesi opsiyonel (manuel call her zaman var). C track'te agent `stuckTracker.append({status: 'ROLLBACK', ...})` çağırınca otomatik banner görünür.

---

## D8 — Folder slug: `voice-avatar-bridge`

**Bağlam:** Önceki hafta slug `audit-forge`'du. Final hafta için yeni slug seçimi gerekti.

**Karar:** `voice-avatar-bridge` — Phase A+B+C odaklarını isimlendiriyor; `final` çok generic, `audit-forge-v2` confusing.

---

## D9 — Upstream TS2698 hatası (3rd party paket)

**Bağlam:** `@xtatistix/mobile-audit@0.1.0` paketi `src/index.ts` üzerinden export ediyor (compiled `.d.ts` yok). İçindeki `AuditSelector.tsx:160` satırında `TS2698: Spread types may only be created from object types` hatası var. Hafta 2'de de mevcuttu, çözüm bizim yetki alanımızda değil.

**Etki:** `npx tsc --noEmit` exit code 2 döner. Ancak Expo dev/preview build Metro bundler kullanıyor (tsc değil) → app çalışır.

**Karar:** `// @ts-nocheck` veya patch-package ile node_modules manipulate etmedik (kalıcı çözüm değil — `npm install` ile kaybolur). Upstream'a issue açılabilir, bu hafta opsiyonel. Spec § 4 ACCEPTANCE tsc geçişini zorunlu kılmıyor.

---

## Açık sorular (gelecek cycle'a)

- [ ] WebView'a CDN Three.js yerine local bundle Three.js inject — offline APK çalışsın
- [ ] Avatar.glb LFS / git-lfs? avaturn export 5-15MB; LFS Track A "sadelik"e ters mi?
- [ ] Latency ölçümü: şu an "ilk amplitude > 0.15" anına kadar. Web Audio API style perf.now() pipeline daha doğru olur.
- [ ] STT entegrasyonu: spec "manuel typing kabul, dikte bonusludur". Whisper API ($) vs cihaz speech recognition (RN için `expo-speech-recognition`). Demo gününde manuel; gelecekte automate.
