Track: A

# 231118009 Audit Track A - Halka Kapanisi

Bu teslim Nokta-Nokta final halkasi icin Track A - Sadakat odagiyla hazirlandi. Uygulama Expo + TypeScript tabanli; mikrofon sinyali voice visualizer'i ve avatar lipsync/viseme surucusunu besler, audit raporlari forge dongusune girer, STUCK halinde Jitsi uzerinden insan uzmana baglanma akisi acilir.

## Linkler

- Demo video: https://youtube.com/shorts/4GezA5Kqft8?si=aC-PpiQvOK4LVyuG
- EAS Build (APK): https://expo.dev/accounts/huseyinyagmur/projects/app/builds/21e7e255-4a57-48dd-bf60-f3e2d41419d0
- APK dosyasi: `app-release.apk`
- Jitsi bridge room: https://meet.jit.si/nokta-231118009-forge-bridge#config.prejoinPageEnabled=false
- Expo web: `cd app && npm install && npx expo start --web --port 8081`

## Teslim Artifact'leri

| Contract path | Durum |
|---|---|
| `app/` | Expo + TypeScript proje mevcut |
| `app/avatar.glb` | Mevcut; Avaturn export kopyasi |
| `app/assets/avatar.glb` | Runtime import icin mevcut |
| `avatar.glb` | Submission kokunde ek kontrol icin mevcut |
| `FORGE.md` | 8 cycle logu, 5 success/commit ve 2 rollback iceriyor |
| `BRIDGE.md` | Jitsi bridge, trigger ve demo call ozeti mevcut |
| `PERSONAS.md` | Junior/Senior persona davranisi belgeli |
| `DECISIONS.md` | Karar gunlugu mevcut |
| `app-release.apk` | Build cikti dosyasi mevcut |
| `demo.mp4` | Repo dosyasi olarak mevcut; YouTube linki ek kanit olarak verildi |

## Phase A - Ayna

- `app/components/voice/VoiceAvatarLab.tsx` mikrofonu `expo-av` ile native'de, WebAudio ile web'de okur.
- RMS seviyesi 28 barlik visualizer'a ve avatar viseme durumuna ayni anda gider.
- Sessizlikte RMS decay ile barlar idle duruma iner.
- Avatar `avatar.glb` Avaturn export olarak sahneye yuklenir; morph target varsa agiz agirliklari RMS ile surulur.
- Avaturn export morph target vermediginde fallback agiz surucusu devreye girer; bu durum `PERSONAS.md` icinde acikca not edildi.
- Native sampling interval 80ms tutuldu; hedef mic-to-mouth gecikmesi <200ms.

## Phase B - Kendi Musterin Forge

- `<AuditWidget />` `app/app/_layout.tsx` icinde tek mount noktasi olarak baglandi.
- Audit raporlari `audit-reports/` altinda markdown olarak tutuluyor.
- `FORGE.md` en az 3 cycle sartini asar: cycle 1-6 commit/success, cycle 4 ve 7 rollback.
- Her cycle 15-20dk timebox ile kaydedildi.
- Dikte/STT yuzeyi voice tab icinde `Dikte Et` akisi ve markdown editoruyle hazir.

## Phase C - Kopru

- `Uzmana Baglan` butonu voice tab icinde forge STUCK heuristigine bagli.
- Son iki sonuc `FAIL`/`ROLLBACK` ise veya son sonuc `STUCK` ise Jitsi bridge acilir.
- Web demosunda Jitsi linki harici sekmede, native APK'da WebView icinde acilir.
- Jitsi oda hedefi video, audio ve screen share icindir.
- Bridge kaydi ve sonraki cycle input formati `BRIDGE.md` icinde tutuldu.

## Calistirma

```bash
cd app
npm install
npx expo start --web --port 8081
```

APK icin bu klasordeki `app-release.apk` kullanilir.

## Kabul Kontrolu

- [x] README ilk satiri track secimini iceriyor.
- [x] Submission klasoru icinde calisildi.
- [x] `app/` altinda Expo + TS proje var.
- [x] `app/avatar.glb` ve runtime asset kopyasi mevcut.
- [x] `app-release.apk` mevcut.
- [x] `FORGE.md` 3+ cycle, 2+ commit/success ve 1+ rollback iceriyor.
- [x] Audit raporlari `.md` olarak repo'da mevcut.
- [x] Bridge butonu ve Jitsi akisi app icinde functional.
- [x] `demo.mp4` repo dosyasi olarak mevcut; demo kaniti README'deki YouTube linkiyle de desteklendi.
