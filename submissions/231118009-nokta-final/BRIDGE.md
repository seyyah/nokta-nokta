# BRIDGE.md - Expert Video Bridge

## Trigger

Uygulama icindeki forge heuristigi su kuralla calisir:

`FAIL` veya `ROLLBACK` iki cycle ust uste gelirse, ya da cycle sonucu `STUCK` isaretlenirse `Uzmana Baglan` butonu aktif olur.

## Provider

Provider: Jitsi Meet  
Room: `nokta-231118009-forge-bridge`  
URL: `https://meet.jit.si/nokta-231118009-forge-bridge#config.prejoinPageEnabled=false`

Jitsi ses, kamera ve ekran paylasimini ayni odada destekler. Native uygulamada `react-native-webview` icinde acilir; web demosunda ayni URL harici tarayici sekmesinde acilir.

## Demo Call Capture Sheet

Durum: Uygulama tarafindaki bridge entegrasyonu hazir. Asagidaki alanlar 60 saniyelik gercek uzman gorusmesi ve ekran paylasimli demo video cekildikten sonra doldurulacak.

Demo video referansi: https://youtube.com/shorts/4GezA5Kqft8?si=aC-PpiQvOK4LVyuG

Demo akisi:

1. Voice tab acilir.
2. `FAIL` ve `ROLLBACK` arka arkaya isaretlenir.
3. `Uzmana Baglan` aktif olur.
4. Jitsi odasina sinif arkadasi katilir.
5. Ekran paylasimi acilir ve stuck forge karari birlikte yorumlanir.
6. Uzmanin karar ozeti bir sonraki FORGE cycle input'u olarak kullanilir.

## Real Call Summary

Tarih/saat:  
Uzman/sinif arkadasi:  
Sure:  
Ekran paylasiminda gosterilen problem:  
Uzman karari:  
Sonraki forge input'u:  
Risk/not:

## Bridge Context For Next Cycle

Uzman onerisi icin kullanilacak format:

```md
## Expert Bridge Note

Problem:
Karar:
Sonraki forge input:
Risk:
```
