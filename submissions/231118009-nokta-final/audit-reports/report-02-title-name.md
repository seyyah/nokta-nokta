# Nokta Audit Report

- **Report ID:** 231118009-r02-title-name
- **Screen:** /
- **Captured:** 2026-05-19 10:05
- **Device:** web preview
- **Annotations:** 1

## Finding 1

- **Region:** x=24, y=28, width=230, height=82
- **Selected UI:** Home ekranindaki ust baslik ve alt aciklama
- **Note:** ismi kotu, Axon AI yerine uygulamanin nokta odevine daha uygun bir adi olsun.
- **Expected:** Baslik daha acik ve odevle iliskili olmali. Alt aciklama da Ingilizce "Powered by" yerine Turkce olmali.
- **Observed:** Baslik `Axon AI`, alt metin `Powered by Nokta AI`.

## Agent Instructions

Use the READ -> LOCATE -> HYPOTHESIZE -> REPAIR -> TEST -> VERIFY -> COMMIT/ROLLBACK loop.

1. Home ekraninda `Header title` verilen yeri bul.
2. `Axon AI` basligini `Nokta Fikir` yap.
3. Alt aciklamayi Turkce ve audit baglamina uygun hale getir.
4. Rapor ekran basligini da ayni isimle tutarli yap.
