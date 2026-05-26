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
| Uzmana Baglan Jitsi akisi | Tamam, gercek gorusme kaniti bekliyor |
| `app-release.apk` | Tamam |
| `audit-reports/*.md` | Tamam, 3 burn-in kanitli rapor |
| `FORGE.md` | Devam ediyor, 1 success cycle kayitli |
| `demo.mp4` | Telefon kaydi sonrasi eklenecek |

## Calistirma

```bash
cd submissions/231118040-nokta-final/app
npm install
npx expo start --tunnel
```

QR kodunu iPhone'daki Expo Go ile tara. Android teslim paketi: `../app-release.apk`.

## Expo QR ve Demo Linkleri

- Expo QR / link: `npx expo start --tunnel` komutunun verdigi Expo Go QR kodu ile iPhone testi yapilir; final kayitta kullanilan baglanti buraya eklenecek.
- 60 sn demo video linki / final demo (`demo.mp4`, en fazla 3 dakika): gercek Phase A + B + C kaydindan sonra klasore ve bu alana eklenecek.

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
altina kondu; bunlardan dogan diff ve zaman damgali donguler `FORGE.md`'ye yazilacak.
Challenge manuel notu kabul eder; `expo-speech-recognition` Expo Go binary'sinde
bulunmadigi icin iPhone test yolunda dikte bonusu hedeflenmez.

## Phase C - Uzman Koprusu

Forge ekranindaki STUCK durumu `Uzmana Baglan` eylemini acar. Bridge ekrani sabit
Jitsi odasina gecis ve link kopyalama sunar. Teslim videosunda baska bir kisiyle en
az 60 saniye video, ses ve ekran paylasimi birlikte gosterilecek; gorusme ozeti
`BRIDGE.md`'de tamamlanacak.

## Human Touch Points

Su an sayac: **2** - kullanici kendi yuzune ait `model (7).glb` avatarini sagladi
ve iPhone Expo Go uzerinden uc burn-in'li audit girdisini kaydetti. Uzman
gorusmesi tamamlaninca sayac gercek adimla guncellenecek.

## AI Tool Log

| Islem | Arac | Sonuc |
| --- | --- | --- |
| Uygulama iskeleti, voice/viseme/audit/bridge implementasyonu | OpenAI Codex | Gercek commitler olusturuldu |
| Expo Go uyarlamasi | OpenAI Codex | Native STT kaldirildi, `expo-av` metering ve manuel not girisi kullanildi |
| TypeScript kontrolu ve Android release build | OpenAI Codex | `typecheck` gecti, APK uretildi |
| Device audit aktarimi | OpenAI Codex | iPhone'da girilen 3 not ve burn-in kaniti Markdown rapora baglandi |
| Audit kaynakli forge cycle'lari | OpenAI Codex | Cycle 1: STUCK uzman eylemi ust gorunume tasindi (`3832c52`) |

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

## Teslimden Once Kalan Gercek Kanitlar

1. iPhone'da Expo Go QR ile acip mikrofon, waveform ve kendi avatar dudak tepkisini kaydet.
2. Bu raporlardan en az iki gercek fix ve bir rollback dongusu cikarip `FORGE.md`'yi doldur.
3. Jitsi gorusmesinde ses, video ve ekran paylasimini en az 60 saniye kaydet.
4. Tek `demo.mp4` icinde Phase A, B ve C kanitlarini en fazla 3 dakikada birlestir.
