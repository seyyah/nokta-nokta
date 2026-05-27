# Audit Report — HomeEmpty / Placeholder Belirsiz

**ID:** `audit-001`
**Screen:** `HomeEmpty` (App.js root, `InputSection` mounted, `ideas.length === 0`)
**Captured:** 2026-05-20 14:12 (Android — Pixel 6, EAS dev build)
**Reporter:** customer-developer (231118057)
**Severity:** medium
**Type:** copy / onboarding

---

## Burn-in Screenshot

![HomeEmpty — placeholder generic](./assets/01-home-empty-placeholder.png)

> Sarı kutu (burn-in): `TextInput`'un placeholder satırı — *"Paste your raw, messy notes..."*
> Crop region (px, 1080×2400 device): `x=72, y=412, w=936, h=64`

---

## What the customer sees

İlk açılışta uygulamanın ne beklediği belirsiz. Placeholder *"Paste your raw, messy notes..."* diyor ama:

- "raw notes" ne demek? WhatsApp export mu? Toplantı transkripti mi? Bullet list mi?
- Format örneği yok → kullanıcı boş input'a bakıp geri çıkıyor (cold-start churn).
- "Analyze Data" butonu disabled, neden disabled olduğu (en az 1 karakter gerekiyor) hiçbir yerde söylenmiyor.

İlk 10 saniye içinde kullanıcı "ben buraya ne yapıştıracağım?" sorusuyla yalnız kalıyor.

---

## What the customer wants

Placeholder iki katmanlı olsun:

1. **Ana satır:** kısa imperative (ör. *"Paste WhatsApp export, meeting notes, or any messy text..."*)
2. **Alt-hint satırı:** input altında küçük gri yazı → *"Tip: 50+ satır en iyi sonucu verir. Timestamp ve metadata otomatik temizlenir."*

Veya: input boşken altta tek tıklanabilir bir **"Try with sample data"** butonu → mock WhatsApp export'u doldurup analyze ediyor. Cold-start'ı sıfırlıyor.

---

## Source context (agent için ipucu)

- `app/src/components/InputSection.js:37` — `placeholder` prop tek satır, hardcoded EN.
- `app/src/components/InputSection.js:13-17` — `isEmpty` state zaten var, sample-data CTA kolayca eklenebilir.
- `app/App.js:65-80` — `handleProcessNotes(text)` zaten string alıyor; sample injection için ek interface gerekmiyor.
- i18n yok — şu an EN hardcoded, TR sample text eklenirse hardcoded TR bir constant yeter.

---

## Suggested forge hypothesis

> `InputSection`'a opsiyonel `sampleData: string | null` prop'u ekle. Prop verildiğinde ve `isEmpty` iken input altında dashed-border bir **"Try sample"** chip render et; basınca `setText(sampleData)` çağırır. `App.js`'te tek mock string sabitle (≤400 char). Bu, tek dosya iki diff + tek constant — Track A minimal disipline uyar.

**Expected diff:** `InputSection.js` (~12 satır), `App.js` (~3 satır constant).
**Risk:** Sample text TR ise dark mode kontrast OK; placeholder rengi `theme.placeholder` zaten yeterli.
