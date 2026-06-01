# Bug Raporu — Nokta

**Tarih:** 14.05.2026 10:15
**Toplam:** 1 not · 🔴 1 açık · ✅ 0 düzeltildi

---

## Ekran: IdeaDetailScreen

### 🔴 #1 — "Kaydet" butonu eksik

![Screenshot](./screenshots/audit-001-screenshot.png)

> ⚠️ *Gerçek uygulamada bu alan burn-in'li ekran görüntüsü içerir.*
> *Sarı dikdörtgen: IdeaDetailScreen'de voteBtn'in hemen altındaki boş alan.*
> *Burn-in koordinatları: x=20, y=480, width=335, height=52*

```
┌─────────────────────────────────────────────┐
│  NEFES ANTRENMAني                           │
│  Sağlık · @can_y                            │
│                                             │
│  Gün içinde kısa nefes egzersizleri...     │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ▲ Destekle                    214   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ╔═════════════════════════════════════╗   │
│  ║  [BURN-IN: SARJ KUTU]              ║   │
│  ║  Bu alana "Kaydet" butonu gelmeli  ║   │
│  ╚═════════════════════════════════════╝   │
│                                             │
│  Yorumlar (2)                               │
└─────────────────────────────────────────────┘
```

- **Durum:** Açık
- **Zaman:** 14.05.2026 10:15
- **Raporlayan:** track-b-tester
- **Ekran:** IdeaDetailScreen
- **Sorun türü:** Eksik özellik (Feature Request)

**Not:**
Bir fikri beğeniyorum ve sonra görmek istiyorum ama geri döndüğümde tekrar bulmak zor. "Kaydet" veya "Bookmarkle" gibi bir özellik olsa harika olurdu. Oylama butonunun hemen altına eklenebilir.

**Önerilen davranış:**
- 🔖 Kaydet butonu → AsyncStorage'a idea ID yazar
- Uygulama tekrar açıldığında "Kaydettiklerim" listesi görünür
- Kaydedilmiş fikir farklı bir renk/ikon ile belirtilir

**Forge için bağlam:**
- Bileşen: `app/app/idea/[id].tsx`
- Ekleme noktası: `voteBtn` style bloğunun altı
- State: `useSavedIdeas` custom hook önerilir
