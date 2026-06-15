# Bug Raporu — Nokta

**Tarih:** 14.05.2026 11:30
**Toplam:** 1 not · 🔴 1 açık · ✅ 0 düzeltildi

---

## Ekran: HomeScreen

### 🔴 #1 — Boş liste durumunda ekran tamamen boş

![Screenshot](./screenshots/audit-002-screenshot.png)

> ⚠️ *Gerçek uygulamada bu alan burn-in'li ekran görüntüsü içerir.*
> *Sarı dikdörtgen: HomeScreen'de "Öne Çıkanlar" başlığının altındaki boş alan.*
> *Burn-in koordinatları: x=20, y=280, width=335, height=200*

```
┌─────────────────────────────────────────────┐
│  BUGÜNÜN FIRSATI                            │
│  Aklındaki fikri nokta'ya düş.              │
│  [Nasıl çalışır? →]                         │
│                                             │
│  ÖNE ÇIKANLAR                               │
│                                             │
│  ╔═════════════════════════════════════╗   │
│  ║  [BURN-IN: SARJ KUTU]              ║   │
│  ║  Burada hiçbir şey yok — boş!     ║   │
│  ║  Kullanıcı ne yapacağını bilmiyor  ║   │
│  ╚═════════════════════════════════════╝   │
│                                             │
│                                             │
│  Tüm Fikirleri Gör →                       │
└─────────────────────────────────────────────┘
```

- **Durum:** Açık
- **Zaman:** 14.05.2026 11:30
- **Raporlayan:** track-b-tester
- **Ekran:** HomeScreen
- **Sorun türü:** UX eksikliği (Empty State)

**Not:**
İlk kez açtığımda veya filtre sıfırlandığında liste tamamen boş görünüyor. Ne yapacağımı bilmiyorum. "Henüz fikir yok" gibi bir mesaj ve belki "İlk fikri sen ekle" gibi bir CTA olsa yönlendirici olurdu.

**Önerilen davranış:**
- Boş liste → 🌱 emoji + "Henüz öne çıkan fikir yok" metni
- Altına "Tüm Fikirlere Git →" CTA
- Minimal, temiz tasarım — kartlarla uyumlu

**Forge için bağlam:**
- Bileşen: `app/app/index.tsx`
- Ekleme noktası: `FEATURED_IDEAS.map()` çağrısının önünde koşul kontrolü
- Yeni bileşen: `app/src/components/EmptyState.tsx`
