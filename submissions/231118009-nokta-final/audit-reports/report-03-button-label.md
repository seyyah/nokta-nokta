# Nokta Audit Report

- **Report ID:** 231118009-r03-button-label
- **Screen:** /
- **Captured:** 2026-05-19 10:12
- **Device:** web preview
- **Annotations:** 1

## Finding 1

- **Region:** x=24, y=318, width=332, height=52
- **Selected UI:** Home ekranindaki ana aksiyon butonu metni
- **Note:** tus calisiyor ama ne yaptigi cok genel duruyor. "Analiz Et" yerine "Fikri Analiz Et" yazsin.
- **Expected:** Buton metni kullaniciya fikri analiz edecegini daha net soylemeli.
- **Observed:** Buton metni `Analiz Et`.

## Agent Instructions

Use the READ -> LOCATE -> HYPOTHESIZE -> REPAIR -> TEST -> VERIFY -> COMMIT/ROLLBACK loop.

1. Ana aksiyon butonunun Text icerigini bul.
2. `Analiz Et` metnini `Fikri Analiz Et` olarak degistir.
3. Button style'ina dokunma.
