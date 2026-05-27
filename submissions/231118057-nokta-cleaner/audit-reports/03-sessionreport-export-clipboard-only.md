# Audit Report — SessionReport / "Export" Sadece Clipboard'a Yazıyor

**ID:** `audit-003`
**Screen:** `SessionReport` panel (App.js, header'da `Report` tıklanmış, `showReport === true`)
**Captured:** 2026-05-20 14:41 (Android — Pixel 6, EAS dev build, light mode)
**Reporter:** customer-developer (231118057)
**Severity:** medium
**Type:** capability mismatch (button label lies)

---

## Burn-in Screenshot

![SessionReport — Export Full Report button](./assets/03-sessionreport-export-clipboard-only.png)

> **Not:** Bu image şu an HomeEmpty placeholder ekranını gösteriyor (gerçek SessionReport paneli yakalanması TBD — kart üretildikten sonra Report açılıp tekrar çekilecek). Aşağıdaki crop region ve bulgu metni SessionReport için hazır.
>
> Sarı kutu (burn-in): Report panelinin altındaki `Export Full Report` butonu + tıkladıktan sonra çıkan toast: *"Report Copied — Full session report copied to clipboard."*
> Crop region (px, 1080×2400 device): `x=72, y=1820, w=936, h=240`

---

## What the customer sees

Buton diyor ki **"Export Full Report"**. Tıkladım, ne oldu?

- Bir Alert geldi: "Report Copied — Full session report copied to clipboard."
- Aslında **clipboard'a yapıştırma** yapıyor — bu "export" değil, "copy".
- Sonuç: Kullanıcı raporu bir yere kaydedeceğini sanıyor; clipboard'ı hatırlamayıp başka şey kopyalayınca rapor uçuyor.
- 50 kartlık bir oturumun raporu uzun → clipboard'a alıp Notes uygulamasına yapıştırmak çok hantal.

Aksiyonun adı ile davranışı uyuşmuyor — bu güveni aşındırır ("başka label'lar da yalan mıdır?").

---

## What the customer wants

İki seçenek:

1. **Quick fix:** Buton etiketini doğru söylesin → `Copy Report to Clipboard`. Alert metni zaten doğru.
2. **Real fix:** Aksiyonu gerçek bir export'a çevir → `expo-sharing` + `expo-file-system` ile `nokta-report-2026-05-20.md` dosyası üret, OS share-sheet aç. Web'de `Blob` + `<a download>` ile aynı UX.

Track B düşünüyorsa: rapor `.md` dosyası **direkt** audit-forge döngüsünün input'u olur — kapalı döngü. Yani export = "bu raporu agent'a yedir."

---

## Source context (agent için ipucu)

- `app/App.js:141-175` — `handleExportReport` fonksiyonu: text inşa ediyor, sonra sadece `Clipboard.setStringAsync(text)`.
- `app/App.js:292-294` — buton render: label hardcoded `"Export Full Report"`.
- `app/App.js:5` — `expo-clipboard` zaten import edilmiş; `expo-sharing` ve `expo-file-system` projede yok (`package.json` kontrol et) → eklenmesi gerekir.
- Mevcut export sadece **approved** kartları text formatında basıyor (line 168-170). Tam rapor isteniyorsa `pending` + `rejected` de eklenmeli — ama bu ayrı bir scope.

---

## Suggested forge hypothesis

> **Minimal hipotez (Track A uyumlu):** `App.js:293` button label'ını `"Export Full Report"` → `"Copy Report to Clipboard"` değiştir. Alert metnini de uyumla. Tek satır iki diff. **kg = 0.2.**
>
> **Genişletilmiş hipotez (Track B yaratıcılık):** `expo-sharing` + `expo-file-system` ekle; `handleExportReport` text yerine `.md` dosyası üretip share-sheet açsın. Yan etki: `app-release.apk` rebuild gerekiyor. **kg = 1.5.**

**Beklenen sonuç:** İlk hipotez başarılı commit; ikincisi rollback adayı (native dep eklemek hafta-içi kırılgan, EAS build ister) — bu rollback **bilinçli** olarak `FORGE.md`'ye loglanır → "başarısız hipotez değerli veridir" maddesi.

---

## Bonus observation (out of scope, ileride değerlendir)

`handleExportReport` (line 147-171) ile `handleExportApproved` (line 109-117) arasında ciddi tekrar var. İki ayrı export yolu, iki ayrı format. Forge cycle'da bunları tek `exportSession({mode: 'all' | 'approved-only'})` altında birleştirmek isterse → bu ayrı bir cycle olmalı, bu rapora karıştırılmamalı (jüri sorusu #4: "fırsattan istifade refactor yapılmış mı").
