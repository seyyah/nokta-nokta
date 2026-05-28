Track: A

# Nokta Capture - Voice Avatar Submission

## Summary

Bu submission, eski Nokta / Audit-Forge Expo uygulamasini temel alir ve resmi Track A icin voice visualizer + avatar/lipsync MVP akisini ekler. Mevcut fikir akisi ve root seviyesindeki `AuditWidget` entegrasyonu korunur; yeni `Ayna: Ses + Avatar` ekrani Phase A, `Uzmana Bağlan` akisi Phase C, mevcut audit raporlari ve [FORGE.md](FORGE.md) ise Phase B kapsamini tasir.

Track A secildi cunku bu odeve en uygun odak ses gorsellestirme, avatar mouth motion sadakati, latency hedefi ve akiciliktir. Coklu persona veya otonom bridge karmasikligi yerine Phase A/B/C zorunluluklari calisir ve belgeli tutulur.

## Phase Status

- Phase A - Voice + Avatar: `VoiceVisualizer` mikrofon izni ister, `expo-audio` recorder state/metering ile 0-1 voice level uretir, 12 barlik wave animasyonu calistirir ve sessizlikte idle seviyeye doner. Yeni viseme destekli `app/avatar.glb`, `npx gltfjsx avatar.glb -o components/Avatar.jsx` ile React Three Fiber component'ine cevrildi. `AvatarScene`, Expo asset URI'sini `Avatar.jsx` component'ine verir; canlı mikrofon `voiceLevel` degeri `jawOpen` / `aa` / `oh` gibi morph targetlari surer, `Demo Lipsync` butonu ise `demo-mouth-cues.json` uzerinden cue-to-viseme mapping calistirir.
- Phase B - Self-as-User Forge: `AuditWidget` root seviyesinde tek mount noktasinda korunur. `audit-reports/` altinda 4 eski Audit-Forge raporu ve screenshot klasoru vardir. [FORGE.md](FORGE.md) 2 COMMIT ve 1 ROLLBACK kabul kaydini yeni formatta tutar.
- Phase C - HITL/HOTL Bridge: Uygulamada `Uzmana Bağlan` butonu Jitsi odasini acar. [BRIDGE.md](BRIDGE.md) bridge kararlari ve gorusme ozeti sablonunu icerir.

## How To Run

```bash
cd submissions/201118062-mergen-wolfscatt/app
npm install
npx expo start --tunnel
```

Expo Go veya emulator ile acin. Mikrofon testi icin fiziksel cihaz daha guvenilirdir.

## Avatar Setup

`app/avatar.glb` mevcut ve Avatar SDK uzerinden alinmis viseme destekli GLB model olarak gorunuyor. Dosya Codex tarafindan uretilmedi; kullanici artifact'i olarak kabul edildi.

Manuel adim:

```text
Avatar SDK -> kendi yuzunden viseme destekli avatar olustur -> .glb export -> app/avatar.glb olarak ekle
```

Not: Yeni avatar export'u morph target desteklidir. `Avatar.jsx` icinde `AvatarHead`, `AvatarTeethLower` ve ilgili morph dictionary'ler kullanilir. Console'da `Avatar.jsx morph meshes`, `Avatar.jsx morph targets`, `Avatar.jsx live mouth targets` ve `Avatar.jsx mouth mode` satirlari gorulur. Eski manuel GLB parser ve proxy agiz cizgisi ana akistan kaldirildi.

Expo/RN ortaminda embedded JPEG texture'lari GLTFLoader tarafinda data-uri olarak yuklenirken uygulamayi kapatabildigi icin `app/avatar.glb` kaynak artifact olarak korunur, sahnede ise ondan turetilmis `app/avatar-runtime.glb` kullanilir. Bu runtime dosyasi ayni mesh, skeleton ve morph targetlari tasir; sadece texture referanslari cikarilmistir.

