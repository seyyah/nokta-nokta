# FORGE Ledger

Bu ledger yalniz gercek cihazda uretilmis audit raporlarindan dogan gercek
donguleri kaydeder. Uygulama implementasyon commitleri teslim altyapisidir; audit
girdisi olmadan success veya rollback cycle'i gibi gosterilmez.

## Hazirlik Commitleri

| Commit | Kapsam | Sonuc |
| --- | --- | --- |
| `fec1509` | Expo host ve Avaturn avatar temeli | Hazirlik |
| `c7c9fe7` | Mic waveform/RMS hatti | Hazirlik |
| `0c364e9` | Avatar viseme tepkisi | Hazirlik |
| `da6ddf4` | Mirror mobil arayuzu | Hazirlik |
| `7b5cb19` | Ilk dikte/AuditWidget prototipi (Expo Go uyarlamasinda STT kaldirildi) | Hazirlik |
| `77d477e` | STUCK/Jitsi bridge ekrani | Hazirlik |
| `05f8827` | Speech oturum temizligi | Hazirlik |
| `aa5b30f` | Android release APK | Hazirlik |

## Gercek Cycle Ledger

Her kaydin girdisi `audit-reports/` altindaki gercek cihaz raporuna referans verir.

| Cycle | Rapor | Hipotez | Sonuc | Degisen dosyalar | Test sonucu | Commit hash | kg | Human touch points |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `audit-reports/02-forge-stuck-visibility.md` | STUCK eylemi listenin sonundan ilk gorunume tasinirsa uzman gecisi fark edilir olur. | SUCCESS | `app/src/screens/ForgeScreen.tsx` | `npm run typecheck`; `npx expo-doctor` 18/18 | `3832c52` | 4 | Kullanici cihaz notu; agent tek ekran duzeltmesi |
| 2 | `audit-reports/03-bridge-sharing-status.md` | Odaya girmeden yesil `EKRAN PAYLASIMI HAZIR` rozeti gostermek durumu netlestirir. | ROLLBACK | `none` (prototip geri alindi) | `npm run typecheck` gecti; dogrulamada rozetin oturum/izin oncesi yanlis durum bildirdigi bulundu | `-` | 4 | Agent hipotezi reddetti; ek yonlendirme yok |

Kalan minimum cycle: en az bir `SUCCESS`.
