# Decision Log

## D01 - Track A secildi

Final halkada en riskli gorunen parca ses ile kendi avatarinin eszamanli tepki
vermesiydi. Bu nedenle persona veya tam otomatik kopru yerine voice visualizer,
viseme tepkisi ve gozle gorulur gecikme Track A odagi olarak secildi.

## D02 - Avatar olarak `model (7).glb` kullanildi

Kullanici tarafindan saglanan Avaturn export secildi. Dosyada animasyon ve dudak
tepkisi icin gerekli viseme/mouth morph hedefleri bulundu; kaynak dosya uygulama
icinde `app/avatar.glb` olarak paketlenir.

## D03 - Mikrofon olcumu SDK 54 Expo Go icin `expo-av` ile yapildi

Challenge metni `expo-av` mic capture ister ve kullanicinin cihazinda calisan SDK 54
Expo Go runtime'i bu modulu destekler. Kayit status callback'i 50 ms aralikla
dinlenir; waveform ve avatar icin ayni normalize enerji degeri korunur.

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

## D10 - Idle animasyonunun facial morph override'i kaldirildi

iPhone testinde avatar gorundu ancak konusurken agiz hareketi gorunmedi. GLB
incelemesinde `avaturn_animation` icinde kafa, dis ve dil dahil alti `weights`
kanali bulundugu goruldu; bu kanallar canli `mouthOpen`, `jawOpen` ve viseme
degerlerini ezebiliyordu. Body animasyonu korunup morph-weight track'leri playback
disinda birakildi ve ses tepkisinin gorunurlugu artirildi.

## D11 - Recorder cleanup ve metering hatti duzeltildi

iPhone testinde waveform barlari da tepkisiz kalinca sorun avatar disinda arandi.
Ilk hook'ta recording state degisimi `stop` callback'ini yeniliyor, effect cleanup
ise aktif kaydi UI tarafinda hemen kapatiyordu. Recorder yasam dongusu sabit bir
ref ile yonetilecek sekilde degistirildi; metering ayni zamanda challenge'daki
`expo-av` kayit status callback'ine tasindi.

## D12 - Lipsync acikligi insan yuzune gore sinirlandi

Canli cihaz testinde ses algisi calisti ancak ilk guclendirme ayari normal konusmada
agzi tam aciyordu. Sessizlik esigi eklendi; viseme, cene ve agiz acikligi ayri ve
daha dusuk tavanlarla surulerek Track A demosunda dogal gorunen tepki hedeflendi.

## D13 - Audit raporlarinda tasinabilir cihaz kaniti kullanildi

Kullanici iPhone Expo Go uzerinde uc ekrani `AuditWidget` ile isaretledi ve not
girdi. Widget Markdown export'undaki ekran gorseli telefon ici gecici URI oldugu
icin repoda kirilacakti; raporlara, ayni widget ekraninda burn-in dikdortgeni ve
not metni gorunen cihaz JPEG kanitlari gomuldu.

## D14 - Gercek audit cycle'lari uygulama ledger'ina yansitildi

Forge ekrani ilk taslak senaryo kartlari yerine cihaz raporlarindan dogan cycle
kayitlarini gosterir. Bridge icin yanlis "hazir" durum hipotezi rollback edildi;
izin ve ekran paylasimi adimlarini gercek Jitsi oturum sinirinda anlatan cozum
success olarak kayda alindi. Canli ikinci katilimci gerektiren dogrulama STUCK'tir.

## Verification Log

| Tarih | Kontrol | Sonuc |
| --- | --- | --- |
| 2026-05-25 | `npm run typecheck` (`app/`) | Gecti |
| 2026-05-25 | `npx expo install --check` (`app/`) | Bagimliliklar uyumlu |
| 2026-05-25 | `npx expo export --platform android --clear` (`app/`) | Android JS/asset export gecti |
| 2026-05-25 | Gradle `assembleRelease` (gecici build dizini) | `app-release.apk` uretildi |
| 2026-05-25 | Expo Go uyumluluk karari | `expo-speech-recognition` kaldirildi; manuel audit yolu secildi |
| 2026-05-25 | `npx expo export --platform ios --clear` (`app/`, SDK 55) | Test gecti ancak App Store Expo Go runtime'i uyumsuz cikti |
| 2026-05-25 | Gradle `assembleRelease` (Expo Go uyarlamasi sonrasi) | Guncel `app-release.apk` yeniden uretildi |
| 2026-05-25 | `npx expo-doctor` (SDK 55 hizasi) | 19/19 kontrol gecti |
| 2026-05-25 | iPhone Expo Go acilis testi | SDK 55 uyumsuz; resmi notla SDK 54'e donus karari alindi |
| 2026-05-25 | `npx expo-doctor` (SDK 54 hizasi) | 18/18 kontrol gecti |
| 2026-05-25 | `npx expo export --platform ios --clear` (`app/`, SDK 54) | App Store Expo Go uyumlu bundle gecti |
| 2026-05-26 | GLB animation track incelemesi | 6 facial `weights` kanali tespit edildi |
| 2026-05-26 | `npm run typecheck`, `npx expo-doctor`, iOS export (lipsync fix) | Gecti |
| 2026-05-26 | iPhone waveform testi ve hook incelemesi | Recorder cleanup hatasi bulundu; `expo-av` metering'e gecildi |
| 2026-05-26 | `npm run typecheck`, `npx expo install --check`, `npx expo-doctor` (mic fix) | Gecti; doctor 18/18 |
| 2026-05-26 | `npx expo export --platform ios --clear` (`expo-av` mic fix) | iOS bundle gecti |
| 2026-05-26 | iPhone lipsync genlik testi ve `npm run typecheck`, `npx expo-doctor` | Agiz acikligi dusuruldu; doctor 18/18 |
| 2026-05-26 | iPhone `AuditWidget` kanit aktarimi | 3 notlu burn-in capture `audit-reports/` altina baglandi |
| 2026-05-26 | `npm run typecheck`, `npx expo install --check`, `npx expo-doctor` (forge cycles) | Gecti; doctor 18/18 |
