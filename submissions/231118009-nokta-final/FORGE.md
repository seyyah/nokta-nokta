# FORGE.md - Nokta Voice Avatar Forge Ledger

Track: Voice visualizer + persona avatar + STUCK bridge  
Time box: 20 dakika / final hafta cycle  
Agent: Codex  
Host app: `submissions/231118009-nokta-final/app/`  
Human touch points: AuditWidget raporlari, dikte raporu denemesi, runtime kontrolu

Bu ledger final hafta icin uygulamadaki voice/avatar yuzeyini, kendi audit raporlarindan gelen forge dongusunu ve STUCK durumunda expert bridge tetigini kapatir.

## Ledger

| Cycle | Rapor | Hipotez | Sonuc | Degisen dosyalar | Test / Verify | Commit | kg | Human touch |
|---:|---|---|---|---|---|---|---:|---:|
| 1 | `audit-reports/report-01-yellow-button.md` | Ana aksiyon butonu amber tona cekilirse istek karsilanir ve kontrast korunur. | success | `app/app/(tabs)/index.tsx` | `npx tsc --noEmit`, `npm run lint` pass | `87a812f` | 1 | 1 |
| 2 | `audit-reports/report-02-title-name.md` | Baslik Nokta Fikir olursa uygulama odeve daha bagli gorunur. | success | `app/app/(tabs)/index.tsx` | `npx tsc --noEmit`, `npm run lint` pass | `a038f0f` | 1 | 1 |
| 3 | `audit-reports/report-03-button-label.md` | Buton label'i fikri net soyleyince aksiyon daha okunur olur. | success | `app/app/(tabs)/index.tsx` | `npx tsc --noEmit`, `npm run lint` pass | `5b7d880` | 1 | 1 |
| 4 | `audit-reports/report-04-rollback.md` | Neon yesil daha dikkat cekebilir. | rollback | Yok | Sade track ve onceki amber karariyla celistigi icin reddedildi. | `d69981f` | 0 | 1 |
| 5 | `audit-reports/report-05-voice-bars.md` | Mikrofon RMS sinyali barlari ve avatar viseme durumunu ayni anda besleyebilir. | success | `app/components/voice/VoiceAvatarLab.tsx`, `app/app/(tabs)/voice.tsx` | `npx tsc --noEmit`, `npm run lint` pass | local | 1 | 1 |
| 6 | `audit-reports/report-06-persona-switch.md` | Junior/Senior persona secimi TTS tonu, vurgu rengi ve rapor okuma davranisini ayirir. | success | `app/components/voice/VoiceAvatarLab.tsx`, `PERSONAS.md` | `npx tsc --noEmit`, `npm run lint` pass | local | 1 | 1 |
| 7 | `audit-reports/report-07-stuck-bridge.md` | Ardil FAIL/ROLLBACK veya STUCK secimi expert bridge'i acmali. | rollback | `app/components/voice/VoiceAvatarLab.tsx`, `BRIDGE.md` | Kod dogrulandi; gercek ikinci katilimcili video kaniti eksik. | local | 0 | 1 |
| 8 | Runtime teslim kontrolu | `app/avatar.glb` contract yolu tamamlanirsa teslim denetimi asset'i dogrudan gorur. | success | `app/avatar.glb`, `avatar.glb` | Contract yolu, kok dizin ve app asset dizininde GLB boyutu dogrulandi. | local | 1 | 1 |

Toplam final hafta ratchet: 5 success + 2 rollback + 1 teslim duzeltmesi.  
Not: APK ve 3 dakikalik video ayri teslim kanitidir; bu ledger kod ve forge dongusunu kaydeder.

---

## Cycle 1 - Home Ana Butonu

Baslangic: 2026-05-19 09:53  
Kutu: 15dk  
Rapor: `audit-reports/report-01-yellow-button.md`  
Ekran: `/`

READ: Kullanici Home ekranindaki ana butonu isaretleyip sari yapilmasini istedi.  
LOCATE: Buton stilleri `app/app/(tabs)/index.tsx` icinde bulundu.  
HYPOTHESIZE: Cok acik sari okunabilirligi dusurur; amber ton sade kalir.  
REPAIR: Aktif buton `#CA8A04`, disabled ton `#FDE68A` yapildi.  
TEST: TypeScript ve lint calisti.  
VERIFY: Buton artik mavi degil, amber aksiyon rengiyle gorunuyor.  
COMMIT: `87a812f` - `[FORGE: /] Home ana butonu sari yapildi - 1kg`

## Cycle 2 - Urun Adi

