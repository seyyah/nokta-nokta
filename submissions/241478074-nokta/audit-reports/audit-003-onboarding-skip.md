# Bug Raporu — Nokta

**Tarih:** 14.05.2026 13:45
**Toplam:** 1 not · 🔴 1 açık · ✅ 0 düzeltildi

---

## Ekran: OnboardingScreen

### 🔴 #1 — "Atla" tuşu onay sormadan doğrudan geçiyor

![Screenshot](./screenshots/audit-003-screenshot.png)

> ⚠️ *Gerçek uygulamada bu alan burn-in'li ekran görüntüsü içerir.*
> *Sarı dikdörtgen: OnboardingScreen'de sol alttaki "Atla" butonu.*
> *Burn-in koordinatları: x=20, y=680, width=155, height=48*

```
┌─────────────────────────────────────────────┐
│                                             │
│  ● ○ ○                                      │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │         💡                          │   │
│  │   Fikri yakala                      │   │
│  │   Aklına gelen her fikri anında…    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ╔══════════╗   ╔══════════════════════╗   │
│  ║  [BURN] ║   ║  İleri →             ║   │
│  ║  Atla   ║   ║                      ║   │
│  ╚══════════╝   ╚══════════════════════╝   │
└─────────────────────────────────────────────┘
```

- **Durum:** Açık
- **Zaman:** 14.05.2026 13:45
- **Raporlayan:** track-b-tester
- **Ekran:** OnboardingScreen
- **Sorun türü:** UX aksaklığı (Accidental Action)

**Not:**
"Atla" butonuna yanlışlıkla bastım ve onboarding'i tamamlamadan geçtim. Sonra "nasıl çalışır" linkini tekrar bulmak zorunda kaldım. Bir confirm alert ya da "geri dön" seçeneği olsa iyi olurdu.

**Önerilen davranış:**
- "Atla" → `Alert.alert("Onboardingden çıkmak istiyor musun?", "", [Hayır / Evet, atla])`
- Ya da: "Atla" yerine görünmez yap, sadece step 1'de göster

**Forge için bağlam:**
- Bileşen: `app/app/onboarding.tsx`
- Ekleme noktası: `skip` TouchableOpacity `onPress` handler
- Tek satır değişiklik: `router.replace('/')` → `Alert.alert(…)`

# Audit Report 4
