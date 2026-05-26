Track: A

# Nokta Mirror Bridge - Voice ve Avatar Sadakati

Bu teslim, Nokta-Nokta final halkasi icin kendi Avaturn avatarimi sesimle canlandiran
Expo SDK 54 / TypeScript mobil uygulamasidir. SDK 54, iPhone App Store'daki Expo Go
ile cihaz testi yapmak icin secilmistir. Track A odagi, mikrofondan gelen enerjinin
dusuk gecikmeyle dalga formuna ve avatar dudak hareketine aktarilmasidir.

## Durum

| Ister | Durum |
| --- | --- |
| Expo + TypeScript mobil uygulama | Tamam |
| `app/avatar.glb` (Avaturn, `model (7).glb`) | Tamam |
| Expo Go uyumlu `expo-av` RMS tabanli voice visualizer | Tamam |
| R3F avatar sahnesi ve viseme tepki hatti | Tamam |
| Manuel not destekli AuditWidget akisi | Tamam, 3 cihaz raporu eklendi |
| Uzmana Baglan Jitsi akisi | Tamam; demo kanitinda 60 sn ekran paylasimi eksik |
| `app-release.apk` | Tamam |
| `audit-reports/*.md` | Tamam, 3 burn-in kanitli rapor |
| `FORGE.md` | Tamam, 2 COMMIT + 1 ROLLBACK + 1 STUCK cycle kayitli |
| `demo.mp4` | Eklendi (73.36 sn); Phase C kabul kaniti icin yeniden kayit gerekli |

## Calistirma

```bash
cd submissions/231118040-nokta-final/app
npm install
npx expo start --tunnel
```

QR kodunu iPhone'daki Expo Go ile tara. Android teslim paketi: `../app-release.apk`.

## Expo QR ve Demo Linkleri

- Expo QR / link: `npx expo start --tunnel` komutunun verdigi Expo Go QR kodu ile iPhone testi yapilir.
- Final demo: [`demo.mp4`](./demo.mp4) (73.36 sn, en fazla 3 dakika siniri icinde).

## Phase A - Ayna

Mikrofon kaydi Expo Go icindeki `expo-av` metering ile 50 ms ornekleme hedefinde izlenir. Ses
seviyesi waveform barlarini hareket ettirir; sessizlikte barlar soner. Aynı normalize
seviye `avatar.glb` icindeki `viseme_aa`, `viseme_E`, `viseme_O`, `viseme_PP`,
`viseme_TH`, `viseme_U`, `jawOpen` ve `mouthOpen` morph hedeflerine aktarilir.
RMS tabanli tepki, fonem cozumlemesi iddiasi tasimaz; Track A demosunda gorulebilir
mic-to-mouth tepki suresi hedefi 200 ms altidir.

## Phase B - Audit ve Forge

Audit ekraninda geri bildirim metni girilip kopyalanir ve uygulama kokune tek kez
mount edilen `AuditWidget` icindeki nota
yapistirilabilir; widget ekrani yakalayip burn-in secim kutusu ile Markdown raporu
paylastirir. iPhone Expo Go oturumunda uretilen uc gercek rapor `audit-reports/`
altina kondu; bunlardan dogan diff ve zaman damgali donguler `FORGE.md`'ye yazildi.
Challenge manuel notu kabul eder; `expo-speech-recognition` Expo Go binary'sinde
bulunmadigi icin iPhone test yolunda dikte bonusu hedeflenmez.

## Phase C - Uzman Koprusu

Forge ekranindaki STUCK durumu `Uzmana Baglan` eylemini acar. Bridge ekrani sabit
Jitsi odasina gecis ve link kopyalama sunar. Mevcut `demo.mp4`, Jitsi gecisini ve
kisa bir ikinci katilimci goruntusunu kaydeder; ancak en az 60 saniye boyunca
video, ses ve ekran paylasimi birlikte gorunmedigi icin Phase C kaniti tamamlanmis
sayilmaz. Dogrulama notu `BRIDGE.md`'dedir.

## Human Touch Points

Su an sayac: **3** - kullanici kendi yuzune ait `model (7).glb` avatarini sagladi,
iPhone Expo Go uzerinden uc burn-in'li audit girdisini kaydetti ve ilk demo ekran
kaydini teslim etti. Uzman gorusmesi kabul kanitiyla tamamlaninca sayac gercek
adimla guncellenecek.

## AI Tool Log

| Islem | Arac | Sonuc |
| --- | --- | --- |
| Uygulama iskeleti, voice/viseme/audit/bridge implementasyonu | OpenAI Codex | Gercek commitler olusturuldu |
| Expo Go uyarlamasi | OpenAI Codex | Native STT kaldirildi, `expo-av` metering ve manuel not girisi kullanildi |
| TypeScript kontrolu ve Android release build | OpenAI Codex | `typecheck` gecti, APK uretildi |
| Device audit aktarimi | OpenAI Codex | iPhone'da girilen 3 not ve burn-in kaniti Markdown rapora baglandi |
| Audit kaynakli forge cycle'lari | OpenAI Codex | 2 COMMIT (`3832c52`, `897b5c8`) + 1 ROLLBACK + 1 STUCK, spec satir formatiyla kayitli |
| Demo kaniti kontrolu | OpenAI Codex | 73.36 sn video eklendi; Phase A ve Forge gorunur, Phase C 60 sn ekran paylasimi kaniti eksik |

## Decision Log

Uygulama kararlarinin gercek gerekceleri ve calistirilan dogrulamalar
[`DECISIONS.md`](./DECISIONS.md) dosyasinda kayitlidir.

## Dosyalar

- `app/`: Expo/TypeScript kaynak kodu, `avatar.glb` ve paket ayarlari.
- `app-release.apk`: Android release paketi.
- `DECISIONS.md`: karar ve dogrulama gunlugu.
- `FORGE.md`: gercek audit kaynakli cycle ledger'i icin kayit alani.
- `BRIDGE.md`: uzman gorusmesi kanit ve ozet alani.
- `audit-reports/`: telefonda uretilen burn-in raporlarinin teslim klasoru.
- `demo.mp4`: 73.36 sn telefon ekran kaydi.

## Teslimden Once Kalan Gercek Kanitlar

1. `demo.mp4` kaydini, Jitsi gorusmesinde baska bir kisiyle ses, video ve ekran paylasiminin birlikte en az 60 saniye gorundugu yeni bir kayitla degistir.
