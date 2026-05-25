# DECISIONS.md — Karar Günlüğü

> Student 221118054 · Halka Kapanışı submission
>
> Engineering trace ekseni: her anlamlı tasarım kararı tarih + gerekçe ile.

---

## D-01 · 2026-05-22 · Track A seçildi

**Bağlam:** 3 track seçenek (A: sadakat, B: 2-persona, C: otonom köprü).
**Karar:** Track A.
**Gerekçe:** Drop-in primitive disiplini önceki haftalardaki minimal yaklaşımla
tutarlı. Track B 2+ avatar varyantı ve farklı tonlu rapor pipeline'ı ister —
1 haftalık zaman dilimi avatar fine-tuning + ton mühendisliği için yetersiz.
Track C STUCK auto-detect heuristiği ve agent-driven call flow ekstra mimari
katmanı ister.

---

## D-02 · 2026-05-22 · expo-av metering, FFT yerine

**Bağlam:** Voice viz için frekans-domain (FFT) veya enerji-domain (RMS) seçimi.
**Karar:** `Audio.Recording.getStatusAsync().metering` (dB cinsinden enerji).
**Gerekçe:** RN'de native FFT pipeline kurmak `react-native-audio-analyzer`
gibi paketler gerektirir — Expo Go ile uyumsuz. Metering değeri zaten dB
cinsinden, lipsync için yeterli proxy. Spec FFT/RMS "veya" diyor — şartı
karşılıyor.

---

## D-03 · 2026-05-22 · 50ms polling + exponential smoothing

**Bağlam:** Latency hedefi 200ms; polling sıklığı ve UI jitter denge.
**Karar:** 50ms (20Hz) polling + `smooth = prev*0.6 + raw*0.4` exponential.
**Gerekçe:** 50ms tek başına çıplak RMS'i UI'a basınca bar'lar titriyor.
Smoothing factor 0.4 ile latency penaltisi ~20ms; toplam mic-to-mouth budget
hâlâ ~120ms (200ms ↓).

---

## D-04 · 2026-05-22 · react-three-fiber, react-native-skia yerine

**Bağlam:** 3D avatar için RN'de 2 ana yol: r3f (Three.js wrapper) veya
Skia ile manuel mesh.
**Karar:** `@react-three/fiber` + `@react-three/drei` + `expo-gl`.
**Gerekçe:** Spec referansı `wass08/r3f-lipsync-tutorial` zaten r3f. Avaturn
.glb dosyaları gltf-loader ile native uyumlu; morph target API'si standart.
Skia ile manual mesh çok daha düşük seviye.

---

## D-05 · 2026-05-22 · Morph target fallback chain

**Bağlam:** Avaturn modelleri her zaman aynı isimde morph target üretmez.
**Karar:** Tarama: `mouthOpen → jawOpen → viseme_aa → viseme_O → A`.
**Gerekçe:** İlk eşleşeni kullan, böylece avatar tipine bağlı değil.
Hiç eşleşme yoksa ağız hareketi yok; fallback hint metni "🎙️ konuşuluyor"
gösterilir.

---

## D-06 · 2026-05-22 · Jitsi WebView, LiveKit/Daily SDK yerine

**Bağlam:** WebRTC için 4 seçenek (Jitsi, LiveKit, Daily, Whereby).
**Karar:** `meet.jit.si` + react-native-webview.
**Gerekçe:** (1) Anahtar/hesap gerektirmez. (2) Video+audio+share üçü hazır,
Jitsi tarafından sağlanır. (3) Native SDK entegrasyonu (LiveKit) build
süresi + permission complexity ekliyor. (4) Spec "WebRTC serbest" diyor;
WebView bir RTC pipeline'a giden meşru yol.

---

## D-07 · 2026-05-22 · Stack navigator, bottom-tab yerine

**Bağlam:** 3 ekran (Mirror, Forge, Bridge) arası nav.
**Karar:** Expo Router Stack; Mirror'da alt nav butonları.
**Gerekçe:** Bridge modal olarak açılınca (presentation:'modal') call UI
tam ekran yaşıyor — tab bar görüşme alanını yer. Mirror primary; Forge/Bridge
secondary nav.

---

## D-08 · 2026-05-22 · 4 kasıtlı UX bug'ı koduna gömme yok

**Bağlam:** Önceki haftada `BUG-N` yorumlarıyla kasıtlı bug'lar gömdüm.
**Karar:** Bu hafta kasıtlı bug yok — gerçek bug'larla çalış.
**Gerekçe:** Spec "FORGE.md cycle'ları gerçek olmak zorunda — sentetik
diff/timestamp üretme". Voice viz idle pulse, avatar morph clamp, mic
permission error path zaten gerçek UX boşlukları; bunlarla cycle koşturmak
sentetik olmaz.

---

## D-09 · 2026-05-22 · Bridge audit dictation: opsiyonel

**Bağlam:** Spec "raporları sesli dikte et (voice → STT → markdown)" diyor;
"manuel typing kabul, ama dikte bonusludur".
**Karar:** Bu submission'da manuel typing (klavye ile). STT integration
sonraki cycle.
**Gerekçe:** STT için `expo-speech-recognition` veya 3rd party API.
Track A focus voice viz + lipsync kalitesi; STT bonus puanı için Track A
core deliverable'ından feragat etmek istemedim.

---

## D-10 · 2026-05-22 · Bundle .glb model boyutu

**Bağlam:** Avaturn export ~3-5MB. Doğrudan `require()` ile gömülürse APK
boyutu artar.
**Karar:** `expo-asset` ile `Asset.fromModule(...)`. assetBundlePatterns
app.json'da explicit `assets/avatar.glb` belirtildi.
**Gerekçe:** Bundle'a dahil ama runtime'da lazy-load edilebilir;
useGLTF preload pattern'i bunu hallediyor.

## D-11 · 2026-05-25 · WebView three.js CDN lipsync

**Bağlam:** model-viewer scene API blendshape'leri expose etmedi (count=0).
**Karar:** WebView içinde three.js CDN + GLTFLoader doğrudan kullanıldı.
**Gerekçe:** donmccurdy viewer aynı stack ile çalışıyordu; avaturn TYPE 2
blendshape'leri (mouthOpen, viseme_*) three.js traverse ile görünür oldu.
Lipsync çalışır hale geldi.
