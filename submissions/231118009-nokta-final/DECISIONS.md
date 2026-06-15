# DECISIONS.md - Karar Gunlugu

## 2026-05-26 - Track A Secimi

Track A - Sadakat secildi. Ana hedef mikrofon sinyalinin barlara ve avatar agiz/viseme durumuna dusuk gecikmeyle yansimasini gostermekti. Persona ve bridge yuzeyleri eklendi, fakat rubrikteki ana kalite odağı voice/avatar akiciligi olarak tutuldu.

## 2026-05-26 - Avatar Asset Yollari

Uygulama runtime import'u `app/assets/avatar.glb` uzerinden calisiyor. Contract ise `app/avatar.glb` bekledigi icin ayni Avaturn export dosyasi iki yolda tutuldu. Submission kokundeki `avatar.glb` de manuel kontrol icin birakildi.

## 2026-05-26 - Lipsync Yaklasimi

Avaturn export dosyasinda morph target varsa RMS sinyali `jaw`, `mouth` ve `viseme` target agirliklarini surer. Export morph target sunmadiginda fallback rig ve viseme etiketi kullanilir. Bu karar sahte morph target uretmeden gercek asset sinirini acik tutar.

## 2026-05-26 - Forge Cycle Disiplini

Audit raporlari forge input'u olarak `audit-reports/` altinda tutuldu. Uygulanan degisiklikler commit/success, sade track ile celisen veya kaniti eksik kalan denemeler rollback olarak kaydedildi.

## 2026-05-26 - Bridge Provider

Key gerektirmedigi ve video, audio, screen share ucunu birlikte destekledigi icin Jitsi secildi. STUCK tetigi uygulama icinde iki ardil `FAIL`/`ROLLBACK` veya dogrudan `STUCK` secimi olarak modellendi.

## 2026-05-27 - Demo Kaniti

README demo linki kullanicinin verdigi YouTube Shorts linkiyle guncellendi. Repo icinde `demo.mp4` dosyasi da tutuldugu icin manuel kontrol hem yerel video dosyasina hem harici demo linkine bakabilir.
