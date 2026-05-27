# IDEA — Müşterinin Geliştirici Olduğu Kompozisyon

**Submission:** 231118057-nokta-cleaner
**Track:** B (Yaratıcılık)
**Date:** 2026-05-20

> Bu dosya Audit-Forge submission'ı için **müşteri-geliştirici use case'i**ni 1-2 paragrafta açıklıyor (challenge zorunlu). Önceki Track C teslimimdeki vizyon belgesi ve mühendislik trace'i ise README'nin "Nedir?" + "Teknoloji" bölümlerinde özetlendi.

---

## Keşfettiğim use case: "İçeriden gelen feature request"

Nokta Cleaner, dağınık notları temizleyen bir AI aracı. Klasik kullanım: müşteri notunu yapıştırır, kartları görür, onaylar/reddeder, panoya kopyalar. **Tek yönlü** bir akış — uygulamayı kullanan ile uygulamayı geliştiren ayrı insanlar.

AuditWidget girdiğinde bu rol ayrımı **kayboluyor**. Müşteri, kartlarla uğraşırken aksaklık görüyor — örnek: "Export Full Report" diyen buton sadece clipboard'a kopyalıyor; "Approve" satırı dar telefonda iki satıra sarılıyor; ilk açılışta placeholder ne yapacağımı anlatmıyor. **Eskiden**: bu insan bir feedback formuna yazar, ticket açar, en iyi ihtimalle 2 hafta sonra fix gelir. **Şimdi**: aynı anda hem FAB'a basıp `.md` raporu üreten müşteri, hem o raporu coding agent'a yedirip 5 dakikada PR açan geliştirici. Aynı kişi. Aynı oturum.

Bu kompozisyonun beklenmedik yan etkisi: **feature request'lerin kalitesi yükseliyor**. Çünkü müşteri sadece "şikayet" değil, ekran görüntüsü + crop region + source ipucu + hipotez paketleyen bir rapor üretiyor. Audit widget müşteriyi farkında olmadan biraz "engineer'a" çeviriyor — yarısı kullanıcı, yarısı issue-author. Bu da agent'ın `LOCATE` adımını saniyelere düşürüyor (bizim 3 raporda zaten satır numaraları var). Tour-agent veya başka bir doc-walker agent ile kompozisyon yapılsa, raporlar daha da otomatize olur: "bu aksaklığı tarif et" → "tour-agent UI flow'undan kontekst çek" → "audit widget burn-in ekle" → çıktı tek `.md`. Müşteri yazmaz bile, sadece **fenomen gösterir**, paket otomatik oluşur.

---

## Niye sade, niye yaratıcı

**Sade** — çünkü mevcut araçların kompozisyonu. AuditWidget zaten var, coding agent zaten var, host app zaten var. Yeni primitif yazmıyorum. Sadece üçünü tek bir döngü altına oturtuyorum.

**Yaratıcı** — çünkü bu kompozisyon "issue tracker"ı bypass ediyor. GitHub/Linear/Jira tarih hafıza için harika; ama küçük UX bug'larının lifetime'ı dakikalar olmalı, gün değil. Bu kompozisyonda **müşteri ile commit arasındaki süre = bir cycle = 15 dakika**. Issue açılmıyor; rapor doğrudan değişikliğe dönüşüyor. Müşteri uygulamadan çıkmadan PR ekranına bakıyor.

---

## Somut delil — bu submission'daki üç rapor

| Rapor | Müşterinin sözü | Geliştiricinin işi |
|---|---|---|
| [`audit-reports/01-home-empty-placeholder.md`](./audit-reports/01-home-empty-placeholder.md) | *"placeholder ne demek istiyor anlamadım, örnek olsa iyiydi"* | InputSection.js'e `sampleData` prop'u + tek mock constant |
| [`audit-reports/02-ideacard-actionrow-overflow.md`](./audit-reports/02-ideacard-actionrow-overflow.md) | *"butonlar dar ekranda sarılıyor, çirkin"* | action row'u primary/secondary ayır, touch target 32→44px |
| [`audit-reports/03-sessionreport-export-clipboard-only.md`](./audit-reports/03-sessionreport-export-clipboard-only.md) | *"export dedi ama dosya gelmedi, clipboard'a attı"* | label rename (quick) veya gerçek `.md` export + share-sheet (genişletilmiş) |

Hiçbiri klasik "bug": "X tıkladım çöktü". Hepsi **bir özelliğin yeniden tarifi**. Müşteri kullanırken ufak "burada şu olsa" demesinin agent-tüketilebilir formatta paketlenmesi — kompozisyonun çekirdeği bu.
