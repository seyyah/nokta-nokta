Track: A

# Nokta Mirror Bridge - Voice ve Avatar Sadakati

Bu teslim, Nokta-Nokta final halkasi icin kendi Avaturn avatarimi sesimle canlandiran
Expo SDK 55 / TypeScript mobil uygulamasidir. SDK 55, iPhone App Store'daki Expo Go
ile cihaz testi yapmak icin secilmistir. Track A odagi, mikrofondan gelen enerjinin
dusuk gecikmeyle dalga formuna ve avatar dudak hareketine aktarilmasidir.

## Durum

| Ister | Durum |
| --- | --- |
| Expo + TypeScript mobil uygulama | Tamam |
| `app/avatar.glb` (Avaturn, `model (7).glb`) | Tamam |
| Expo Go uyumlu `expo-audio` RMS tabanli voice visualizer | Tamam |
| R3F avatar sahnesi ve viseme tepki hatti | Tamam |
| Manuel not destekli AuditWidget akisi | Tamam, cihaz kaniti bekliyor |
| Uzmana Baglan Jitsi akisi | Tamam, gercek gorusme kaniti bekliyor |
| `app-release.apk` | Tamam |
| `audit-reports/*.md` ve `demo.mp4` | Telefon kaydi sonrasi eklenecek |

## Calistirma

```bash
cd submissions/231118040-nokta-final/app
npm install
npx expo start --lan
```

QR kodunu iPhone'daki Expo Go ile tara. Android teslim paketi: `../app-release.apk`.

## Expo QR ve Demo Linkleri

- Expo QR / link: ayni Wi-Fi'da `npx expo start --lan` komutunun verdigi Expo Go QR kodu ile iPhone testi yapilir; final kayitta kullanilan baglanti buraya eklenecek.
- 60 sn demo video linki / final demo (`demo.mp4`, en fazla 3 dakika): gercek Phase A + B + C kaydindan sonra klasore ve bu alana eklenecek.

## Phase A - Ayna

Mikrofon kaydi Expo Go icindeki `expo-audio` metering ile 50 ms ornekleme hedefinde izlenir. Ses
seviyesi waveform barlarini hareket ettirir; sessizlikte barlar soner. Aynı normalize
seviye `avatar.glb` icindeki `viseme_aa`, `viseme_E`, `viseme_O`, `viseme_PP`,
`viseme_TH`, `viseme_U`, `jawOpen` ve `mouthOpen` morph hedeflerine aktarilir.
RMS tabanli tepki, fonem cozumlemesi iddiasi tasimaz; Track A demosunda gorulebilir
mic-to-mouth tepki suresi hedefi 200 ms altidir.

## Phase B - Audit ve Forge

Audit ekraninda geri bildirim metni girilip kopyalanir ve uygulama kokune tek kez
mount edilen `AuditWidget` icindeki nota
yapistirilabilir; widget ekrani yakalayip sari burn-in kutusu ile Markdown raporu
paylastirir. Gercek cihazda uretilen en az uc rapor `audit-reports/` altina konacak,
ardindan her biri icin gercek diff ve zaman damgali donguler `FORGE.md`'ye yazilacak.
Challenge manuel notu kabul eder; `expo-speech-recognition` Expo Go binary'sinde
bulunmadigi icin iPhone test yolunda dikte bonusu hedeflenmez.

## Phase C - Uzman Koprusu

Forge ekranindaki STUCK durumu `Uzmana Baglan` eylemini acar. Bridge ekrani sabit
Jitsi odasina gecis ve link kopyalama sunar. Teslim videosunda baska bir kisiyle en
az 60 saniye video, ses ve ekran paylasimi birlikte gosterilecek; gorusme ozeti
`BRIDGE.md`'de tamamlanacak.

## Human Touch Points

Su an sayac: **1** - kullanici kendi yuzune ait `model (7).glb` avatarini sagladi.
Telefon testi, manuel audit raporlari ve uzman gorusmesi tamamlaninca sayac gercek
adimlarla guncellenecek.

## AI Tool Log

| Islem | Arac | Sonuc |
| --- | --- | --- |
| Uygulama iskeleti, voice/viseme/audit/bridge implementasyonu | OpenAI Codex | Gercek commitler olusturuldu |
| Expo Go uyarlamasi | OpenAI Codex | Native STT kaldirildi, `expo-audio` metering ve manuel not girisi kullanildi |
| TypeScript kontrolu ve Android release build | OpenAI Codex | `typecheck` gecti, APK uretildi |
| Audit kaynakli forge cycle'lari | Bekliyor | Gercek audit raporlari sonra verilecek |

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
2. Audit ekraninda manuel notla uc ayri rapor uretip dosyalari `audit-reports/` altina ekle.
3. Bu raporlardan en az iki gercek fix ve bir rollback dongusu cikarip `FORGE.md`'yi doldur.
4. Sinif arkadasinla Jitsi gorusmesinde ses, video ve ekran paylasimini en az 60 saniye kaydet.
5. Tek `demo.mp4` icinde Phase A, B ve C kanitlarini en fazla 3 dakikada birlestir.
