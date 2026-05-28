# DECISIONS.md

1. Resmi track `A` secildi; cunku bu challenge icin ana odak voice visualizer, avatar/lipsync sadakati, latency ve akicilik.
2. Eski Nokta / Audit-Forge uygulamasi temel alindi; cunku mevcut fikir akisi ve `AuditWidget` entegrasyonu Phase B kanitlarini zaten tasiyor.
3. `AuditWidget` root seviyesinde yalnizca bir kez mount edilmeye devam etti; cunku audit primitive'i tum ekranlari ortak host baglamindan yakalamali.
4. Voice visualizer icin `expo-audio` secildi; cunku SDK 54'te `expo-av` deprecated uyarisi veriyor ve mikrofon izni + recorder metering akisi `expo-audio` tarafindan destekleniyor.
5. FFT yerine metering/RMS benzeri intensity fallback yaklasimi secildi; cunku Expo Go icinde low-level PCM/FFT erisimi platforma gore sinirli olabilir.
6. `app/avatar.glb` zorunlu kullanici artifact'i olarak kabul edildi; bu teslimde model Avatar SDK uzerinden kullanicinin kendi yuzunden export edilen viseme destekli GLB'dir ve Codex bunu gercekci bicimde uretemez.
7. Yeni viseme destekli `app/avatar.glb`, `npx gltfjsx avatar.glb -o components/Avatar.jsx` ile React Three Fiber component'ine cevrildi; artik avatar render ana yolu `components/Avatar.jsx` uzerindendir.
8. `Avatar.jsx` icindeki web path (`/avatar.glb`) Expo icin uygun olmadigindan `AvatarScene` `expo-asset` ile `asset.localUri || asset.uri` cozer ve bu URI'yi `glbUrl` prop'u olarak modele verir.
8a. Expo/RN tarafinda embedded JPEG texture'lar GLTFLoader icinde data-uri yukleme hatasi ve uygulama kapanmasi uretebildigi icin `app/avatar.glb` kaynak artifact olarak korunur, sahne icin texture referanslari cikarilmis `app/avatar-runtime.glb` uretilmistir. Mesh, skeleton ve morph targetlar aynidir; sahte avatar uretilmemistir.
9. Eski manuel GLB parser, Base64 okuma, tuning/proxy agiz cizgisi ve unsupported fallback ana akisi devre disi birakildi; gercek morph target yoksa UI sadece bunu raporlar.
10. Avatar material/mesh gorunurlugu icin mesh frustum culling kapatildi, material `DoubleSide` ve `needsUpdate` ayarlandi; texture ve mesh yapisi gltfjsx/GLTFLoader uzerinden korunur.
11. Avatar yuklenince `Avatar.jsx morph meshes`, `Avatar.jsx morph targets`, `Avatar.jsx live mouth targets` ve `Avatar.jsx mouth mode` console'a yazilir.
12. Live mic mode, `voiceLevel` degerini `jawOpen`, `mouthOpen`, `aa`, `oh`, `ou` gibi mevcut morph targetlara smooth sekilde uygular. Demo mode, `app/lipsync/demo-mouth-cues.json` icindeki cue listesini tutorial benzeri viseme mapping ile oynatir.
12a. Crash riskini azaltmak icin `Avatar.jsx` ve `AvatarScene` ayni `@react-three/fiber/native` entrypoint'ini kullanir; `useGraph` kaldirildi, morph meshleri clone edilen scene uzerinden tek traverse ile toplanir.
12b. `useFrame` icinde React state guncellenmez ve tum yuz targetlari her frame sifirlanmaz. Sadece canli modda `jawOpen`/`aa`, demo modda ise kucuk cue target kumesi mesh influence degerleri uzerinden lerp edilir.
12c. Canvas DPR 1'e sabitlendi, antialias kapatildi ve avatar render hatalari icin kontrollu error boundary eklendi.
12d. T-pose kollarini rig seviyesinde degistirmek yerine `upperBody` kamera preset'i, kontrollu model scale ve `overflow: hidden` crop ile upper-body/head-shoulder kadraj secildi.
13. Bridge icin Jitsi secildi; cunku video, audio ve screen share ihtiyacini backend kurmadan manuel HITL/HOTL gorusme akisiyle karsilar.
14. `react-native-webview` paket olarak eklendi, ancak bridge tetigi `Linking.openURL` ile yapildi; cunku native WebRTC/WebView uyumluluk riski Jitsi uygulamasi veya tarayiciya devredildi.
15. `app-release.apk` mevcut oldugu icin README'de mevcut olarak isaretlendi; `demo.mp4` eksik oldugu icin TODO olarak birakildi.
16. Submission klasoru disinda hicbir dosyaya yazilmadi.
