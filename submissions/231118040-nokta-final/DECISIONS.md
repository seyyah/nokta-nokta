# Decision Log

## D01 - Track A secildi

Final halkada en riskli gorunen parca ses ile kendi avatarinin eszamanli tepki
vermesiydi. Bu nedenle persona veya tam otomatik kopru yerine voice visualizer,
viseme tepkisi ve gozle gorulur gecikme Track A odagi olarak secildi.

## D02 - Avatar olarak `model (7).glb` kullanildi

Kullanici tarafindan saglanan Avaturn export secildi. Dosyada animasyon ve dudak
tepkisi icin gerekli viseme/mouth morph hedefleri bulundu; kaynak dosya uygulama
icinde `app/avatar.glb` olarak paketlenir.

## D03 - Mikrofon olcumu Expo Go icin `expo-audio` ile yapildi

Challenge metni `expo-av` mic capture ister; ancak SDK 56 Expo Go bu kaldirilmis
modulu tasimaz. iPhone ile QR testi yapabilmek icin Expo Go icindeki guncel
`expo-audio` recording metering 50 ms aralikla dinlenir; waveform ve avatar icin
ayni normalize enerji degeri korunur.

## D04 - Lipsync gercek zamanli RMS tepki hattidir

Canli mikrofonda guvenilir fonem zamanlamasi elde edilmeden fonem hassasiyeti iddia
edilmedi. Enerjiye gore viseme dizisi ve jaw/mouth morph hedefleri yumusatilarak
oynatilir; demo olcumu mic-to-mouth tepki akisina odaklanir.

## D05 - Audit widget host boundary icinde tutuldu

`@xtatistix/mobile-audit` yalniz uygulama kokunde mount edilir. Screenshot, dosya
yazma, paylasma ve storage islevleri host uygulama tarafindan `deps` ile verilir.

## D06 - Audit notlari Expo Go yolunda manuel girilir

`expo-speech-recognition` custom development build ister ve iPhone'daki Expo Go ile
calismaz. Challenge manuel typing kabul ettigi icin bu bonus birakildi; rapor
notlari gercek test sirasinda elle yazilip widget ile export edilir. Sentetik rapor
eklenmeyecektir.

## D07 - Uzman koprusu Jitsi ile acilir

Phase C icin anahtarsiz ve cihaz izinlerini kendi yoneten Jitsi oda linki secildi.
Uygulamadaki buton gorusmeyi acar; kabul kaniti icin gercek bir sinif arkadasiyla
video, ses ve ekran paylasimi kaydi gereklidir.

## D08 - Release build kisa gecici dizinde alindi

Windows native build yol uzunlugu riskini azaltmak icin kaynak kod `C:\tmp\nnf-app`
altinda derlendi. Olusan gercek Android release cikti dosyasi submission icine
`app-release.apk` olarak alindi.

## Verification Log

| Tarih | Kontrol | Sonuc |
| --- | --- | --- |
| 2026-05-25 | `npm run typecheck` (`app/`) | Gecti |
| 2026-05-25 | `npx expo install --check` (`app/`) | Bagimliliklar uyumlu |
| 2026-05-25 | `npx expo export --platform android --clear` (`app/`) | Android JS/asset export gecti |
| 2026-05-25 | Gradle `assembleRelease` (gecici build dizini) | `app-release.apk` uretildi |
| 2026-05-25 | Expo Go uyumluluk karari | `expo-speech-recognition` ve `expo-av` kaldirildi |
| 2026-05-25 | `npx expo export --platform ios --clear` (`app/`) | Expo Go yonelimli iOS bundle gecti |
