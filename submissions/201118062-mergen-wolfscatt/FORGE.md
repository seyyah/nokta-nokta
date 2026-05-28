# FORGE.md

Official Track: A
Tool: Codex
Cycle rule: `READ -> LOCATE -> HYPOTHESIZE -> REPAIR -> TEST -> VERIFY -> COMMIT/ROLLBACK`

Existing real Audit-Forge inputs:

- `audit-reports/01-home-burada-fikri-hizli-sil.md`
- `audit-reports/02-questions-bu-kisimda-ust-uste.md`
- `audit-reports/03-result-bu-son-ekranda-ozeti.md`
- `audit-reports/04-home-tum-ekranin-stil-yapisini.md`

## Cycle 1 - quick-idea-clear - 2026-05-26T00:00

STATUS: COMMIT
INPUT: `audit-reports/01-home-burada-fikri-hizli-sil.md`
HYPOTHESIS: HomeScreen uzerinde fikir alaninin yakinina kucuk bir temizleme aksiyonu eklemek rapordaki hizli sil beklentisini karsilar.
CHANGES: `app/screens/HomeScreen.js`
TEST: Script yok; statik review ve manuel Expo verification required.
DURATION_MIN: TODO
NOTES: Eski Audit-Forge ledger'inda bu cycle gercek rapor girdisiyle kayitliydi. Onceki hash alanlari kesin dogrulanmadigi icin burada hash uydurulmadi.

## Cycle 2 - remove-duplicate-progress - 2026-05-26T00:00

STATUS: COMMIT
INPUT: `audit-reports/02-questions-bu-kisimda-ust-uste.md`
HYPOTHESIS: QuestionsScreen icindeki fazla progress gorunumunu kaldirmak, tek ve yeterli ilerleme bilgisini korur.
CHANGES: `app/screens/QuestionsScreen.js`
TEST: Script yok; statik review ve manuel Expo verification required.
DURATION_MIN: TODO
NOTES: Eski Audit-Forge ledger'inda bu cycle gercek rapor girdisiyle kayitliydi. Mevcut submission bu davranisi korur.

## Cycle 3 - broad-style-refactor - 2026-05-26T00:00

STATUS: ROLLBACK
INPUT: `audit-reports/04-home-tum-ekranin-stil-yapisini.md`
HYPOTHESIS: Global style refactor tum ekranlari daha tutarli hale getirebilir.
CHANGES: none
TEST: Kod degisikligi tutulmadi; karar kapsam uyumu uzerinden dogrulandi.
DURATION_MIN: TODO
NOTES: Rapor istegi birden fazla ekran ve ortak theme dosyasina yayildigi icin minimal diff sinirini asti. Kalici degisiklik tutulmadi.

## Cycle 4 - track-a-voice-avatar-bridge - 2026-05-26T00:00

STATUS: STUCK
INPUT: manual challenge request, `README.md`, `DECISIONS.md`
HYPOTHESIS: Track A icin VoiceVisualizer, avatar placeholder ve Jitsi bridge eklemek Phase A/C yuzeyini tamamlar.
CHANGES: `app/components/VoiceVisualizer.js`, `app/components/AvatarScene.js`, `app/components/Avatar.jsx`, `app/avatar-runtime.glb`, `app/lipsync/demo-mouth-cues.json`, `app/screens/VoiceAvatarScreen.js`, `app/screens/BridgeScreen.js`, `app/App.js`, `app/screens/HomeScreen.js`, `BRIDGE.md`, `README.md`, `DECISIONS.md`
TEST: npm package install completed; package JSON parse check passed; Expo dependency check passed; no lint/test script exists.
DURATION_MIN: TODO
NOTES: `app/avatar.glb` mevcut. `demo.mp4` eksik oldugu icin final demo artifact'i manuel capture gerektirir. Bu cycle COMMIT sayilmadi; gercek demo ve bridge capture sonrasi yeni cycle olarak islenmeli.

## Manual Verification Checklist

- `AuditWidget` mount noktasi tek kaldi.
- `audit-reports/` altindaki eski gercek raporlar korundu.
- Ana ekrandan `Ayna: Ses + Avatar` ekranina gidilebiliyor.
- Mikrofon izni verilince voice bars animasyonu calisiyor.
- `Avatar.jsx` gltfjsx component'i sahneye mount ediliyor; morph target loglari console'da gorunuyor.
- `Demo Lipsync` butonu mouth cue listesini calistiriyor.
- Ana ekrandan `Uzmana Bağlan` akisi Jitsi odasini aciyor.
- Gercek bridge gorusmesi ve demo video henuz manual capture gerektiriyor.
