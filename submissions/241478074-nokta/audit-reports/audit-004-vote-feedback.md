# Bug Raporu — Nokta

**Tarih:** 14.05.2026 15:00
**Toplam:** 1 not · 🔴 1 açık · ✅ 0 düzeltildi

---

## Ekran: IdeaDetailScreen

### 🔴 #1 — Destekle butonuna basıldığında hiçbir görsel geri bildirim yok

![Screenshot](./screenshots/audit-004-screenshot.png)

> ⚠️ *Gerçek uygulamada bu alan burn-in'li ekran görüntüsü içerir.*
> *Sarı dikdörtgen: IdeaDetailScreen'de Destekle butonu.*
> *Burn-in koordinatları: x=20, y=400, width=335, height=52*

```
┌─────────────────────────────────────────────┐
│  SESSIZ ALARM                               │
│  Yaşam · @zeynep_k                          │
│                                             │
│  Sabah alarmı yerine sadece titreşimle…    │
│                                             │
│  ╔═════════════════════════════════════╗   │
│  ║  [BURN-IN: SARJ KUTU]              ║   │
│  ║  ▲ Destekle               142      ║   │
│  ║  Tıklayınca hiçbir şey olmadı!     ║   │
│  ╚═════════════════════════════════════╝   │
│                                             │
│  🔖 Kaydet                                  │
└─────────────────────────────────────────────┘
```

- **Durum:** Açık
- **Zaman:** 14.05.2026 15:00
- **Raporlayan:** track-b-tester
- **Ekran:** IdeaDetailScreen
- **Sorun türü:** UX eksikliği (Missing Feedback)

**Not:**
"Destekle" butonuna bastığımda sayı değişiyor ama butonda hiçbir animasyon veya geri bildirim yok. Tıkladım mı tıklamadım mı belli olmuyor. Küçük bir scale animasyonu veya renk değişimi olsa çok daha iyi hissettirirdi.

**Önerilen davranış:**
- Tap → `Animated.spring` scale 1 → 0.92 → 1 (spring bounce)
- Opsiyonel: Haptic feedback (cihaz destekliyorsa)

**Forge için bağlam:**
- Bileşen: `app/app/idea/[id].tsx`
- Ekleme: `useRef(new Animated.Value(1))` + `Animated.sequence`
- Cycle 4'te expo-haptics dep sorunu yaşandı → Cycle 5'te sadece Animated ile çözüldü
