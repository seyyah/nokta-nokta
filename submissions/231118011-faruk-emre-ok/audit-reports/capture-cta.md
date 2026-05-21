# Audit Report: Capture CTA

![Burn-in screenshot](assets/capture-burnin.png)

## Ekran Adi

Capture (`/`)

## Musteri Notu

CTA satiri altta sikisik duruyor; kullanici rapor almak isterken ana is sinyali ile audit FAB'i ayni bolgeye yigilmis gibi hissediyor.

## Selection Bounds

```json
{ "x": 38, "y": 602, "width": 304, "height": 86 }
```

## Agent Input

READ: Capture ekranindaki alt aksiyon bolgesini incele.

LOCATE: `app/src/NoktaScreen.tsx` ve `app/src/screens.ts`.

HYPOTHESIZE: Alt bant ile FAB baslangic konumu arasinda daha net bosluk gerekir.

REPAIR: Minimal stil ayari yap; audit mount veya deps sozlesmesine dokunma.

VERIFY: Capture ekraninda alt metin okunur kalmali ve audit FAB route bilgisini Capture olarak almali.