Baslangic: 2026-05-19 10:05  
Kutu: 15dk  
Rapor: `audit-reports/report-02-title-name.md`  
Ekran: `/`

READ: Audit notu Axon AI adinin odev baglamina uzak kaldigini soyledi.  
LOCATE: Header title ve alt aciklama `index.tsx` icinde bulundu.  
HYPOTHESIZE: `Nokta Fikir` adi hem fikir analizini hem Nokta audit baglamini tasir.  
REPAIR: Baslik ve rapor basligi Nokta Fikir olarak guncellendi.  
TEST: TypeScript ve lint pass.  
VERIFY: Home ve sonuc metinleri ayni urun adini kullaniyor.  
COMMIT: `a038f0f` - `[FORGE: /] Home basligi Nokta Fikir yapildi - 1kg`

## Cycle 3 - Aksiyon Label'i

Baslangic: 2026-05-19 10:12  
Kutu: 15dk  
Rapor: `audit-reports/report-03-button-label.md`  
Ekran: `/`

READ: Kullanici `Analiz Et` metninin fazla genel kaldigini soyledi.  
LOCATE: Step render icindeki buton text'i bulundu.  
HYPOTHESIZE: `Fikri Analiz Et` butonun hangi veriye calistigini aciklar.  
REPAIR: Buton label'i degistirildi; stil ayni birakildi.  
TEST: TypeScript ve lint pass.  
VERIFY: Aksiyon amaci daha net okunuyor.  
COMMIT: `5b7d880` - `[FORGE: /] Ana buton metni netlestirildi - 1kg`

## Cycle 4 - Rollback: Neon Yesil

Baslangic: 2026-05-19 10:20  
Kutu: 15dk  
Rapor: `audit-reports/report-04-rollback.md`  
Ekran: `/`

READ: Neon yesil buton denemesi istendi.  
LOCATE: Amber buton rengi onceki cycle'da ratchet edilmisti.  
HYPOTHESIZE: Neon yesil dikkat ceker ama sade track'i bozar.  
REPAIR: Kalici kod degisikligi uygulanmadi.  
TEST: Renk karari onceki basarili cycle ile karsilastirildi.  
VERIFY: UI gurultusu artacagi icin istek rollback edildi.  
ROLLBACK: `d69981f` - neon yesil hipotezi iptal edildi.

## Cycle 5 - Voice Visualizer

Baslangic: 2026-05-26 16:58  
Kutu: 20dk  
Rapor: `audit-reports/report-05-voice-bars.md`  
Ekran: `/voice`

READ: Mikrofona konusunca barlarin ziplamasi, sessizlikte sonmesi ve avatar sinyalinin ayni enerjiyle hareket etmesi istendi.  
LOCATE: Yeni final hafta yuzeyi `VoiceAvatarLab.tsx` olarak kuruldu; tab route `app/app/(tabs)/voice.tsx`.  
HYPOTHESIZE: Native'de `expo-av` metering, web'de WebAudio RMS/FFT ile tek sinyal modeli kurulursa gecikme dusuk kalir.  
REPAIR: `dbToRms`, `pushLevel`, `WaveBars` ve mikrofon baslat/durdur akisi eklendi. 28 barlik visualizer ayni RMS sinyalinden besleniyor.  
TEST: `npx tsc --noEmit` ve `npm run lint` pass.  
VERIFY: Sampling interval native tarafta 80ms; hedeflenen <200ms hissi icin sinyal yumusatma React state ile sinirli tutuldu.  
COMMIT: local - `[FORGE: Voice] Add metered voice visualizer - 1kg`

## Cycle 6 - Avatar Persona ve Rapor Okuma

Baslangic: 2026-05-26 17:18  
Kutu: 20dk  
Rapor: `audit-reports/report-06-persona-switch.md`  
Ekran: `/voice`

READ: Avatarin raporu farkli tonlarla okuyabilmesi ve Junior/Senior ayriminin hissedilmesi istendi.  
LOCATE: Persona state'i, TTS ayarlari ve avatar vurgu rengi `VoiceAvatarLab.tsx` icine yerlestirildi.  
HYPOTHESIZE: Iki persona icin ayri rate/pitch, voice secimi ve renk vurgusu yeterli davranissal ayrimi verir.  
REPAIR: `Junior Ben` ve `Senior Ben` eklendi. `expo-speech` ile rapor okuma, persona intro ve TTS rate/pitch farklari baglandi. `PERSONAS.md` davranisi belgeledi.  
TEST: `npx tsc --noEmit` ve `npm run lint` pass.  
VERIFY: Persona butonlari sabit iki kolon; secim hem ses tonunu hem avatar agiz/vurgu rengini degistiriyor.  
COMMIT: local - `[FORGE: Persona] Add junior senior voice modes - 1kg`