Stabilite notu: Avatar Canvas'i `@react-three/fiber/native` hook'lariyla calisir, DPR 1'e sabitlenir ve antialias kapatilir. Morph animasyonu `useFrame` icinde React state guncellemez; sadece `jawOpen`, `aa` ve demo cue targetlari gibi kucuk bir target kumesinin influence degerlerini onceden hesaplanmis mesh/index controller'lari uzerinden degistirir. T-pose kollarini rig ile degistirmek yerine `upperBody` kamera preset'i ve `overflow: hidden` crop kullanilir.

Troubleshooting: Avatar dosyasi degistirildiyse Metro cache'i temizlemek icin:

```bash
npx expo start -c
```

## APK

- `app-release.apk`: Mevcut.

## Demo

- `demo.mp4`: TODO. Sahte demo dosyasi uretilmedi.
- Expo link / QR: TODO veya manuel Expo calistirma ciktisindan eklenmeli.

## Voice + Avatar Test Steps

1. Uygulamayi acin.
2. Ana ekrandan `Ayna: Ses + Avatar` ekranina gidin.
3. `Dinlemeyi Baslat` butonuna basin ve mikrofon izni verin.
4. Konusunca barlarin yukseldigini, sessizlikte idle seviyeye dondugunu kontrol edin.
5. Konusunca avatar agzinin `jawOpen` / viseme morph targetlariyla hareket ettigini kontrol edin.
6. `Demo Lipsync` butonuna basin; 2-3 saniyelik mouth-cue demo animasyonu agiz hareketini net gostermelidir.
7. Hedef latency notu: mic-to-mouth < 200ms. Demo kaydinda cihaz uzerinde manuel gozlemle dogrulanmalidir.

## Bridge Test Steps

1. Ana ekrandan `Uzmana Bağlan` akisini acin.
2. `Uzmana Bağlan` butonuna basin.
3. Jitsi odasinda video, audio ve screen share akisini test edin.
4. Demo kaydinda en az 60 saniyelik gorusme gosterin.
5. Gorusme ozetini [BRIDGE.md](BRIDGE.md) icindeki TODO alanina isleyin.

## Audit / Forge Test Steps

1. Uygulamada herhangi bir ekrana gidin.
2. Root seviyesinde gorunen `AuditWidget` ile screenshot/note yakalayin.
3. Raporu export edip `audit-reports/` altina, screenshot'i `audit-reports/screenshots/` altina koyun.
4. [FORGE.md](FORGE.md) icindeki formatla cycle kaydini guncelleyin.

## AI Tool Log

- Tool: Codex
- Usage: Track A voice/avatar MVP, Jitsi bridge, AuditWidget korunumu, README/FORGE/DECISIONS/BRIDGE guncellemesi.

## Known Limitations

- Expo Go'da gercek low-level PCM/FFT erisimi sinirli olabilir; MVP voice-level/metering fallback kullanir.
- `app/avatar.glb` Avatar SDK kullanici artifact'i olarak mevcuttur; Codex bu dosyayi uretemez veya gercek yuzden export edemez.
- Avatar render artik `components/Avatar.jsx` gltfjsx component'i uzerinden calisir; `/avatar.glb` web path'i yerine Expo asset URI kullanilir. Expo stabilitesi icin sahne `app/avatar-runtime.glb` dosyasini yukler, kaynak `app/avatar.glb` korunur. Avatar SDK modelinde `jawOpen`, `aa`, `oh` targetlari bulunmustur.
- Live mic mode fonem tahmini degil, dusuk gecikmeli voice-level driven morph motion'dir. Demo mode `demo-mouth-cues.json` ile tutorial benzeri cue-to-viseme mapping gosterir.
- GLB icinde mouth/jaw/viseme morph target bulunamazsa gercek lipsync varmis gibi davranilmaz; UI `unsupported` mouth mode gosterir.
- Expo Go crash yasanirsa `npx expo start -c` ile cache temizlenmeli ve Expo Go tamamen kapatilip tekrar acilmalidir. Model degistirilirse `avatar-runtime.glb` yeniden uretilmelidir.
- `demo.mp4` ve gercek bridge gorusme ozeti manuel uretilmelidir.
