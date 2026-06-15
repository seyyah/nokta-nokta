# Audit Reports Folder

Bu klasordeki final raporlar, calisan uygulama icindeki `AuditWidget` akisi kullanilarak uretilmis gercek artefaktlar olmalidir.

## Required Rules

- Final raporlar uygulama icinden capture + annotation + note + export adimlariyla uretilmelidir.
- Her Markdown dosyasi tam olarak bir audit note icermelidir.
- Her final rapora ilgili burn-in ekran goruntusu eslik etmelidir.
- Statik olarak elle yazilmis Markdown dosyalari final forge input'u sayilmaz.
- Base64 screenshot gomusu bilincli olarak kullanilmaz.
- Final Markdown dosyalari telefon-local `file:///data/user/...` yollarini icermemelidir.
- Final Markdown dosyalari goreli bir path kullanmalidir:
  `./screenshots/<slug>.png`
- Widget disinda uretilmis placeholder notlar varsa bunlar `placeholders/` altina tasinmali veya `PLACEHOLDER_` on eki ile acikca isaretlenmelidir.
- Eski `bug-report-*.md` coklu export dosyalari gercek capture kaynakli olsa bile tek-note forge input'u sayilmaz ve `archive/` altinda tutulmalidir.

## Standalone Export Workflow

1. Uygulamayi cihazda veya emulator'de calistirin.
2. Audit FAB ile capture akisina girin ve bir note kaydedin.
3. Audit note list ekranini acin.
4. Ilgili note kartindaki `Markdown` aksiyonuna dokunun.
5. Ayni note icin `Screenshot` aksiyonunu da kullanin.
6. Uretilen tek-note `.md` dosyasini kendinize paylasin.
7. Ayri uretilen `.png` screenshot dosyasini da kendinize paylasin.
8. Markdown dosyasini bu klasore kopyalayin.
9. Screenshot dosyasini `audit-reports/screenshots/` altina kopyalayin.
10. Gerekirse repo icinde daha kisa bir ada cevirin:
   - `01-home-feature-request.md`
   - `02-questions-progress-bar.md`
   - `03-result-copy-share.md`
11. Markdown icindeki image path'in su formatta oldugunu kontrol edin:
   `./screenshots/<file>.png`
12. Farkli ekranlardan en az 3 ayri note icin ayni akisi tekrarlayin.

## Portability Notes

- Yeni export akisi her note icin mobil tarafta bir export bundle hazirlar:
  - `<slug>.md`
  - `screenshots/<slug>.png`
- Markdown, screenshot'i yalnizca goreli path ile referanslar.
- Bu sayede Markdown okunabilir kalir ve screenshot ayri dosya olarak commit edilebilir.

## Current Status

Eski kombine export artik final kullanim icin uygun olmadigindan `archive/LEGACY_COMBINED_EXPORT_DO_NOT_USE_bug-report-2026-05-17-14-56.md` altina tasindi. Final assignment icin burada en az 3 adet tek-note Markdown raporu ve `screenshots/` altinda karsilik gelen PNG dosyalari yer almalidir.
