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

Challenge metni `expo-av` mic capture ister; ancak modern Expo Go test yolunda
desteklenen kayit modulu `expo-audio`dur. `expo-audio` recording metering 50 ms
aralikla dinlenir; waveform ve avatar icin ayni normalize enerji degeri korunur.

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

## D09 - iPhone Expo Go testi icin SDK 54'e gecildi

Expo'nun 4 Mayis 2026 duyurusuna gore SDK 55 icin iOS Expo Go App Store onayi
halen beklenirken magaza surumu SDK 54'u tasiyor. Kullanici iPhone'daki magaza
Expo Go surumuyle QR test edecegi icin uygulama SDK 54 paket ailesine indirildi;
voice, avatar, audit ve bridge davranislari korunuyor.

## Verification Log

| Tarih | Kontrol | Sonuc |
| --- | --- | --- |
| 2026-05-25 | `npm run typecheck` (`app/`) | Gecti |
| 2026-05-25 | `npx expo install --check` (`app/`) | Bagimliliklar uyumlu |
| 2026-05-25 | `npx expo export --platform android --clear` (`app/`) | Android JS/asset export gecti |
| 2026-05-25 | Gradle `assembleRelease` (gecici build dizini) | `app-release.apk` uretildi |
| 2026-05-25 | Expo Go uyumluluk karari | `expo-speech-recognition` ve `expo-av` kaldirildi |
| 2026-05-25 | `npx expo export --platform ios --clear` (`app/`, SDK 55) | Test gecti ancak App Store Expo Go runtime'i uyumsuz cikti |
| 2026-05-25 | Gradle `assembleRelease` (Expo Go uyarlamasi sonrasi) | Guncel `app-release.apk` yeniden uretildi |
| 2026-05-25 | `npx expo-doctor` (SDK 55 hizasi) | 19/19 kontrol gecti |
| 2026-05-25 | iPhone Expo Go acilis testi | SDK 55 uyumsuz; resmi notla SDK 54'e donus karari alindi |
| 2026-05-25 | `npx expo-doctor` (SDK 54 hizasi) | 18/18 kontrol gecti |
| 2026-05-25 | `npx expo export --platform ios --clear` (`app/`, SDK 54) | App Store Expo Go uyumlu bundle gecti |
