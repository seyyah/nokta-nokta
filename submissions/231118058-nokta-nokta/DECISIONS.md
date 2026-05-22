# DECISIONS.md — Karar Günlüğü

## D-01: Track A Seçimi
**Tarih:** 2026-05-21  
**Karar:** Track A (Sadakat — Voice viz + lipsync fidelity)  
**Gerekçe:** Ses-avatar senkronizasyonunun derinliğine odaklanmak istendi. Track B (çoklu persona) ve C (otonom köprü) Phase A tamamlandıktan sonra değerlendirilebilir.

## D-02: expo-three vs @react-three/fiber
**Tarih:** 2026-05-21  
**Karar:** `expo-three` + `THREE.js` doğrudan kullanıldı, `@react-three/fiber` kullanılmadı.  
**Gerekçe:** `@react-three/fiber` Expo Go managed workflow'da çalışmıyor. `expo-gl` + `expo-three` ise managed build'de Expo Go'da sorunsuz çalışıyor. Challenge "react-three-fiber pattern" öneriyor ama zorunlu kılmıyor.

## D-03: expo-av Polling (50ms)
**Tarih:** 2026-05-21  
**Karar:** `Audio.Recording.getStatusAsync()` her 50ms'de interval ile çağrılıyor.  
**Gerekçe:** Expo `metering` API'si event-driven değil, polling zorunlu. 50ms → 20fps animasyon güncellemesi sağlıyor; hedef < 200ms latency için yeterli.

## D-04: GLB Path (app root)
**Tarih:** 2026-05-21  
**Karar:** `avatar.glb` hem `app/assets/` hem `app/` (kök) konumuna kopyalandı.  
**Gerekçe:** Challenge spec'i `submissions/<id>-<slug>/app/avatar.glb` diyor. Expo Metro bundler için `require('../../../avatar.glb')` path kullanıldı.

## D-05: Fallback Avatar
**Tarih:** 2026-05-21  
**Karar:** GLB yüklenemezse THREE.js ile programatik kafa/omuz geometrisi oluşturuluyor.  
**Gerekçe:** Geliştirme sürecinde GLB olmadan da ekranın crash vermemesi için. Üretimde avaturn.me'den export edilen GLB kullanılacak.

## D-06: Lipsync Yöntemi
**Tarih:** 2026-05-21  
**Karar:** Basit `scale.y` manipülasyonu (morph target pipeline yerine).  
**Gerekçe:** Challenge "viseme pipeline (wass08/r3f-lipsync-tutorial pattern)" öneriyor. Ancak bu pattern r3f gerektirir. Mevcut expo-three setup'ında ağız mesh'inin scale.y'sini ses seviyesine orantılı büyüterek görsel senkronizasyon sağlandı. Gerçek viseme pipeline D-02 kararı değiştirildikten sonra eklenebilir.