## Cycle 7 - Rollback: Expert Bridge Kaniti

Baslangic: 2026-05-26 17:38  
Kutu: 20dk  
Rapor: `audit-reports/report-07-stuck-bridge.md`  
Ekran: `/voice`

READ: Iki ardil FAIL/ROLLBACK veya STUCK sonucunda uygulama icinden uzmana baglanma isteniyor.  
LOCATE: Forge sonuc butonlari, `consecutiveBad` hesabi, `isStuck` bayragi ve Jitsi URL'i `VoiceAvatarLab.tsx` icinde.  
HYPOTHESIZE: Son iki cycle bloklayiciysa `Uzmana Baglan` aktif olur; native'de WebView, web'de Jitsi URL kullanilir.  
REPAIR: `PASS / FAIL / ROLLBACK / STUCK` cycle butonlari ve Jitsi bridge paneli eklendi. `BRIDGE.md` provider ve kayit formunu belgeliyor.  
TEST: `npx tsc --noEmit` ve `npm run lint` pass.  
VERIFY: Kod yolu calisir; ancak gercek ikinci katilimcili 60sn ekran paylasimli video henuz eklenmedigi icin teslim kaniti acisindan rollback tutuldu.  
ROLLBACK: local - `[FORGE: Bridge] Keep expert bridge coded, wait for real proof - 0kg`

## Cycle 8 - Teslim Asset Duzeltmesi

Baslangic: 2026-05-26 18:20  
Kutu: 20dk  
Rapor: Runtime teslim kontrolu  
Ekran: dosya paketi

READ: Teslim kosulu `app/avatar.glb` dosyasini contract path olarak bekliyor; manuel kontrolde kok `avatar.glb` de faydali olabilir.  
LOCATE: Uygulama import'u `app/assets/avatar.glb` dosyasina bagliydi.  
HYPOTHESIZE: GLB'yi sadece tasimak uygulamayi bozabilir; `app/avatar.glb` ve kok kopya eklemek hem teslimi hem app import yolunu korur.  
REPAIR: `app/assets/avatar.glb`, `app/avatar.glb` ve kok `avatar.glb` ayni Avaturn export olarak tutuldu.  
TEST: Uc dosyanin da mevcut oldugu ve ayni boyutta oldugu kontrol edildi.  
VERIFY: Expo asset yolu calismaya devam eder; contract denetimi `app/avatar.glb` dosyasini gorur.  
COMMIT: local - `[FORGE: Delivery] Mirror avatar glb for contract path - 1kg`

---

## Bridge Context

Uygulama icindeki STUCK heuristigi:

- Son iki cycle sonucu `FAIL` veya `ROLLBACK` ise bridge aktif olur.
- Son cycle `STUCK` olarak isaretlenirse bridge dogrudan aktif olur.
- Native'de Jitsi `react-native-webview` icinde, web demosunda harici URL olarak acilir.

Mevcut kanit durumu:

- Kod ve UI entegrasyonu hazir.
- `BRIDGE.md` icinde gercek cagri icin kayit alani hazir.
- 60 saniyelik ikinci katilimcili video kaniti kullanici tarafindan eklenecek.

## Lessons

Cycle 1-3: AuditWidget raporu kucuk UI kararlarini dogrudan forge input'una cevirebiliyor.  
Cycle 4: Her audit istegi uygulanmaz; ratchet'i bozan fikir rollback edilir.  
Cycle 5: RMS sinyali voice-mode hissi icin yeterince dusuk gecikmeli ve stabil bir sinyal sagladi.  
Cycle 6: Avatar varyasyonu once davranis ve TTS tonu uzerinden hissedilebilir hale geldi.  
Cycle 7: Expert bridge kodla tetiklenebilir, fakat insanli gorusme kaniti teslimde ayri ve kritik bir artefacttir.  
Cycle 8: Teslim denetimi ile runtime import yolu farkli beklentilere sahip olabilir; asset kopyasi bu riski kapatti.

## Human Touch Points

1. Kullanici audit raporlariyla buton rengi, urun adi ve buton label'ini agent'a input verdi.
2. Voice ekraninda dikte raporu ve persona davranisi teslim beklentisine gore sekillendi.
3. Kullanici `avatar.glb` dosyasinin kok dizinde istenecegini belirtti; teslim paketi buna gore duzeltildi.
4. Expert bridge icin ikinci katilimci eksigi acikca not edildi; sahte gorusme yazilmadi.
